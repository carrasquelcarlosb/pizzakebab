import type { KitchenTicketView, TicketAcknowledgementView } from './kitchen-queue';

export type TicketStreamEvent =
  | { type: 'ticket.created'; ticket: KitchenTicketView }
  | { type: 'ticket.updated'; ticket: KitchenTicketView }
  | { type: 'ticket.acknowledged'; ticket: KitchenTicketView; acknowledgement: TicketAcknowledgementView };

type TenantListener = (event: TicketStreamEvent) => void;
type GlobalListener = (tenantId: string, event: TicketStreamEvent) => void;

class TicketStream {
  private tenantListeners: Map<string, Set<TenantListener>> = new Map();
  private globalListeners: Set<GlobalListener> = new Set();

  subscribe(tenantId: string, listener: TenantListener): () => void {
    const listeners = this.tenantListeners.get(tenantId) ?? new Set<TenantListener>();
    listeners.add(listener);
    this.tenantListeners.set(tenantId, listeners);

    return () => {
      const tenantListeners = this.tenantListeners.get(tenantId);
      if (!tenantListeners) {
        return;
      }
      tenantListeners.delete(listener);
      if (tenantListeners.size === 0) {
        this.tenantListeners.delete(tenantId);
      }
    };
  }

  subscribeAll(listener: GlobalListener): () => void {
    this.globalListeners.add(listener);
    return () => {
      this.globalListeners.delete(listener);
    };
  }

  publish(tenantId: string, event: TicketStreamEvent): void {
    const listeners = this.tenantListeners.get(tenantId);
    if (listeners) {
      for (const listener of Array.from(listeners)) {
        try {
          listener(event);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('ticket listener failed', error);
        }
      }
    }

    if (this.globalListeners.size > 0) {
      for (const listener of Array.from(this.globalListeners)) {
        try {
          listener(tenantId, event);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('global ticket listener failed', error);
        }
      }
    }
  }
}

export const ticketStream = new TicketStream();
