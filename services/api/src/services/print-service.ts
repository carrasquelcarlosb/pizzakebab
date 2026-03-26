import type { FastifyInstance } from 'fastify';
import type { Filter } from 'mongodb';

import { getDatabase, getTenantCollections } from '../db/mongo';
import { COLLECTION_NAMES, type DeviceDocument, type KitchenTicketDocument } from '../db/schemas';
import { acknowledgeKitchenTicket } from './kitchen-queue';
import { ticketStream } from './ticket-stream';

const PRINT_WORKER_INTERVAL_MS = 15000;

const hasPrintCapability = (device: DeviceDocument): boolean =>
  Array.isArray(device.capabilities) && device.capabilities.includes('print');

class PrintServiceWorker {
  private intervalHandle?: NodeJS.Timeout;

  private unsubscribe?: () => void;

  private isProcessing = false;

  constructor(private readonly app: FastifyInstance, private readonly intervalMs: number) {}

  start(): void {
    this.intervalHandle = setInterval(() => {
      void this.processLoop();
    }, this.intervalMs);

    this.unsubscribe = ticketStream.subscribeAll((_tenantId, event) => {
      if (event.type === 'ticket.created' && event.ticket.printStatus === 'pending') {
        void this.processLoop();
      }
    });
  }

  stop(): void {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = undefined;
    }

    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = undefined;
    }
  }

  private async processLoop(): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    try {
      const db = await getDatabase();
      const deviceCollection = db.collection<DeviceDocument>(COLLECTION_NAMES.devices);
      const printers = await deviceCollection
        .find({ capabilities: { $in: ['print'] } } as Filter<DeviceDocument>)
        .toArray();

      for (const printer of printers) {
        if (!hasPrintCapability(printer) || printer.status === 'offline') {
          continue;
        }
        await this.processPrinter(printer);
      }
    } catch (error) {
      this.app.log.error({ err: error }, 'print worker loop failed');
    } finally {
      this.isProcessing = false;
    }
  }

  private async processPrinter(printer: DeviceDocument): Promise<void> {
    if (!printer.tenantId) {
      return;
    }

    const collections = await getTenantCollections(printer.tenantId);
    const ticket = await collections.kitchenTickets.findOne(
      { printStatus: 'pending' } as Filter<KitchenTicketDocument>,
      { sort: { enqueuedAt: 1 } },
    );

    if (!ticket) {
      return;
    }

    const claimResult = await collections.kitchenTickets.updateOne(
      { resourceId: ticket.resourceId, printStatus: 'pending' },
      { $set: { printStatus: 'printing', acknowledgedBy: printer.resourceId } },
    );

    if (claimResult.modifiedCount === 0) {
      return;
    }

    await acknowledgeKitchenTicket(collections, ticket.resourceId, {
      ticketId: ticket.resourceId,
      deviceId: printer.resourceId,
      status: 'printing',
      notes: 'Print job started by service worker',
    });

    try {
      await this.printTicket(printer, ticket);
      await acknowledgeKitchenTicket(collections, ticket.resourceId, {
        ticketId: ticket.resourceId,
        deviceId: printer.resourceId,
        status: 'printed',
        notes: 'Printed by kitchen service worker',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to print ticket';
      this.app.log.error(
        { err: error, ticketId: ticket.resourceId, deviceId: printer.resourceId },
        'printer worker failed to print ticket',
      );
      await acknowledgeKitchenTicket(collections, ticket.resourceId, {
        ticketId: ticket.resourceId,
        deviceId: printer.resourceId,
        status: 'failed',
        notes: message,
      });
    }
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  private async printTicket(printer: DeviceDocument, ticket: KitchenTicketDocument): Promise<void> {
    this.app.log.info(
      { printerId: printer.resourceId, ticketId: ticket.resourceId },
      'printing kitchen ticket via service worker',
    );
    // Integrate with vendor SDK here. For now we assume success.
  }
}

export const startPrintServiceWorker = (app: FastifyInstance): void => {
  const worker = new PrintServiceWorker(app, PRINT_WORKER_INTERVAL_MS);
  worker.start();

  app.addHook('onClose', async () => {
    worker.stop();
  });
};
