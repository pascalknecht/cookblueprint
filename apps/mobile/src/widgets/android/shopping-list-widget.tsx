// react-native-android-widget walks this file's JSX tree itself (buildWidgetTree)
// instead of mounting it through React, so the components below must stay raw,
// uncompiled functions — the React Compiler's injected hook calls have no
// Dispatcher to attach to outside a real render and throw "Invalid hook call".
"use no memo";

import { FlexWidget, TextWidget } from "react-native-android-widget";

import { MiseColors } from "@/constants/theme";
import type { ShoppingItem } from "@/hooks/use-shopping-list";
import { api } from "@/lib/api-client";
import i18n from "@/lib/i18n";
import { listShoppingItems } from "@/lib/local-db/shopping-items";
import { isLocalModeActive } from "@/lib/local-db/local-mode-state";

type ShoppingItemsResponse = { items: ShoppingItem[]; total: number };

const MAX_ITEMS_SHOWN = 8;

function ItemRow({ name }: { name: string }) {
  return (
    <FlexWidget
      style={{
        flexDirection: "row",
        alignItems: "center",
        width: "match_parent",
        marginBottom: 4,
      }}
    >
      <FlexWidget
        style={{
          height: 8,
          width: 8,
          borderRadius: 4,
          borderWidth: 1.5,
          borderColor: MiseColors.mutedLight,
          marginRight: 8,
        }}
      />
      <FlexWidget style={{ flex: 1 }}>
        <TextWidget
          text={name}
          truncate="END"
          maxLines={1}
          style={{
            fontSize: 11,
            fontFamily: "PlusJakartaSans_500Medium",
            color: MiseColors.ink,
          }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}

function ShoppingListWidget({
  items,
  remainingCount,
  signedOut,
}: {
  items: string[];
  remainingCount: number;
  signedOut: boolean;
}) {
  if (signedOut) {
    return (
      <FlexWidget
        clickAction="OPEN_URI"
        clickActionData={{ uri: "cookblueprint://list" }}
        style={{
          height: "match_parent",
          width: "match_parent",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: MiseColors.background,
          borderRadius: 20,
          padding: 16,
        }}
      >
        <TextWidget
          text={i18n.t("widgets.signInShoppingList")}
          style={{
            fontSize: 12,
            fontFamily: "PlusJakartaSans_500Medium",
            color: MiseColors.muted,
            textAlign: "center",
          }}
        />
      </FlexWidget>
    );
  }

  if (items.length === 0) {
    return (
      <FlexWidget
        clickAction="OPEN_URI"
        clickActionData={{ uri: "cookblueprint://list" }}
        style={{
          height: "match_parent",
          width: "match_parent",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: MiseColors.background,
          borderRadius: 20,
          padding: 16,
        }}
      >
        <TextWidget
          text={i18n.t("widgets.shoppingListEyebrow")}
          style={{
            fontSize: 9,
            fontFamily: "PlusJakartaSans_700Bold",
            color: MiseColors.brand,
            marginBottom: 3,
          }}
        />
        <TextWidget
          text={i18n.t("widgets.nothingToPickUp")}
          style={{
            fontSize: 14,
            fontFamily: "PlusJakartaSans_700Bold",
            color: MiseColors.ink,
            marginBottom: 4,
          }}
        />
        <TextWidget
          text={i18n.t("widgets.openMiseToAdd")}
          style={{
            fontSize: 10,
            fontFamily: "PlusJakartaSans_500Medium",
            color: MiseColors.muted,
            textAlign: "center",
          }}
        />
      </FlexWidget>
    );
  }

  return (
    <FlexWidget
      clickAction="OPEN_URI"
      clickActionData={{ uri: "cookblueprint://list" }}
      style={{
        height: "match_parent",
        width: "match_parent",
        flexDirection: "column",
        backgroundColor: MiseColors.background,
        borderRadius: 20,
        padding: 14,
      }}
    >
      <TextWidget
        text={i18n.t("widgets.shoppingListEyebrow")}
        style={{
          fontSize: 9,
          fontFamily: "PlusJakartaSans_700Bold",
          color: MiseColors.brand,
          marginBottom: 2,
        }}
      />
      <FlexWidget
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <TextWidget
          text={i18n.t("widgets.shoppingListTitle")}
          style={{
            fontSize: 15,
            fontFamily: "PlusJakartaSans_700Bold",
            color: MiseColors.ink,
          }}
        />
        <TextWidget
          text={i18n.t("widgets.itemsLeft", { count: remainingCount })}
          style={{
            fontSize: 10,
            fontFamily: "PlusJakartaSans_700Bold",
            color: MiseColors.brand,
          }}
        />
      </FlexWidget>
      {items.map((name, index) => (
        <ItemRow key={`${index}-${name}`} name={name} />
      ))}
      {remainingCount > items.length ? (
        <TextWidget
          text={i18n.t("widgets.moreItems", {
            count: remainingCount - items.length,
          })}
          style={{
            fontSize: 10,
            fontFamily: "PlusJakartaSans_500Medium",
            color: MiseColors.muted,
            marginTop: 2,
          }}
        />
      ) : null}
    </FlexWidget>
  );
}

/** Fetches unchecked shopping-list items (local-db in local mode, API otherwise) and renders the widget JSX. */
export async function renderShoppingListWidget() {
  try {
    const isLocal = await isLocalModeActive();
    const items = isLocal
      ? await listShoppingItems()
      : (
          await api.get<ShoppingItemsResponse>(
            "/api/shopping-items?perPage=100",
          )
        ).items;
    const unchecked = items.filter((item) => !item.checked);
    const preview = unchecked
      .slice(0, MAX_ITEMS_SHOWN)
      .map((item) => item.name);
    return (
      <ShoppingListWidget
        items={preview}
        remainingCount={unchecked.length}
        signedOut={false}
      />
    );
  } catch {
    return (
      <ShoppingListWidget items={[]} remainingCount={0} signedOut={true} />
    );
  }
}
