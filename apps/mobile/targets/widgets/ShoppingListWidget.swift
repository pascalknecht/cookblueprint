import SwiftUI
import WidgetKit

private let maxItemsShown = 8

struct ShoppingListWidgetEntry: TimelineEntry {
    let date: Date
    let items: [String]
    let remainingCount: Int
    let signedOut: Bool
}

struct ShoppingListProvider: TimelineProvider {
    func placeholder(in context: Context) -> ShoppingListWidgetEntry {
        ShoppingListWidgetEntry(date: Date(), items: ["Milk", "Eggs", "Bread"], remainingCount: 3, signedOut: false)
    }

    func getSnapshot(in context: Context, completion: @escaping (ShoppingListWidgetEntry) -> Void) {
        completion(placeholder(in: context))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<ShoppingListWidgetEntry>) -> Void) {
        Task {
            let entry = await loadEntry()
            let nextRefresh = Calendar.current.date(byAdding: .minute, value: 30, to: Date()) ?? Date().addingTimeInterval(1800)
            completion(Timeline(entries: [entry], policy: .after(nextRefresh)))
        }
    }

    private func loadEntry() async -> ShoppingListWidgetEntry {
        // Local mode has no server account — the app mirrors local-db data here
        // instead (syncLocalWidgetData, src/widgets/sync-local-widget-data.ts).
        if MiseShared.localModeActive {
            let response = MiseShared.localShoppingListData.flatMap {
                try? JSONDecoder().decode(MiseShoppingItemsResponse.self, from: $0)
            }
            return buildEntry(from: response?.items ?? [])
        }

        do {
            let response: MiseShoppingItemsResponse = try await MiseAPI.fetch(
                path: "/api/shopping-items",
                queryItems: [URLQueryItem(name: "perPage", value: "100")]
            )
            return buildEntry(from: response.items)
        } catch MiseAPIError.notSignedIn {
            return ShoppingListWidgetEntry(date: Date(), items: [], remainingCount: 0, signedOut: true)
        } catch {
            return ShoppingListWidgetEntry(date: Date(), items: [], remainingCount: 0, signedOut: false)
        }
    }

    private func buildEntry(from items: [MiseShoppingItem]) -> ShoppingListWidgetEntry {
        let unchecked = items.filter { !$0.checked }
        let preview = Array(unchecked.prefix(maxItemsShown).map { $0.name })
        return ShoppingListWidgetEntry(date: Date(), items: preview, remainingCount: unchecked.count, signedOut: false)
    }
}

struct ShoppingListWidgetView: View {
    var entry: ShoppingListWidgetEntry

    var body: some View {
        if entry.signedOut {
            VStack(spacing: 4) {
                Text("CookBlueprint").font(.headline).foregroundColor(MiseColors.ink)
                Text(MiseWidgetCopy.signInShoppingList)
                    .font(.caption)
                    .foregroundColor(MiseColors.muted)
                    .multilineTextAlignment(.center)
            }
            .padding()
        } else if entry.items.isEmpty {
            VStack(spacing: 4) {
                Text(MiseWidgetCopy.shoppingListEyebrow).font(.system(size: 9, weight: .bold)).foregroundColor(MiseColors.brand)
                Text(MiseWidgetCopy.nothingToPickUp).font(.system(size: 14, weight: .bold)).foregroundColor(MiseColors.ink)
                Text(MiseWidgetCopy.openMiseToAdd).font(.caption).foregroundColor(MiseColors.muted).multilineTextAlignment(.center)
            }
            .padding()
        } else {
            VStack(alignment: .leading, spacing: 4) {
                Text(MiseWidgetCopy.shoppingListEyebrow)
                    .font(.system(size: 9, weight: .bold))
                    .foregroundColor(MiseColors.brand)
                HStack(alignment: .firstTextBaseline) {
                    Text(MiseWidgetCopy.shoppingListTitle)
                        .font(.system(size: 15, weight: .bold))
                    Spacer()
                    Text(MiseWidgetCopy.itemsLeft(entry.remainingCount))
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(MiseColors.brand)
                }
                .padding(.bottom, 3)
                ForEach(entry.items, id: \.self) { name in
                    HStack(spacing: 6) {
                        Circle()
                            .strokeBorder(MiseColors.mutedLight, lineWidth: 1)
                            .frame(width: 8, height: 8)
                        Text(name)
                            .font(.system(size: 11))
                            .foregroundColor(MiseColors.ink)
                            .lineLimit(1)
                    }
                }
                if entry.remainingCount > entry.items.count {
                    Text(MiseWidgetCopy.moreItems(entry.remainingCount - entry.items.count))
                        .font(.system(size: 10))
                        .foregroundColor(MiseColors.muted)
                }
            }
            .padding(12)
        }
    }
}

struct ShoppingListWidget: Widget {
    let kind: String = "ShoppingListWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: ShoppingListProvider()) { entry in
            ShoppingListWidgetView(entry: entry)
                .containerBackground(for: .widget) { MiseColors.background }
        }
        .configurationDisplayName("Shopping List")
        .description("Your household's shopping list.")
        .supportedFamilies([.systemMedium, .systemLarge])
    }
}
