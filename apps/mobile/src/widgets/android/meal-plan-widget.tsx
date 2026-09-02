// react-native-android-widget walks this file's JSX tree itself (buildWidgetTree)
// instead of mounting it through React, so the components below must stay raw,
// uncompiled functions — the React Compiler's injected hook calls have no
// Dispatcher to attach to outside a real render and throw "Invalid hook call".
"use no memo";

import { FlexWidget, TextWidget } from "react-native-android-widget";

import { sortMealTypes, type MealType } from "@/constants/meal-types";
import { MiseColors } from "@/constants/theme";
import type { MealPlanEntry } from "@/hooks/use-meal-plan";
import { api } from "@/lib/api-client";
import {
  formatWeekRange,
  getVisibleWeekDates,
  isSameDate,
  toISODate,
  weekdayShort,
} from "@/lib/date-utils";
import i18n from "@/lib/i18n";
import { listMealPlanEntries } from "@/lib/local-db/meal-plan";
import { isLocalModeActive } from "@/lib/local-db/local-mode-state";

type MealPlanResponse = { items: MealPlanEntry[] };

type DaySummary = {
  key: string;
  label: string;
  isToday: boolean;
  summary: string;
  isPlanned: boolean;
};

function DayRow({ day }: { day: DaySummary }) {
  if (!day.isPlanned) {
    return (
      <FlexWidget
        style={{
          flexDirection: "row",
          alignItems: "center",
          width: "match_parent",
          height: 27,
        }}
      >
        <TextWidget
          text={day.label}
          style={{
            width: 36,
            fontSize: 9,
            fontFamily: "PlusJakartaSans_700Bold",
            color: MiseColors.mutedLight,
          }}
        />
        <FlexWidget
          style={{
            flex: 1,
            borderBottomWidth: 1,
            borderColor: MiseColors.borderTint,
            borderStyle: "dashed",
            marginLeft: 8,
          }}
        />
      </FlexWidget>
    );
  }

  return (
    <FlexWidget
      style={{
        flexDirection: "row",
        alignItems: "center",
        width: "match_parent",
        height: 32,
        backgroundColor: day.isToday ? MiseColors.tintStrong : MiseColors.card,
        borderRadius: 10,
        paddingHorizontal: 10,
      }}
    >
      <TextWidget
        text={day.label}
        style={{
          width: 36,
          fontSize: 9,
          fontFamily: "PlusJakartaSans_700Bold",
          color: day.isToday ? MiseColors.brand : MiseColors.muted,
        }}
      />
      <FlexWidget style={{ flex: 1 }}>
        <TextWidget
          text={day.summary}
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

function MealPlanWidget({
  days,
  signedOut,
  weekRange,
}: {
  days: DaySummary[];
  signedOut: boolean;
  weekRange: string;
}) {
  if (signedOut) {
    return (
      <FlexWidget
        clickAction="OPEN_URI"
        clickActionData={{ uri: "cookblueprint://plan" }}
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
          text={i18n.t("widgets.signInMealPlan")}
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

  const unplannedDays = days.filter((day) => !day.isPlanned).length;

  return (
    <FlexWidget
      clickAction="OPEN_URI"
      clickActionData={{ uri: "cookblueprint://plan" }}
      style={{
        height: "match_parent",
        width: "match_parent",
        flexDirection: "column",
        backgroundColor: MiseColors.background,
        borderRadius: 20,
        padding: 14,
      }}
    >
      <FlexWidget
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          width: "match_parent",
          marginBottom: 2,
        }}
      >
        <TextWidget
          text={i18n.t("widgets.mealPlanEyebrow")}
          style={{
            fontSize: 9,
            fontFamily: "PlusJakartaSans_700Bold",
            color: MiseColors.brand,
          }}
        />
        <TextWidget
          text={weekRange}
          style={{
            fontSize: 9,
            fontFamily: "PlusJakartaSans_700Bold",
            color: MiseColors.muted,
          }}
        />
      </FlexWidget>
      <TextWidget
        text={i18n.t("widgets.mealPlanTitle")}
        style={{
          fontSize: 17,
          fontFamily: "PlusJakartaSans_700Bold",
          color: MiseColors.ink,
          marginBottom: 8,
        }}
      />
      {days.map((day) => (
        <DayRow key={day.key} day={day} />
      ))}
      <FlexWidget style={{ flex: 1 }} />
      <FlexWidget
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          width: "match_parent",
          borderTopWidth: 1,
          borderColor: MiseColors.borderSoft,
          marginTop: 4,
          paddingTop: 8,
        }}
      >
        <TextWidget
          text={i18n.t("widgets.daysUnplanned", { count: unplannedDays })}
          style={{
            fontSize: 9,
            fontFamily: "PlusJakartaSans_500Medium",
            color: MiseColors.muted,
          }}
        />
        <TextWidget
          text={i18n.t("widgets.plan")}
          style={{
            fontSize: 10,
            fontFamily: "PlusJakartaSans_700Bold",
            color: MiseColors.brand,
          }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}

/** Fetches the current week's meal plan (local-db in local mode, API otherwise) and renders the widget JSX. */
export async function renderMealPlanWidget() {
  const weekDates = getVisibleWeekDates();
  const startISO = toISODate(weekDates[0]);
  const endISO = toISODate(weekDates[weekDates.length - 1]);

  try {
    const isLocal = await isLocalModeActive();
    const items = isLocal
      ? await listMealPlanEntries(weekDates[0], weekDates[weekDates.length - 1])
      : (
          await api.get<MealPlanResponse>(
            `/api/meal-plans?startDate=${startISO}&endDate=${endISO}`,
          )
        ).items;
    const today = new Date();

    const entriesByDate = new Map<string, Map<MealType, MealPlanEntry>>();
    for (const entry of items) {
      const dateKey = toISODate(new Date(entry.date));
      if (!entriesByDate.has(dateKey)) entriesByDate.set(dateKey, new Map());
      entriesByDate.get(dateKey)!.set(entry.mealType, entry);
    }

    const days: DaySummary[] = weekDates.map((date) => {
      const dateISO = toISODate(date);
      const dayMeals = entriesByDate.get(dateISO);
      const titles = dayMeals
        ? sortMealTypes([...dayMeals.keys()]).map(
            (mealType) => dayMeals.get(mealType)!.recipe.title,
          )
        : [];
      return {
        key: dateISO,
        label: weekdayShort(date),
        isToday: isSameDate(date, today),
        summary: titles.length > 0 ? titles.join(", ") : "",
        isPlanned: titles.length > 0,
      };
    });

    return (
      <MealPlanWidget
        days={days}
        signedOut={false}
        weekRange={formatWeekRange(weekDates, i18n.language)}
      />
    );
  } catch {
    return <MealPlanWidget days={[]} signedOut={true} weekRange="" />;
  }
}
