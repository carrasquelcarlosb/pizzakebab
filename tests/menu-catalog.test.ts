import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { menuCatalog, validMenuCategories } from "@/data/menu-catalog"

const expectedCategories = ["pizzas", "kebabs", "wraps", "sides", "drinks", "desserts"]

describe("menuCatalog", () => {
  it("exposes all expected categories", () => {
    expectedCategories.forEach((category) => {
      assert.ok(
        validMenuCategories.includes(category),
        `Category ${category} should be present in validMenuCategories`,
      )
      assert.ok(Array.isArray(menuCatalog[category]), `Category ${category} should resolve to an array`)
    })
  })

  it("provides data for drinks and desserts", () => {
    const drinks = menuCatalog.drinks
    const desserts = menuCatalog.desserts

    assert.ok(drinks.length > 0, "Drinks catalog should contain at least one item")
    assert.ok(desserts.length > 0, "Desserts catalog should contain at least one item")
  })
})
