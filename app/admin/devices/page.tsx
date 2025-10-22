'use client';

import { useEffect, useState } from 'react';
import { AdminApiError, AdminDevice, adminApi } from '@/lib/admin-api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const DEVICE_TYPES: Array<AdminDevice['type']> = ['kiosk', 'tablet', 'mobile'];

const formatLastSeen = (value?: string | null) => {
  if (!value) {
    return 'Never';
  }
  return new Date(value).toLocaleString();
};

export default function AdminDevicesPage() {
  const [devices, setDevices] = useState<AdminDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newDevice, setNewDevice] = useState<Pick<AdminDevice, 'label' | 'type'>>({ label: '', type: 'kiosk' });
  const [savingDeviceId, setSavingDeviceId] = useState<string | null>(null);

  const loadDevices = async () => {
    setLoading(true);
    try {
      const result = await adminApi.devices();
      setDevices(result);
      setError(null);
    } catch (err) {
      if (err instanceof AdminApiError) {
        setError('Unable to load devices');
      } else {
        setError('Unexpected error fetching devices');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevices();
  }, []);

  const handleRegisterDevice = async () => {
    if (!newDevice.label.trim()) {
      setError('Device label is required');
      return;
    }
    setSavingDeviceId('new');
    try {
      const created = await adminApi.saveDevice(newDevice);
      if (created) {
        setDevices((prev) => [created, ...prev]);
        setNewDevice({ label: '', type: 'kiosk' });
      } else {
        await loadDevices();
      }
    } catch (err) {
      setError('Failed to register device');
    } finally {
      setSavingDeviceId(null);
    }
  };

  const handleUpdateDevice = async (device: AdminDevice) => {
    setSavingDeviceId(device.id);
    try {
      const updated = await adminApi.saveDevice(device);
      if (updated) {
        setDevices((prev) => prev.map((entry) => (entry.id === device.id ? updated : entry)));
      }
    } catch (err) {
      setError('Failed to update device');
    } finally {
      setSavingDeviceId(null);
    }
  };

  const handlePingDevice = async (deviceId: string) => {
    try {
      const updated = await adminApi.pingDevice(deviceId);
      if (updated) {
        setDevices((prev) => prev.map((entry) => (entry.id === deviceId ? updated : entry)));
      }
    } catch (err) {
      setError('Failed to ping device');
    }
  };

  const handleDeleteDevice = async (deviceId: string) => {
    try {
      await adminApi.deleteDevice(deviceId);
      setDevices((prev) => prev.filter((entry) => entry.id !== deviceId));
    } catch (err) {
      setError('Failed to remove device');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Device management</h1>
        <p className="mt-2 text-sm text-slate-400">
          Register kiosks, tablets, and other devices that connect to the admin APIs.
        </p>
      </div>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <Card className="border-slate-800 bg-slate-900/60 text-slate-100">
        <CardHeader>
          <CardTitle className="text-lg text-slate-100">Register new device</CardTitle>
          <CardDescription className="text-slate-400">
            Provide a label and select the type to register a new device with your tenant.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2 text-sm text-slate-300">
            <Label htmlFor="new-device-label" className="text-slate-300">
              Label
            </Label>
            <Input
              id="new-device-label"
              value={newDevice.label}
              onChange={(event) => setNewDevice((prev) => ({ ...prev, label: event.target.value }))}
              placeholder="Front counter kiosk"
            />
          </div>
          <div className="space-y-2 text-sm text-slate-300">
            <Label htmlFor="new-device-type" className="text-slate-300">
              Device type
            </Label>
            <Select
              id="new-device-type"
              value={newDevice.type}
              onChange={(event) => setNewDevice((prev) => ({ ...prev, type: event.target.value as AdminDevice['type'] }))}
            >
              {DEVICE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex items-end">
            <Button type="button" className="w-full" onClick={handleRegisterDevice} disabled={savingDeviceId === 'new'}>
              {savingDeviceId === 'new' ? 'Registering…' : 'Register device'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-800 bg-slate-900/60 text-slate-100">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-lg text-slate-100">Registered devices</CardTitle>
            <CardDescription className="text-slate-400">
              Manage device labels, types, and track their last check-in time.
            </CardDescription>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={loadDevices}>
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-300">Loading devices…</p>
          ) : devices.length === 0 ? (
            <p className="text-sm text-slate-400">No devices registered yet.</p>
          ) : (
            <div className="space-y-4">
              {devices.map((device) => {
                const savingCurrentDevice = savingDeviceId === device.id;

                return (
                  <Card key={device.id} className="border-slate-800 bg-slate-950/60 text-slate-100">
                    <CardContent className="grid gap-3 p-4 text-sm md:grid-cols-4">
                      <div className="space-y-2">
                        <Label htmlFor={`device-${device.id}-label`} className="text-slate-300">
                          Label
                        </Label>
                        <Input
                          id={`device-${device.id}-label`}
                          value={device.label}
                          onChange={(event) =>
                            setDevices((prev) =>
                              prev.map((entry) =>
                                entry.id === device.id ? { ...entry, label: event.target.value } : entry,
                              ),
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`device-${device.id}-type`} className="text-slate-300">
                          Type
                        </Label>
                        <Select
                          id={`device-${device.id}-type`}
                          value={device.type}
                          onChange={(event) =>
                            setDevices((prev) =>
                              prev.map((entry) =>
                                entry.id === device.id
                                  ? { ...entry, type: event.target.value as AdminDevice['type'] }
                                  : entry,
                              ),
                            )
                          }
                        >
                          {DEVICE_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </option>
                          ))}
                        </Select>
                      </div>
                      <div className="space-y-2 text-slate-300">
                        <Label className="text-slate-300" htmlFor={`device-${device.id}-last-seen`}>
                          Last seen
                        </Label>
                        <p
                          id={`device-${device.id}-last-seen`}
                          className="rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-400"
                        >
                          {formatLastSeen(device.lastSeenAt)}
                        </p>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => handlePingDevice(device.id)}>
                          Ping
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="border-red-900/40 text-red-300 hover:bg-red-900/20"
                          onClick={() => handleDeleteDevice(device.id)}
                        >
                          Remove
                        </Button>
                        <Button type="button" size="sm" onClick={() => handleUpdateDevice(device)} disabled={savingCurrentDevice}>
                          {savingCurrentDevice ? 'Saving…' : 'Save'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
