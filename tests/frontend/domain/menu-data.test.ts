import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  getFeaturedMenuItems,
  getLocalizedMenuItemById,
  getLocalizedMenuSections,
  formatCurrency,
} from '../../../src/lib/menu-data'

const dictionary = new Map<string, string>([
  ['food.spicyKebabPizza.name', 'Spicy Kebab Pizza'],
  ['food.spicyKebabPizza.description', 'Signature pizza with spicy kebab'],
  ['food.margherita.name', 'Classic Margherita'],
  ['food.margherita.description', 'Tomato, mozzarella, basil'],
  ['categories.pizzas', 'Pizzas'],
  ['common.specialtyPizzas', 'Specialty Pizzas'],
])

const t = (key: string) => dictionary.get(key) ?? key

describe('menu-data domain services', () => {
  it('localizes menu sections using translation function', () => {
    const sections = getLocalizedMenuSections(t)

    assert.equal(sections.pizzas[0].name, 'Spicy Kebab Pizza')
    assert.equal(sections.pizzas[0].category, 'Specialty Pizzas')
  })

  it('resolves menu items by id with localization', () => {
    const item = getLocalizedMenuItemById(101, t)

    assert.equal(item?.name, 'Spicy Kebab Pizza')
    assert.equal(item?.description, 'Signature pizza with spicy kebab')
  })

  it('selects featured menu items in defined order', () => {
    const featured = getFeaturedMenuItems(t, [101, 102])

    assert.deepEqual(
      featured.map((item) => item.name),
      ['Spicy Kebab Pizza', 'Classic Margherita'],
    )
  })

  it('formats currency per language preference', () => {
    assert.equal(formatCurrency(12, 'en'), '$12.00')
    assert.equal(formatCurrency(12, 'fr'), '12,00 €')
  })
})
