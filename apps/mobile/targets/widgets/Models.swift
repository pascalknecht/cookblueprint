import Foundation

// Mirrors the JSON shapes returned by apps/nextjs's /api/meal-plans and
// /api/shopping-items — only the fields this widget actually renders are
// declared; JSONDecoder ignores any other keys present in the response.

struct MiseRecipe: Decodable {
    let title: String
}

struct MiseMealPlanEntry: Decodable {
    let date: String
    let mealType: String
    let recipe: MiseRecipe
}

struct MiseMealPlanResponse: Decodable {
    let items: [MiseMealPlanEntry]
}

struct MiseShoppingItem: Decodable {
    let name: String
    let checked: Bool
}

struct MiseShoppingItemsResponse: Decodable {
    let items: [MiseShoppingItem]
}

// Mirrors apps/mobile/src/constants/meal-types.ts's ALL_MEAL_TYPES order.
let miseMealTypeOrder = ["breakfast", "morningSnack", "lunch", "afternoonSnack", "dinner"]

func miseSortedMealTitles(for entries: [MiseMealPlanEntry]) -> [String] {
    let byType = Dictionary(entries.map { ($0.mealType, $0) }, uniquingKeysWith: { first, _ in first })
    return miseMealTypeOrder.compactMap { byType[$0]?.recipe.title }
}
