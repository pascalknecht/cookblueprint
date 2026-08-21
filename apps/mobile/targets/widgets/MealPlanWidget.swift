import SwiftUI
import WidgetKit

struct MealPlanDay {
    let label: String
    let isToday: Bool
    let summary: String
    var isPlanned: Bool { summary != "—" }
}

struct MealPlanWidgetEntry: TimelineEntry {
    let date: Date
    let days: [MealPlanDay]
    let signedOut: Bool
}

struct MealPlanProvider: TimelineProvider {
    func placeholder(in context: Context) -> MealPlanWidgetEntry {
        MealPlanWidgetEntry(date: Date(), days: placeholderDays(), signedOut: false)
    }

    func getSnapshot(in context: Context, completion: @escaping (MealPlanWidgetEntry) -> Void) {
        completion(MealPlanWidgetEntry(date: Date(), days: placeholderDays(), signedOut: false))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<MealPlanWidgetEntry>) -> Void) {
        Task {
            let entry = await loadEntry()
            let nextRefresh = Calendar.current.date(byAdding: .minute, value: 30, to: Date()) ?? Date().addingTimeInterval(1800)
            completion(Timeline(entries: [entry], policy: .after(nextRefresh)))
        }
    }

    private func loadEntry() async -> MealPlanWidgetEntry {
        let weekDates = miseCurrentWeekDates()
        guard let start = weekDates.first, let end = weekDates.last else {
            return MealPlanWidgetEntry(date: Date(), days: [], signedOut: false)
        }

        // Trial mode has no server account — the app mirrors local-db data here
        // instead (syncTrialWidgetData, src/widgets/sync-trial-widget-data.ts).
        if MiseShared.trialModeActive {
            let response = MiseShared.trialMealPlanData.flatMap {
                try? JSONDecoder().decode(MiseMealPlanResponse.self, from: $0)
            }
            let days = buildDays(from: response?.items ?? [], weekDates: weekDates)
            return MealPlanWidgetEntry(date: Date(), days: days, signedOut: false)
        }

        do {
            let response: MiseMealPlanResponse = try await MiseAPI.fetch(
                path: "/api/meal-plans",
                queryItems: [
                    URLQueryItem(name: "startDate", value: miseISODate(start)),
                    URLQueryItem(name: "endDate", value: miseISODate(end)),
                ]
            )
            let days = buildDays(from: response.items, weekDates: weekDates)
            return MealPlanWidgetEntry(date: Date(), days: days, signedOut: false)
        } catch MiseAPIError.notSignedIn {
            return MealPlanWidgetEntry(date: Date(), days: [], signedOut: true)
        } catch {
            return MealPlanWidgetEntry(date: Date(), days: placeholderDays(), signedOut: false)
        }
    }

    private func buildDays(from items: [MiseMealPlanEntry], weekDates: [Date]) -> [MealPlanDay] {
        weekDates.map { date -> MealPlanDay in
            let iso = miseISODate(date)
            let entriesForDay = items.filter { $0.date.hasPrefix(iso) }
            let titles = miseSortedMealTitles(for: entriesForDay)
            return MealPlanDay(
                label: miseWeekdayShort(date),
                isToday: Calendar.current.isDateInToday(date),
                summary: titles.isEmpty ? "—" : titles.joined(separator: ", ")
            )
        }
    }

    private func placeholderDays() -> [MealPlanDay] {
        miseCurrentWeekDates().map { date in
            MealPlanDay(label: miseWeekdayShort(date), isToday: Calendar.current.isDateInToday(date), summary: "—")
        }
    }
}

struct MealPlanWidgetView: View {
    var entry: MealPlanWidgetEntry

    var body: some View {
        if entry.signedOut {
            VStack(spacing: 4) {
                Text("CookBlueprint").font(.headline).foregroundColor(MiseColors.ink)
                Text(MiseWidgetCopy.signInMealPlan)
                    .font(.caption)
                    .foregroundColor(MiseColors.muted)
                    .multilineTextAlignment(.center)
            }
            .padding()
        } else {
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(MiseWidgetCopy.mealPlanEyebrow)
                        .font(.system(size: 9, weight: .bold))
                        .foregroundColor(MiseColors.brand)
                    Spacer()
                    Text(weekRange)
                        .font(.system(size: 9, weight: .bold))
                        .foregroundColor(MiseColors.muted)
                }
                Text(MiseWidgetCopy.mealPlanTitle)
                    .font(.system(size: 17, weight: .bold))
                    .foregroundColor(MiseColors.ink)
                    .padding(.bottom, 3)
                ForEach(entry.days, id: \.label) { day in
                    if day.isPlanned {
                        HStack(spacing: 8) {
                            Text(day.label)
                                .font(.system(size: 9, weight: .bold))
                                .foregroundColor(day.isToday ? MiseColors.brand : MiseColors.muted)
                                .frame(width: 36, alignment: .leading)
                            Text(day.summary)
                                .font(.system(size: 11, weight: .semibold))
                                .foregroundColor(MiseColors.ink)
                                .lineLimit(1)
                            Spacer(minLength: 0)
                        }
                        .frame(height: 32)
                        .padding(.horizontal, 10)
                        .background(day.isToday ? MiseColors.tint : .clear)
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                    } else {
                        HStack(spacing: 8) {
                            Text(day.label)
                                .font(.system(size: 9, weight: .bold))
                                .foregroundColor(MiseColors.mutedLight)
                                .frame(width: 36, alignment: .leading)
                            Rectangle()
                                .stroke(MiseColors.tint, style: StrokeStyle(lineWidth: 1, dash: [3, 3]))
                                .frame(height: 1)
                        }
                        .frame(height: 27)
                    }
                }
                HStack {
                    Text(MiseWidgetCopy.daysUnplanned(entry.days.filter { !$0.isPlanned }.count))
                        .font(.system(size: 9))
                        .foregroundColor(MiseColors.muted)
                    Spacer()
                    Text(MiseWidgetCopy.plan)
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(MiseColors.brand)
                }
                .padding(.top, 5)
                .overlay(alignment: .top) { Rectangle().fill(MiseColors.tint).frame(height: 1) }
            }
            .padding(14)
        }
    }

    private var weekRange: String {
        let dates = miseCurrentWeekDates()
        guard let start = dates.first, let end = dates.last else { return "" }
        let formatter = DateFormatter()
        formatter.locale = Locale.current
        formatter.setLocalizedDateFormatFromTemplate("MMM d")
        if MiseShared.locale == "de" || (MiseShared.locale == nil && Locale.current.languageCode == "de") {
            return "\(Calendar.current.component(.day, from: start)).–\(Calendar.current.component(.day, from: end)). \(formatter.string(from: start).components(separatedBy: " ").last ?? "")"
        }
        return "\(formatter.string(from: start))–\(Calendar.current.component(.day, from: end))"
    }
}

struct MealPlanWidget: Widget {
    let kind: String = "MealPlanWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: MealPlanProvider()) { entry in
            MealPlanWidgetView(entry: entry)
                .containerBackground(for: .widget) { MiseColors.background }
        }
        .configurationDisplayName("Meal Plan")
        .description("This week's meal plan at a glance.")
        .supportedFamilies([.systemMedium, .systemLarge])
    }
}
