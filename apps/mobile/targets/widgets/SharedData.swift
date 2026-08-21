import Foundation
import SwiftUI

// Must match WIDGET_APP_GROUP in src/widgets/widget-names.ts and the
// `group.<ios.bundleIdentifier>` App Group @bacons/apple-targets syncs
// between the main app and this extension by default.
let miseAppGroup = "group.com.cookblueprint.app"

enum MiseShared {
    static var defaults: UserDefaults? {
        UserDefaults(suiteName: miseAppGroup)
    }

    /// Written by `useSyncWidgetAuth` (src/hooks/use-sync-widget-auth.ts) whenever
    /// the app's auth state changes, since this extension has no access to
    /// expo-secure-store and fetches the API itself.
    static var apiURL: String? {
        defaults?.string(forKey: "apiURL")
    }

    static var sessionCookie: String? {
        defaults?.string(forKey: "sessionCookie")
    }

    /// Written by `syncTrialWidgetData` (src/widgets/sync-trial-widget-data.ts)
    /// whenever local trial-mode data changes, since this extension has no
    /// access to expo-sqlite and can't read the on-device trial data itself.
    static var trialModeActive: Bool {
        defaults?.bool(forKey: "trialModeActive") ?? false
    }

    static var trialMealPlanData: Data? {
        defaults?.string(forKey: "trialMealPlanJSON")?.data(using: .utf8)
    }

    static var trialShoppingListData: Data? {
        defaults?.string(forKey: "trialShoppingListJSON")?.data(using: .utf8)
    }

    static var locale: String? {
        defaults?.string(forKey: "locale")
    }
}

enum MiseAPIError: Error {
    case notSignedIn
    case requestFailed
}

enum MiseAPI {
    /// Mirrors apps/mobile/src/lib/api-client.ts's native branch: the cookie is
    /// attached manually since this isn't a browser with its own cookie jar.
    static func fetch<T: Decodable>(path: String, queryItems: [URLQueryItem] = []) async throws -> T {
        guard let base = MiseShared.apiURL, !base.isEmpty,
              let cookie = MiseShared.sessionCookie, !cookie.isEmpty else {
            throw MiseAPIError.notSignedIn
        }
        guard var components = URLComponents(string: base + path) else {
            throw MiseAPIError.requestFailed
        }
        if !queryItems.isEmpty {
            components.queryItems = queryItems
        }
        guard let url = components.url else {
            throw MiseAPIError.requestFailed
        }

        var request = URLRequest(url: url)
        request.setValue(cookie, forHTTPHeaderField: "Cookie")
        request.timeoutInterval = 15

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse, (200..<300).contains(http.statusCode) else {
            throw MiseAPIError.requestFailed
        }
        return try JSONDecoder().decode(T.self, from: data)
    }
}

/// Mirrors apps/mobile/src/lib/date-utils.ts's `getCurrentWeekDates` (Monday–Sunday, local time).
func miseCurrentWeekDates(reference: Date = Date()) -> [Date] {
    var calendar = Calendar(identifier: .gregorian)
    calendar.timeZone = .current
    let startOfDay = calendar.startOfDay(for: reference)
    let weekday = calendar.component(.weekday, from: startOfDay) // 1 = Sunday ... 7 = Saturday
    let daysSinceMonday = (weekday + 5) % 7
    let monday = calendar.date(byAdding: .day, value: -daysSinceMonday, to: startOfDay) ?? startOfDay
    return (0..<7).compactMap { calendar.date(byAdding: .day, value: $0, to: monday) }
}

/// Mirrors apps/mobile/src/lib/date-utils.ts's `toISODate` (local calendar date, not UTC).
func miseISODate(_ date: Date) -> String {
    let calendar = Calendar(identifier: .gregorian)
    let comps = calendar.dateComponents([.year, .month, .day], from: date)
    return String(format: "%04d-%02d-%02d", comps.year ?? 1970, comps.month ?? 1, comps.day ?? 1)
}

func miseWeekdayShort(_ date: Date) -> String {
    let formatter = DateFormatter()
    formatter.locale = Locale.current
    formatter.setLocalizedDateFormatFromTemplate("EEE")
    return formatter.string(from: date)
}

extension Color {
    /// Kept manually in sync with MiseColors in src/constants/theme.ts — there's
    /// no shared package between the RN app and this Swift target.
    init(mise hex: String) {
        var sanitized = hex.trimmingCharacters(in: .whitespacesAndNewlines)
        sanitized = sanitized.replacingOccurrences(of: "#", with: "")
        var rgb: UInt64 = 0
        Scanner(string: sanitized).scanHexInt64(&rgb)
        let r = Double((rgb & 0xFF0000) >> 16) / 255
        let g = Double((rgb & 0x00FF00) >> 8) / 255
        let b = Double(rgb & 0x0000FF) / 255
        self.init(red: r, green: g, blue: b)
    }
}

enum MiseColors {
    static let brand = Color(mise: "#C4553E")
    static let ink = Color(mise: "#221E1B")
    static let muted = Color(mise: "#97887C")
    static let mutedLight = Color(mise: "#B3A99D")
    static let background = Color(mise: "#FBF6EF")
    static let card = Color(mise: "#FFFFFF")
    static let tint = Color(mise: "#FBEDE7")
}

enum MiseWidgetCopy {
    private static var isGerman: Bool { MiseShared.locale == "de" || (MiseShared.locale == nil && Locale.current.languageCode == "de") }

    static var mealPlanEyebrow: String { isGerman ? "ESSENSPLAN" : "MEAL PLAN" }
    static var mealPlanTitle: String { isGerman ? "Diese Woche" : "This week" }
    static var shoppingListEyebrow: String { isGerman ? "EINKAUFSLISTE" : "SHOPPING LIST" }
    static var shoppingListTitle: String { isGerman ? "Zum Einkaufen" : "To pick up" }
    static var nothingToPickUp: String { isGerman ? "Nichts zu besorgen" : "Nothing to pick up" }
    static var openMiseToAdd: String { isGerman ? "Öffne CookBlueprint und füge deinen ersten Artikel hinzu" : "Open CookBlueprint to add your first item" }
    static var signInMealPlan: String { isGerman ? "Melde dich an, um deinen Essensplan zu sehen" : "Sign in to see your meal plan" }
    static var signInShoppingList: String { isGerman ? "Melde dich an, um deine Einkaufsliste zu sehen" : "Sign in to see your shopping list" }

    static func itemsLeft(_ count: Int) -> String { isGerman ? "\(count) übrig" : "\(count) left" }
    static func moreItems(_ count: Int) -> String { isGerman ? "+\(count) weitere" : "+\(count) more" }
    static func daysUnplanned(_ count: Int) -> String { isGerman ? "\(count) Tage ungeplant" : "\(count) days unplanned" }
    static var plan: String { isGerman ? "Planen →" : "Plan →" }
}
