import SwiftUI
import WidgetKit

@main
struct CookBlueprintWidgetsBundle: WidgetBundle {
    var body: some Widget {
        MealPlanWidget()
        ShoppingListWidget()
    }
}
