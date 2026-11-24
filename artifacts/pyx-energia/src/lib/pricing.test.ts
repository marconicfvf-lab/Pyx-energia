import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  discountPercentFor,
  formatCurrency,
  parseBillInput,
  quoteSavings,
} from "./pricing.ts";

const brl = (value: number) => formatCurrency(value).replace(/\u00a0/g, " ");

describe("simulator quote", () => {
  it("prices 14000 at 40% with monthly savings equal to the annual total divided by 12", () => {
    const quote = quoteSavings(parseBillInput("14000"));
    assert.equal(quote.discountPercent, 40);
    assert.equal(brl(quote.compensatedEnergy), "R$ 12.772");
    assert.equal(brl(quote.monthly), "R$ 5.109");
    assert.equal(brl(quote.annual), "R$ 61.305");
    assert.equal(quote.annual, quote.monthly * 12);
    assert.notEqual(brl(quote.monthly), "R$ 523");
  });

  it("keeps monthly and annual in lockstep for typed bills and slider stops", () => {
    for (const bill of [500, 2500, 14000, 20000]) {
      const quote = quoteSavings(bill);
      assert.equal(quote.annual, quote.monthly * 12);
      assert.equal(quote.discountPercent, discountPercentFor(bill));
    }
    assert.equal(quoteSavings(500).discountPercent, 20);
    assert.equal(quoteSavings(2500).discountPercent, 20);
    assert.equal(quoteSavings(3000).discountPercent, 20);
    assert.equal(quoteSavings(3001).discountPercent, 30);
    assert.equal(brl(quoteSavings(500).monthly), "R$ 70");
    assert.equal(brl(quoteSavings(500).annual), "R$ 844");
    assert.equal(brl(quoteSavings(2500).monthly), "R$ 438");
    assert.equal(brl(quoteSavings(2500).annual), "R$ 5.260");
    assert.equal(brl(quoteSavings(20000).monthly), "R$ 7.317");
    assert.equal(brl(quoteSavings(20000).annual), "R$ 87.801");
  });

  it("parses intermediate keystrokes and pt-BR thousands without leaving a stale bill", () => {
    const typed = ["1", "14", "140", "1400", "14000"];
    const quotes = typed.map((raw) => quoteSavings(parseBillInput(raw)));
    assert.deepEqual(
      typed.map((raw) => parseBillInput(raw)),
      [1, 14, 140, 1400, 14000],
    );
    for (const quote of quotes) assert.equal(quote.annual, quote.monthly * 12);
    assert.equal(quotes[3].discountPercent, 20);
    assert.equal(brl(quotes[3].monthly), "R$ 236");
    assert.equal(brl(quotes[4].monthly), "R$ 5.109");
    assert.equal(parseBillInput("14.000"), 14000);
    assert.equal(parseBillInput("R$ 2.500"), 2500);
    assert.equal(parseBillInput(""), 0);
    assert.equal(parseBillInput("999999999"), 1_000_000);
  });
});
