import assert from 'node:assert/strict';
import { describe, it, beforeEach } from 'node:test';

import {
  Cart,
  CartClosedError,
  CartNotFoundError,
  CartRepository,
  CartSummaryBuilder,
  CartSummary,
  CartTotals,
  MenuItem,
  KitchenGateway,
  OrderRepository,
  ensureCart,
  getActiveCart,
  normalizeCartItems,
  submitOrder,
  updateCart,
  buildCartSummary,
  evaluatePromoCode,
} from '../../src/domain';

const baseTime = new Date('2023-01-01T00:00:00Z');

const createCart = (overrides: Partial<Cart> = {}): Cart => ({
  id: 'cart-1',
  deviceId: 'device-1',
  sessionId: null,
  userId: null,
  status: 'open',
  promoCode: null,
  createdAt: baseTime,
  updatedAt: baseTime,
  items: [],
  ...overrides,
});

const cloneCart = (cart: Cart): Cart => ({
  ...cart,
  createdAt: new Date(cart.createdAt),
  updatedAt: new Date(cart.updatedAt),
  items: cart.items.map((item) => ({ ...item })),
});

class InMemoryCartRepository implements CartRepository {
  private carts = new Map<string, Cart>();

  constructor(initialCarts: Cart[] = []) {
    initialCarts.forEach((cart) => {
      this.carts.set(cart.id, cloneCart(cart));
    });
  }

  async findOpenCartByIdentifiers({ deviceId, sessionId, userId }: {
    deviceId?: string;
    sessionId?: string;
    userId?: string;
  }): Promise<Cart | null> {
    for (const cart of this.carts.values()) {
      if (cart.status !== 'open') {
        continue;
      }
      if (deviceId && cart.deviceId === deviceId) {
        return cloneCart(cart);
      }
      if (sessionId && cart.sessionId === sessionId) {
        return cloneCart(cart);
      }
      if (userId && cart.userId === userId) {
        return cloneCart(cart);
      }
    }
    return null;
  }

  async findById(cartId: string): Promise<Cart | null> {
    const cart = this.carts.get(cartId);
    return cart ? cloneCart(cart) : null;
  }

  async create(input: { id: string; deviceId: string; sessionId?: string | null; userId?: string | null; promoCode?: string | null; }): Promise<Cart> {
    const cart = createCart({
      id: input.id,
      deviceId: input.deviceId,
      sessionId: input.sessionId ?? null,
      userId: input.userId ?? null,
      promoCode: input.promoCode ?? null,
      items: [],
    });
    this.carts.set(cart.id, cloneCart(cart));
    return cloneCart(cart);
  }

  async update(cartId: string, update: { items?: Cart['items']; promoCode?: string | null }): Promise<Cart> {
    const existing = this.carts.get(cartId);
    if (!existing) {
      throw new Error('Cart not found');
    }
    const next: Cart = cloneCart(existing);
    if (update.items) {
      next.items = update.items.map((item) => ({ ...item }));
    }
    if (Object.prototype.hasOwnProperty.call(update, 'promoCode')) {
      next.promoCode = update.promoCode ?? null;
    }
    next.updatedAt = new Date(next.updatedAt.getTime() + 1_000);
    this.carts.set(cartId, cloneCart(next));
    return cloneCart(next);
  }

  async setStatus(cartId: string, status: Cart['status']): Promise<void> {
    const existing = this.carts.get(cartId);
    if (!existing) {
      throw new Error('Cart not found');
    }
    existing.status = status;
    existing.updatedAt = new Date(existing.updatedAt.getTime() + 1_000);
    this.carts.set(cartId, cloneCart(existing));
  }
}

class InMemoryOrderRepository implements OrderRepository {
  public created: Array<{
    id: string;
    cartId: string;
    status: string;
    total: number;
    currency: string;
    submittedAt: Date;
    promotionCode?: string | null;
    items: Array<{ menuItemId: string; quantity: number; notes?: string }>;
    deliveryFee?: number;
    discountTotal?: number;
    customer?: { name?: string; phone?: string; email?: string };
    notes?: string;
  }> = [];

  async create(input: (typeof this.created)[number]): Promise<void> {
    this.created.push({ ...input, submittedAt: new Date(input.submittedAt) });
  }
}

class InMemoryKitchenGateway implements KitchenGateway {
  public enqueued: Array<{
    orderId: string;
    cartId: string;
    totals: CartTotals;
    items: CartSummary['items'];
    customer?: { name?: string; phone?: string; email?: string };
    notes?: string;
  }> = [];

  async enqueue(payload: {
    orderId: string;
    cartId: string;
    totals: CartTotals;
    items: CartSummary['items'];
    customer?: { name?: string; phone?: string; email?: string };
    notes?: string;
  }): Promise<void> {
    this.enqueued.push({ ...payload, totals: { ...payload.totals } });
  }
}

const menuItems: MenuItem[] = [
  {
    id: 'pizza-margherita',
    menuId: 'menu-1',
    name: 'Margherita',
    price: 10,
    currency: 'USD',
    isAvailable: true,
  },
  {
    id: 'pizza-veggie',
    menuId: 'menu-1',
    name: 'Veggie',
    price: 12,
    currency: 'USD',
    isAvailable: false,
  },
];

const summaryBuilder: CartSummaryBuilder = async (cart) =>
  buildCartSummary(cart, menuItems, evaluatePromoCode);

describe('normalizeCartItems', () => {
  it('aggregates quantities and drops invalid entries', () => {
    const items = normalizeCartItems([
      { menuItemId: 'pizza-margherita', quantity: 2 },
      { menuItemId: 'pizza-margherita', quantity: 3.7 },
      { menuItemId: 'pizza-veggie', quantity: -1 },
      { menuItemId: 'pizza-calzone', quantity: 0 },
      { menuItemId: '', quantity: 2 },
    ]);

    assert.equal(items.length, 1);
    assert.deepEqual(items[0], { menuItemId: 'pizza-margherita', quantity: 5 });
  });
});

describe('ensureCart', () => {
  let repository: InMemoryCartRepository;

  beforeEach(() => {
    repository = new InMemoryCartRepository();
  });

  it('creates a new cart when none exist for identifiers', async () => {
    const result = await ensureCart(
      {
        cartRepository: repository,
        summaryBuilder,
        idGenerator: () => 'generated-id',
      },
      {
        identifiers: { deviceId: 'device-1' },
        promoCode: 'WELCOME20',
      },
    );

    assert.equal(result.cart.id, 'generated-id');
    const stored = await repository.findById('generated-id');
    assert.equal(stored?.promoCode, 'WELCOME20');
    assert.deepEqual(result.summary.totals, {
      subtotal: 0,
      deliveryFee: 0,
      discount: 0,
      total: 0,
      currency: 'USD',
    });
  });

  it('updates promo code on an existing cart', async () => {
    const existing = createCart({ id: 'cart-123', promoCode: null });
    repository = new InMemoryCartRepository([existing]);

    const result = await ensureCart(
      {
        cartRepository: repository,
        summaryBuilder,
        idGenerator: () => 'another-id',
      },
      {
        identifiers: { deviceId: existing.deviceId },
        promoCode: 'FREESHIP',
      },
    );

    assert.equal(result.cart.id, 'cart-123');
    assert.equal(result.cart.promoCode, 'FREESHIP');
  });
});

describe('getActiveCart', () => {
  it('returns a cart summary when cart is open', async () => {
    const cart = createCart({
      id: 'cart-1',
      items: [{ menuItemId: 'pizza-margherita', quantity: 2 }],
    });
    const repository = new InMemoryCartRepository([cart]);

    const result = await getActiveCart({ cartRepository: repository, summaryBuilder }, 'cart-1');

    assert.equal(result.summary.totals.subtotal, 20);
  });

  it('throws when cart cannot be found', async () => {
    const repository = new InMemoryCartRepository();
    await assert.rejects(() => getActiveCart({ cartRepository: repository, summaryBuilder }, 'missing'), CartNotFoundError);
  });

  it('throws when cart is closed', async () => {
    const cart = createCart({ id: 'cart-closed', status: 'checked_out' });
    const repository = new InMemoryCartRepository([cart]);
    await assert.rejects(() => getActiveCart({ cartRepository: repository, summaryBuilder }, 'cart-closed'), CartClosedError);
  });
});

describe('updateCart', () => {
  it('normalizes items and updates promo codes when requested', async () => {
    const cart = createCart({ id: 'cart-1' });
    const repository = new InMemoryCartRepository([cart]);

    const result = await updateCart(
      { cartRepository: repository, summaryBuilder },
      {
        cartId: 'cart-1',
        items: [
          { menuItemId: 'pizza-margherita', quantity: 2.4 },
          { menuItemId: 'pizza-margherita', quantity: 1 },
          { menuItemId: 'pizza-veggie', quantity: 0 },
        ],
        promoCode: 'WELCOME20',
        shouldUpdatePromoCode: true,
      },
    );

    assert.equal(result.cart.promoCode, 'WELCOME20');
    assert.deepEqual(result.cart.items, [{ menuItemId: 'pizza-margherita', quantity: 3 }]);
    assert.equal(result.summary.totals.subtotal, 30);
  });

  it('throws when cart is closed', async () => {
    const cart = createCart({ id: 'cart-2', status: 'checked_out' });
    const repository = new InMemoryCartRepository([cart]);

    await assert.rejects(
      () =>
        updateCart(
          { cartRepository: repository, summaryBuilder },
          { cartId: 'cart-2', items: [], shouldUpdatePromoCode: false },
        ),
      CartClosedError,
    );
  });
});

describe('submitOrder', () => {
  let repository: InMemoryCartRepository;
  let orderRepository: InMemoryOrderRepository;
  let kitchenGateway: InMemoryKitchenGateway;

  beforeEach(() => {
    const cart = createCart({
      id: 'cart-submit',
      items: [
        { menuItemId: 'pizza-margherita', quantity: 2 },
        { menuItemId: 'pizza-veggie', quantity: 1 },
      ],
      promoCode: 'WELCOME20',
    });
    repository = new InMemoryCartRepository([cart]);
    orderRepository = new InMemoryOrderRepository();
    kitchenGateway = new InMemoryKitchenGateway();
  });

  it('creates an order, marks the cart as checked out, and enqueues the kitchen ticket', async () => {
    const receipt = await submitOrder(
      {
        cartRepository: repository,
        orderRepository,
        summaryBuilder,
        kitchenGateway,
        idGenerator: () => 'order-1',
        now: () => baseTime,
      },
      {
        cartId: 'cart-submit',
        promoCode: 'WELCOME20',
        notes: 'No onions',
        customer: { name: 'Ada Lovelace' },
      },
    );

    assert.equal(receipt.order.id, 'order-1');
    assert.equal(receipt.order.status, 'pending');
    assert.equal(receipt.order.totals.total, receipt.order.totals.subtotal + receipt.order.totals.deliveryFee - receipt.order.totals.discount);

    assert.equal(orderRepository.created.length, 1);
    assert.equal(orderRepository.created[0].id, 'order-1');
    assert.equal(orderRepository.created[0].promotionCode, 'WELCOME20');

    assert.equal(kitchenGateway.enqueued.length, 1);
    assert.equal(kitchenGateway.enqueued[0].orderId, 'order-1');

    const storedCart = await repository.findById('cart-submit');
    assert.equal(storedCart?.status, 'checked_out');
  });

  it('throws when the cart cannot be found', async () => {
    repository = new InMemoryCartRepository();

    await assert.rejects(
      () =>
        submitOrder(
          {
            cartRepository: repository,
            orderRepository,
            summaryBuilder,
            kitchenGateway,
            idGenerator: () => 'order-2',
            now: () => baseTime,
          },
          { cartId: 'missing' },
        ),
      CartNotFoundError,
    );
  });

  it('throws when the cart is closed', async () => {
    const cart = createCart({ id: 'closed-cart', status: 'checked_out' });
    repository = new InMemoryCartRepository([cart]);

    await assert.rejects(
      () =>
        submitOrder(
          {
            cartRepository: repository,
            orderRepository,
            summaryBuilder,
            kitchenGateway,
            idGenerator: () => 'order-3',
            now: () => baseTime,
          },
          { cartId: 'closed-cart' },
        ),
      CartClosedError,
    );
  });
});
