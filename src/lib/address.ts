import type { TranslationKey } from "@/lib/translations"

export interface AddressFields {
  address: string
  city: string
  zipCode: string
}

export type AddressFieldKey = keyof AddressFields
export type AddressErrors = Partial<Record<AddressFieldKey, string>>

type TranslateFn = (key: TranslationKey) => string

export function getAddressLabels(t: TranslateFn) {
  return {
    address: t("address.labels.street"),
    city: t("address.labels.city"),
    zipCode: t("address.labels.zipCode"),
  }
}

export function validateAddressFields(fields: AddressFields, t: TranslateFn): AddressErrors {
  const errors: AddressErrors = {}

  if (!fields.address.trim()) {
    errors.address = t("address.validation.streetRequired")
  }

  if (!fields.city.trim()) {
    errors.city = t("address.validation.cityRequired")
  }

  if (!fields.zipCode.trim()) {
    errors.zipCode = t("address.validation.zipRequired")
  }

  return errors
}
