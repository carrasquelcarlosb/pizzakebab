import assert from "node:assert/strict"
import { test } from "node:test"

import { getAddressLabels, validateAddressFields } from "../src/lib/address"

const dictionary: Record<string, string> = {
  "address.labels.street": "Street Address",
  "address.labels.city": "City",
  "address.labels.zipCode": "ZIP Code",
  "address.validation.streetRequired": "Street address is required",
  "address.validation.cityRequired": "City is required",
  "address.validation.zipRequired": "ZIP code is required",
}

const t = (key: string) => dictionary[key] ?? key

test("returns translated labels", () => {
  assert.deepEqual(getAddressLabels(t), {
    address: "Street Address",
    city: "City",
    zipCode: "ZIP Code",
  })
})

test("validates empty fields", () => {
  const errors = validateAddressFields({ address: "", city: "", zipCode: "" }, t)

  assert.deepEqual(errors, {
    address: "Street address is required",
    city: "City is required",
    zipCode: "ZIP code is required",
  })
})

test("trims whitespace before validating", () => {
  const errors = validateAddressFields({ address: " 123 Main ", city: "   ", zipCode: " 90210 " }, t)

  assert.deepEqual(errors, {
    city: "City is required",
  })
})
