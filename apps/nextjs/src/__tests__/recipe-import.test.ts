import { describe, expect, it } from "vitest";
import {
  mergeNeedleIngredient,
  parseIngredientLine,
  preprocessIngredientLines,
} from "@repo/shared";

describe("parseIngredientLine", () => {
  it("keeps German spoon units on the quantity", () => {
    expect(parseIngredientLine("1 TL Kreuzkümmelpulver")).toEqual({
      quantity: "1 TL",
      name: "Kreuzkümmelpulver",
    });
    expect(parseIngredientLine("2 EL Olivenöl")).toEqual({
      quantity: "2 EL",
      name: "Olivenöl",
    });
    expect(parseIngredientLine("TL Kreuzkümmelpulver")).toEqual({
      quantity: "TL",
      name: "Kreuzkümmelpulver",
    });
  });

  it("keeps adjectives with the name", () => {
    expect(parseIngredientLine("2 EL gehackte Petersilie")).toEqual({
      quantity: "2 EL",
      name: "gehackte Petersilie",
    });
  });

  it("handles metric, English, approximations, and quantity words", () => {
    expect(parseIngredientLine("200 g Mehl")).toEqual({ quantity: "200 g", name: "Mehl" });
    expect(parseIngredientLine("2 cups flour")).toEqual({ quantity: "2 cups", name: "flour" });
    expect(parseIngredientLine("1/2 tsp salt")).toEqual({ quantity: "1/2 tsp", name: "salt" });
    expect(parseIngredientLine("500 ml milk")).toEqual({ quantity: "500 ml", name: "milk" });
    expect(parseIngredientLine("1 litre stock")).toEqual({ quantity: "1 litre", name: "stock" });
    expect(parseIngredientLine("1 sachet dried yeast")).toEqual({
      quantity: "1 sachet",
      name: "dried yeast",
    });
    expect(parseIngredientLine("1 tin chopped tomatoes")).toEqual({
      quantity: "1 tin",
      name: "chopped tomatoes",
    });
    expect(parseIngredientLine("ca. 1 EL Zucker")).toEqual({
      quantity: "ca. 1 EL",
      name: "Zucker",
    });
    expect(parseIngredientLine("etwas Salz")).toEqual({ quantity: "etwas", name: "Salz" });
    expect(parseIngredientLine("3 eggs")).toEqual({ quantity: "3", name: "eggs" });
  });
});

describe("mergeNeedleIngredient", () => {
  it("splits on the unit token so leftover words stay on the name", () => {
    expect(
      mergeNeedleIngredient(
        "1 TL Kreuzkümmelpulver",
        { amount: 1, unit: "TL", name: "Kreuzkümmelpulver" },
        { quantity: "", name: "1 TL Kreuzkümmelpulver" },
      ),
    ).toEqual({ quantity: "1 TL", name: "Kreuzkümmelpulver" });

    expect(
      mergeNeedleIngredient(
        "2 EL gehackte Petersilie",
        { amount: 2, unit: "EL", name: "Petersilie" },
        { quantity: "2 EL", name: "gehackte Petersilie" },
      ),
    ).toEqual({ quantity: "2 EL", name: "gehackte Petersilie" });
  });

  it("ignores a unit that is not in the original line", () => {
    expect(
      mergeNeedleIngredient(
        "1 Prise Salz",
        { amount: 1, unit: "TL", name: "Prise Salz" },
        { quantity: "1 Prise", name: "Salz" },
      ),
    ).toEqual({ quantity: "1 Prise", name: "Salz" });
  });

  it("falls back when Needle returns nothing", () => {
    expect(
      mergeNeedleIngredient("3 eggs", null, { quantity: "3", name: "eggs" }),
    ).toEqual({ quantity: "3", name: "eggs" });
  });
});

describe("preprocessIngredientLines", () => {
  it("uses Needle when present and the parser otherwise", () => {
    const result = preprocessIngredientLines(
      ["1 TL Kreuzkümmelpulver", "3 eggs"],
      [{ amount: 1, unit: "TL", name: "Kreuzkümmelpulver" }, null],
    );
    expect(result[0]).toMatchObject({ n: "Kreuzkümmelpulver", q: "1 TL" });
    expect(result[1]).toMatchObject({ n: "eggs", q: "3" });
  });
});
