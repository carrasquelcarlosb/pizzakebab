const PROTECTED_TENANT_KEYS = new Set(['tenantId', 'resourceId'] as const);
const FILTER_PROTECTED_KEYS = new Set(['tenantId'] as const);

type AnyRecord = Record<string, unknown>;

type UpdateLike = AnyRecord;

type FilterLike = AnyRecord;

const cloneWithoutKeys = (source: AnyRecord, keys: ReadonlySet<string>): AnyRecord => {
  const clone: AnyRecord = {};
  Object.entries(source).forEach(([key, value]) => {
    if (!keys.has(key)) {
      clone[key] = value;
    }
  });
  return clone;
};

export const buildTenantScopedFilter = <FilterShape extends FilterLike>(
  tenantId: string,
  filter: FilterShape | undefined,
): FilterShape & { tenantId: string } => {
  if (filter && typeof filter === 'object' && !Array.isArray(filter)) {
    const sanitized = cloneWithoutKeys(filter, FILTER_PROTECTED_KEYS) as FilterShape;
    return { ...sanitized, tenantId };
  }

  return { tenantId } as FilterShape & { tenantId: string };
};

export const sanitizeTenantScopedUpdate = <UpdateShape extends UpdateLike>(
  update: UpdateShape,
  protectedKeys: ReadonlySet<string> = PROTECTED_TENANT_KEYS,
): UpdateShape => {
  if (!update || typeof update !== 'object' || Array.isArray(update)) {
    return update;
  }

  const clonedUpdate = { ...(update as AnyRecord) };
  const modifierKeys = Object.keys(clonedUpdate).filter((key) => key.startsWith('$'));

  if (modifierKeys.length === 0) {
    return cloneWithoutKeys(clonedUpdate, protectedKeys) as UpdateShape;
  }

  modifierKeys.forEach((modifierKey) => {
    const modifierValue = clonedUpdate[modifierKey];
    if (modifierValue && typeof modifierValue === 'object' && !Array.isArray(modifierValue)) {
      clonedUpdate[modifierKey] = cloneWithoutKeys(modifierValue as AnyRecord, protectedKeys);
    }
  });

  return clonedUpdate as UpdateShape;
};

export const appendUpdatedTimestamp = <UpdateShape extends UpdateLike>(
  update: UpdateShape,
  timestamp: Date = new Date(),
): UpdateShape => {
  if (typeof update === 'object' && update !== null && !Array.isArray(update)) {
    const modifierKeys = Object.keys(update).filter((key) => key.startsWith('$'));

    if (modifierKeys.length === 0) {
      return { ...(update as AnyRecord), updatedAt: timestamp } as UpdateShape;
    }

    const currentSet = ((update as AnyRecord)['$set'] ?? {}) as AnyRecord;
    const $set = { ...currentSet, updatedAt: timestamp };
    return { ...(update as AnyRecord), $set } as UpdateShape;
  }

  return update;
};

export const protectedTenantKeys = (): ReadonlySet<string> => PROTECTED_TENANT_KEYS;
export const protectedFilterKeys = (): ReadonlySet<string> => FILTER_PROTECTED_KEYS;
