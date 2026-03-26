'use client';

import { useEffect, useMemo, useState } from 'react';
import { adminApi, AdminApiError, AdminMenu, AdminMenuItem, AdminOperatingHour, AdminPricingOverride } from '@/lib/admin-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';

const emptyMenu = (id: string): AdminMenu => ({
  id,
  name: '',
  description: '',
  translationKey: '',
  isActive: true,
  items: [],
});

const emptyMenuItem = (id: string): AdminMenuItem => ({
  id,
  name: '',
  description: '',
  categoryKey: '',
  price: 0,
  currency: 'USD',
  isAvailable: true,
  imageUrl: '',
  isPopular: false,
  isNew: false,
});

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function AdminMenusPage() {
  const [menus, setMenus] = useState<AdminMenu[]>([]);
  const [pricingOverrides, setPricingOverrides] = useState<AdminPricingOverride[]>([]);
  const [operatingHours, setOperatingHours] = useState<AdminOperatingHour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingMenuId, setSavingMenuId] = useState<string | null>(null);
  const [savingOverrideId, setSavingOverrideId] = useState<string | null>(null);
  const [savingHourId, setSavingHourId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [menuData, overrideData, hourData] = await Promise.all([
          adminApi.menus(),
          adminApi.pricingOverrides(),
          adminApi.operatingHours(),
        ]);
        setMenus(menuData);
        setPricingOverrides(overrideData);
        setOperatingHours(hourData);
        setError(null);
      } catch (err) {
        if (err instanceof AdminApiError) {
          setError('Unable to load admin data');
        } else {
          setError('Unexpected error fetching admin data');
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleMenuFieldChange = (menuId: string, field: keyof AdminMenu, value: unknown) => {
    setMenus((prev) =>
      prev.map((menu) =>
        menu.id === menuId
          ? {
              ...menu,
              [field]: value,
            }
          : menu,
      ),
    );
  };

  const handleMenuItemChange = (menuId: string, itemId: string, field: keyof AdminMenuItem, value: unknown) => {
    setMenus((prev) =>
      prev.map((menu) => {
        if (menu.id !== menuId) {
          return menu;
        }
        return {
          ...menu,
          items: menu.items.map((item) => (item.id === itemId ? { ...item, [field]: value } : item)),
        };
      }),
    );
  };

const handleAddMenu = () => {
  const tempId = `temp-menu-${Date.now()}`;
  setMenus((prev) => [emptyMenu(tempId), ...prev]);
};

  const handleAddItem = (menuId: string) => {
    const tempId = `temp-item-${Date.now()}`;
    setMenus((prev) =>
      prev.map((menu) =>
        menu.id === menuId
          ? {
              ...menu,
              items: [...menu.items, emptyMenuItem(tempId)],
            }
          : menu,
      ),
    );
  };

  const handleRemoveItem = (menuId: string, itemId: string) => {
    setMenus((prev) =>
      prev.map((menu) =>
        menu.id === menuId
          ? {
              ...menu,
              items: menu.items.filter((item) => item.id !== itemId),
            }
          : menu,
      ),
    );
  };

  const handleDeleteMenu = async (menuId: string) => {
    if (!menuId || menuId.startsWith('temp-menu-')) {
      setMenus((prev) => prev.filter((menu) => menu.id !== menuId));
      return;
    }
    await adminApi.deleteMenu(menuId);
    setMenus((prev) => prev.filter((menu) => menu.id !== menuId));
  };

  const handleSaveMenu = async (menu: AdminMenu) => {
    const isNew = menu.id.startsWith('temp-menu-');
    setSavingMenuId(isNew ? 'new' : menu.id);
    try {
      setError(null);
      const payload = {
        ...menu,
        id: isNew ? undefined : menu.id,
        items: menu.items.map((item) => ({
          ...item,
          id: item.id?.startsWith('temp-item-') ? null : item.id,
        })),
      };
      const saved = await adminApi.saveMenu(payload);
      if (saved) {
        setMenus((prev) => prev.map((entry) => (entry.id === menu.id ? saved : entry)));
      } else {
        const refreshed = await adminApi.menus();
        setMenus(refreshed);
      }
    } catch (err) {
      setError('Failed to save menu');
    } finally {
      setSavingMenuId(null);
    }
  };

  const handleSaveOverride = async (override: Partial<AdminPricingOverride>) => {
    const isNew = !override.id || override.id.startsWith('temp-override-');
    setSavingOverrideId(isNew ? 'new' : override.id ?? null);
    try {
      setError(null);
      if (!override.menuItemId || !override.menuItemId.trim()) {
        setError('A menu item ID is required for pricing overrides');
        return null;
      }
      if (override.price === undefined || Number.isNaN(Number(override.price))) {
        setError('A numeric price is required for pricing overrides');
        return null;
      }
      const payload = {
        ...override,
        id: isNew ? undefined : override.id,
      };
      const saved = await adminApi.savePricingOverride(payload);
      const refreshed = await adminApi.pricingOverrides();
      setPricingOverrides(refreshed);
      return saved;
    } catch (err) {
      setError('Failed to save pricing override');
      throw err;
    } finally {
      setSavingOverrideId(null);
    }
  };

  const handleDeleteOverride = async (id: string) => {
    if (id.startsWith('temp-override-')) {
      setPricingOverrides((prev) => prev.filter((entry) => entry.id !== id));
      return;
    }
    await adminApi.deletePricingOverride(id);
    setPricingOverrides((prev) => prev.filter((entry) => entry.id !== id));
  };

  const handleSaveOperatingHour = async (hour: Partial<AdminOperatingHour>) => {
    const isNew = !hour.id || hour.id.startsWith('temp-hour-');
    setSavingHourId(isNew ? 'new' : hour.id ?? null);
    try {
      setError(null);
      if (hour.opensAt === undefined || hour.closesAt === undefined) {
        setError('Operating hours require opening and closing times');
        return null;
      }
      const payload = {
        ...hour,
        id: isNew ? undefined : hour.id,
      };
      const saved = await adminApi.saveOperatingHour(payload);
      const refreshed = await adminApi.operatingHours();
      setOperatingHours(refreshed);
      return saved;
    } catch (err) {
      setError('Failed to save operating hour');
      throw err;
    } finally {
      setSavingHourId(null);
    }
  };

  const handleDeleteOperatingHour = async (id: string) => {
    if (id.startsWith('temp-hour-')) {
      setOperatingHours((prev) => prev.filter((entry) => entry.id !== id));
      return;
    }
    await adminApi.deleteOperatingHour(id);
    setOperatingHours((prev) => prev.filter((entry) => entry.id !== id));
  };

  const handleAddOverride = () => {
    const tempId = `temp-override-${Date.now()}`;
    setPricingOverrides((prev) => [
      {
        id: tempId,
        menuItemId: '',
        price: 0,
        currency: 'USD',
        startsAt: null,
        endsAt: null,
        reason: '',
      },
      ...prev,
    ]);
  };

  const handleAddOperatingHour = () => {
    const tempId = `temp-hour-${Date.now()}`;
    setOperatingHours((prev) => [
      {
        id: tempId,
        dayOfWeek: 0,
        opensAt: '09:00',
        closesAt: '21:00',
        isClosed: false,
      },
      ...prev,
    ]);
  };

  const sortedHours = useMemo(() => operatingHours.slice().sort((a, b) => a.dayOfWeek - b.dayOfWeek), [operatingHours]);

  if (loading) {
    return <p className="text-sm text-slate-300">Loading menus…</p>;
  }

  return (
    <div className="space-y-10">
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-100">Menu management</h1>
          <Button type="button" variant="outline" size="sm" onClick={handleAddMenu}>
            New menu
          </Button>
        </div>
        <p className="mt-2 text-sm text-slate-400">
          Edit menu names, toggle availability, and manage items across your catalog.
        </p>
        {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}
      </div>

      <div className="space-y-8">
        {menus.map((menu) => (
          <Card key={menu.id || `unsaved-${menu.name}`} className="border-slate-800 bg-slate-900/60 text-slate-100">
            <CardContent className="space-y-6 p-6">
              <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 space-y-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2 text-sm text-slate-300">
                    <Label htmlFor={`menu-${menu.id}-name`} className="text-slate-300">
                      Menu name
                    </Label>
                    <Input
                      id={`menu-${menu.id}-name`}
                      value={menu.name}
                      onChange={(event) => handleMenuFieldChange(menu.id, 'name', event.target.value)}
                    />
                  </div>
                  <div className="space-y-2 text-sm text-slate-300">
                    <Label htmlFor={`menu-${menu.id}-translation`} className="text-slate-300">
                      Translation key
                    </Label>
                    <Input
                      id={`menu-${menu.id}-translation`}
                      value={menu.translationKey ?? ''}
                      onChange={(event) => handleMenuFieldChange(menu.id, 'translationKey', event.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2 text-sm text-slate-300">
                  <Label htmlFor={`menu-${menu.id}-description`} className="text-slate-300">
                    Description
                  </Label>
                  <Textarea
                    id={`menu-${menu.id}-description`}
                    value={menu.description ?? ''}
                    rows={2}
                    onChange={(event) => handleMenuFieldChange(menu.id, 'description', event.target.value)}
                  />
                </div>
                <label className="inline-flex items-center gap-2 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    checked={menu.isActive}
                    onChange={(event) => handleMenuFieldChange(menu.id, 'isActive', event.target.checked)}
                    className="h-4 w-4 rounded border-slate-600 bg-slate-950"
                  />
                  Menu is active
                </label>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  onClick={() => handleSaveMenu(menu)}
                  disabled={
                    savingMenuId !== null &&
                    (savingMenuId === menu.id || (savingMenuId === 'new' && menu.id.startsWith('temp-menu-')))
                  }
                >
                  {savingMenuId !== null &&
                  (savingMenuId === menu.id || (savingMenuId === 'new' && menu.id.startsWith('temp-menu-')))
                    ? 'Saving…'
                    : 'Save changes'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="border-red-900/40 text-red-300 hover:bg-red-900/20"
                  onClick={() => handleDeleteMenu(menu.id)}
                >
                  Delete menu
                </Button>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-100">Menu items</h3>
                <Button type="button" variant="outline" size="sm" onClick={() => handleAddItem(menu.id)}>
                  Add item
                </Button>
              </div>
              <div className="space-y-4">
                {menu.items.length === 0 ? (
                  <p className="text-sm text-slate-400">No items yet. Add your first item to this menu.</p>
                ) : (
                  menu.items.map((item) => (
                    <Card key={item.id} className="border-slate-800 bg-slate-950/60 text-slate-100">
                      <CardContent className="space-y-3 p-4 text-sm">
                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor={`item-${item.id}-name`} className="text-slate-300">
                              Item name
                            </Label>
                            <Input
                              id={`item-${item.id}-name`}
                              value={item.name}
                              onChange={(event) => handleMenuItemChange(menu.id, item.id, 'name', event.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`item-${item.id}-category`} className="text-slate-300">
                              Category
                            </Label>
                            <Input
                              id={`item-${item.id}-category`}
                              value={item.categoryKey ?? ''}
                              onChange={(event) => handleMenuItemChange(menu.id, item.id, 'categoryKey', event.target.value)}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`item-${item.id}-description`} className="text-slate-300">
                            Description
                          </Label>
                          <Textarea
                            id={`item-${item.id}-description`}
                            value={item.description ?? ''}
                            rows={2}
                            onChange={(event) => handleMenuItemChange(menu.id, item.id, 'description', event.target.value)}
                          />
                        </div>
                        <div className="grid gap-3 md:grid-cols-4">
                          <div className="space-y-2">
                            <Label htmlFor={`item-${item.id}-price`} className="text-slate-300">
                              Price
                            </Label>
                            <Input
                              id={`item-${item.id}-price`}
                              type="number"
                              value={item.price}
                              onChange={(event) => handleMenuItemChange(menu.id, item.id, 'price', Number(event.target.value))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`item-${item.id}-currency`} className="text-slate-300">
                              Currency
                            </Label>
                            <Input
                              id={`item-${item.id}-currency`}
                              value={item.currency}
                              onChange={(event) => handleMenuItemChange(menu.id, item.id, 'currency', event.target.value)}
                            />
                          </div>
                          <label className="flex items-center gap-2 text-slate-200">
                            <input
                              type="checkbox"
                              checked={item.isAvailable}
                              onChange={(event) => handleMenuItemChange(menu.id, item.id, 'isAvailable', event.target.checked)}
                              className="h-4 w-4 rounded border-slate-600 bg-slate-950"
                            />
                            Available
                          </label>
                          <label className="flex items-center gap-2 text-slate-200">
                            <input
                              type="checkbox"
                              checked={item.isPopular ?? false}
                              onChange={(event) => handleMenuItemChange(menu.id, item.id, 'isPopular', event.target.checked)}
                              className="h-4 w-4 rounded border-slate-600 bg-slate-950"
                            />
                            Mark as popular
                          </label>
                        </div>
                      </CardContent>
                      <CardFooter className="justify-end border-t border-slate-800 bg-transparent px-4 py-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="border-red-900/40 text-red-300 hover:bg-red-900/20"
                          onClick={() => handleRemoveItem(menu.id, item.id)}
                        >
                          Remove item
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        ))}
      </div>

      <Card className="border-slate-800 bg-slate-900/60 text-slate-100">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-xl text-slate-100">Pricing overrides</CardTitle>
              <CardDescription className="text-slate-400">
                Configure time-bound discounts and pricing adjustments for specific items.
              </CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={handleAddOverride}>
              Add override
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {pricingOverrides.length === 0 ? (
            <p className="text-sm text-slate-400">No overrides configured.</p>
          ) : (
            pricingOverrides.map((override) => {
              const savingCurrentOverride =
                savingOverrideId !== null &&
                (savingOverrideId === override.id ||
                  (savingOverrideId === 'new' && override.id.startsWith('temp-override-')));

              return (
                <Card key={override.id} className="border-slate-800 bg-slate-950/60 text-slate-100">
                  <CardContent className="space-y-4 p-4 text-sm">
                    <div className="grid gap-3 md:grid-cols-4">
                      <div className="space-y-2">
                        <Label htmlFor={`override-${override.id}-item`} className="text-slate-300">
                          Menu item ID
                        </Label>
                        <Input
                          id={`override-${override.id}-item`}
                          value={override.menuItemId}
                          onChange={(event) =>
                            setPricingOverrides((prev) =>
                              prev.map((entry) =>
                                entry.id === override.id ? { ...entry, menuItemId: event.target.value } : entry,
                              ),
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`override-${override.id}-price`} className="text-slate-300">
                          Price
                        </Label>
                        <Input
                          id={`override-${override.id}-price`}
                          type="number"
                          value={override.price}
                          onChange={(event) =>
                            setPricingOverrides((prev) =>
                              prev.map((entry) =>
                                entry.id === override.id
                                  ? { ...entry, price: Number(event.target.value) }
                                  : entry,
                              ),
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`override-${override.id}-currency`} className="text-slate-300">
                          Currency
                        </Label>
                        <Input
                          id={`override-${override.id}-currency`}
                          value={override.currency}
                          onChange={(event) =>
                            setPricingOverrides((prev) =>
                              prev.map((entry) =>
                                entry.id === override.id ? { ...entry, currency: event.target.value } : entry,
                              ),
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`override-${override.id}-reason`} className="text-slate-300">
                          Reason
                        </Label>
                        <Input
                          id={`override-${override.id}-reason`}
                          value={override.reason ?? ''}
                          onChange={(event) =>
                            setPricingOverrides((prev) =>
                              prev.map((entry) =>
                                entry.id === override.id ? { ...entry, reason: event.target.value } : entry,
                              ),
                            )
                          }
                        />
                      </div>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor={`override-${override.id}-start`} className="text-slate-300">
                          Starts at
                        </Label>
                        <Input
                          id={`override-${override.id}-start`}
                          type="datetime-local"
                          value={override.startsAt ? override.startsAt.slice(0, 16) : ''}
                          onChange={(event) =>
                            setPricingOverrides((prev) =>
                              prev.map((entry) =>
                                entry.id === override.id
                                  ? {
                                      ...entry,
                                      startsAt: event.target.value ? new Date(event.target.value).toISOString() : null,
                                    }
                                  : entry,
                              ),
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`override-${override.id}-end`} className="text-slate-300">
                          Ends at
                        </Label>
                        <Input
                          id={`override-${override.id}-end`}
                          type="datetime-local"
                          value={override.endsAt ? override.endsAt.slice(0, 16) : ''}
                          onChange={(event) =>
                            setPricingOverrides((prev) =>
                              prev.map((entry) =>
                                entry.id === override.id
                                  ? {
                                      ...entry,
                                      endsAt: event.target.value ? new Date(event.target.value).toISOString() : null,
                                    }
                                  : entry,
                              ),
                            )
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="justify-end gap-3 border-t border-slate-800 bg-transparent px-4 py-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-red-900/40 text-red-300 hover:bg-red-900/20"
                      onClick={() => handleDeleteOverride(override.id)}
                    >
                      Remove
                    </Button>
                    <Button type="button" size="sm" onClick={() => handleSaveOverride({ ...override })} disabled={savingCurrentOverride}>
                      {savingCurrentOverride ? 'Saving…' : 'Save override'}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-800 bg-slate-900/60 text-slate-100">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-xl text-slate-100">Operating hours</CardTitle>
              <CardDescription className="text-slate-400">
                Define the hours of operation for dine-in and delivery.
              </CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={handleAddOperatingHour}>
              Add schedule
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {sortedHours.length === 0 ? (
            <p className="text-sm text-slate-400">No schedules configured.</p>
          ) : (
            sortedHours.map((hour) => {
              const savingCurrentHour =
                savingHourId !== null &&
                (savingHourId === hour.id || (savingHourId === 'new' && hour.id.startsWith('temp-hour-')));

              return (
                <Card key={hour.id} className="border-slate-800 bg-slate-950/60 text-slate-100">
                  <CardContent className="grid gap-3 p-4 text-sm md:grid-cols-5">
                    <div className="space-y-2">
                      <Label htmlFor={`hour-${hour.id}-day`} className="text-slate-300">
                        Day
                      </Label>
                      <Select
                        id={`hour-${hour.id}-day`}
                        value={hour.dayOfWeek}
                        onChange={(event) =>
                          setOperatingHours((prev) =>
                            prev.map((entry) =>
                              entry.id === hour.id ? { ...entry, dayOfWeek: Number(event.target.value) } : entry,
                            ),
                          )
                        }
                      >
                        {dayNames.map((name, index) => (
                          <option key={name} value={index}>
                            {name}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`hour-${hour.id}-open`} className="text-slate-300">
                        Opens
                      </Label>
                      <Input
                        id={`hour-${hour.id}-open`}
                        value={hour.opensAt}
                        onChange={(event) =>
                          setOperatingHours((prev) =>
                            prev.map((entry) =>
                              entry.id === hour.id ? { ...entry, opensAt: event.target.value } : entry,
                            ),
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`hour-${hour.id}-close`} className="text-slate-300">
                        Closes
                      </Label>
                      <Input
                        id={`hour-${hour.id}-close`}
                        value={hour.closesAt}
                        onChange={(event) =>
                          setOperatingHours((prev) =>
                            prev.map((entry) =>
                              entry.id === hour.id ? { ...entry, closesAt: event.target.value } : entry,
                            ),
                          )
                        }
                      />
                    </div>
                    <label className="flex items-center gap-2 text-slate-200">
                      <input
                        type="checkbox"
                        checked={hour.isClosed ?? false}
                        onChange={(event) =>
                          setOperatingHours((prev) =>
                            prev.map((entry) =>
                              entry.id === hour.id ? { ...entry, isClosed: event.target.checked } : entry,
                            ),
                          )
                        }
                        className="h-4 w-4 rounded border-slate-600 bg-slate-950"
                      />
                      Closed
                    </label>
                  </CardContent>
                  <CardFooter className="justify-end gap-2 border-t border-slate-800 bg-transparent px-4 py-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-red-900/40 text-red-300 hover:bg-red-900/20"
                      onClick={() => handleDeleteOperatingHour(hour.id)}
                    >
                      Remove
                    </Button>
                    <Button type="button" size="sm" onClick={() => handleSaveOperatingHour(hour)} disabled={savingCurrentHour}>
                      {savingCurrentHour ? 'Saving…' : 'Save hours'}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
