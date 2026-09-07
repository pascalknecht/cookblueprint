import { describe, expect, it } from "vitest";
import {
  mergeIngredientExtract,
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

describe("mergeIngredientExtract", () => {
  it("splits on the unit token so leftover words stay on the name", () => {
    expect(
      mergeIngredientExtract(
        "1 TL Kreuzkümmelpulver",
        { unit: "TL" },
        { quantity: "", name: "1 TL Kreuzkümmelpulver" },
      ),
    ).toEqual({ quantity: "1 TL", name: "Kreuzkümmelpulver" });

    expect(
      mergeIngredientExtract(
        "2 EL gehackte Petersilie",
        { unit: "EL" },
        { quantity: "2 EL", name: "gehackte Petersilie" },
      ),
    ).toEqual({ quantity: "2 EL", name: "gehackte Petersilie" });
  });

  it("ignores a unit that is not in the original line", () => {
    expect(
      mergeIngredientExtract(
        "1 Prise Salz",
        { unit: "TL" },
        { quantity: "1 Prise", name: "Salz" },
      ),
    ).toEqual({ quantity: "1 Prise", name: "Salz" });
  });

  it("falls back when no unit was extracted", () => {
    expect(
      mergeIngredientExtract("3 eggs", null, { quantity: "3", name: "eggs" }),
    ).toEqual({ quantity: "3", name: "eggs" });
    expect(
      mergeIngredientExtract("1 litre stock", {}, { quantity: "1 litre", name: "stock" }),
    ).toEqual({ quantity: "1 litre", name: "stock" });
  });
});

describe("preprocessIngredientLines", () => {
  it("splits German and English ingredient lines via parse-ingredient, falling back to the deterministic parser", () => {
    const result = preprocessIngredientLines(["1 TL Kreuzkümmelpulver", "3 eggs"]);
    expect(result[0]).toMatchObject({ n: "Kreuzkümmelpulver", q: "1 TL" });
    expect(result[1]).toMatchObject({ n: "eggs", q: "3" });
  });

  it("recognizes German units missing from parse-ingredient's default table", () => {
    const result = preprocessIngredientLines(["2 Zehen Knoblauch", "1 Prise Salz", "3 EL Olivenöl"]);
    expect(result[0]).toMatchObject({ n: "Knoblauch", q: "2 Zehen" });
    expect(result[1]).toMatchObject({ n: "Salz", q: "1 Prise" });
    expect(result[2]).toMatchObject({ n: "Olivenöl", q: "3 EL" });
  });

  it("falls back to the deterministic parser for a unit spelling parse-ingredient doesn't recognize", () => {
    // "litre" isn't in parse-ingredient's default table (only "liter") and isn't in
    // EXTRA_UOMS either, so extraction finds no unit here and must defer to the fallback
    // regex parser rather than let parse-ingredient's own quantity/description split win.
    const result = preprocessIngredientLines(["1 litre stock"]);
    expect(result[0]).toMatchObject({ n: "stock", q: "1 litre" });
  });
});
