import assert from "node:assert/strict"
import { afterEach, before, describe, it } from "node:test"
import React, { useEffect } from "react"
import { act } from "react-dom/test-utils"
import { createRoot, type Root } from "react-dom/client"

import { CartProvider, useCart } from "@/contexts/cart-context"
import { LanguageProvider } from "@/contexts/language-context"
import type {
  Cart,
  CartLineItem,
  CartService,
  CreateCartCommand,
  Order,
  SubmitOrderCommand,
  UpdateCartCommand,
} from "@/domain/cart"

class LocalStorageMock {
  private store = new Map<string, string>()

  get length() {
    return this.store.size
  }

  clear() {
    this.store.clear()
  }

  getItem(key: string) {
    return this.store.get(key) ?? null
  }

  key(index: number) {
    return Array.from(this.store.keys())[index] ?? null
  }

  removeItem(key: string) {
    this.store.delete(key)
  }

  setItem(key: string, value: string) {
    this.store.set(key, value)
  }
}

class MockNode {
  public parentNode: MockNode | null = null
  public childNodes: MockNode[] = []
  public ownerDocument: MockDocument
  public textContent: string | null = null

  constructor(public readonly nodeType: number, public readonly nodeName: string, ownerDocument: MockDocument) {
    this.ownerDocument = ownerDocument
  }

  appendChild<T extends MockNode>(node: T): T {
    this.childNodes.push(node)
    node.parentNode = this
    return node
  }

  removeChild<T extends MockNode>(node: T): T {
    const index = this.childNodes.indexOf(node)
    if (index === -1) {
      throw new Error("Node to remove was not found in children")
    }
    this.childNodes.splice(index, 1)
    node.parentNode = null
    return node
  }

  insertBefore<T extends MockNode>(node: T, referenceNode: MockNode | null): T {
    if (!referenceNode) {
      return this.appendChild(node)
    }
    const index = this.childNodes.indexOf(referenceNode)
    if (index === -1) {
      return this.appendChild(node)
    }
    this.childNodes.splice(index, 0, node)
    node.parentNode = this
    return node
  }

  contains(node: MockNode | null): boolean {
    if (!node) {
      return false
    }
    if (node === this) {
      return true
    }
    return this.childNodes.some((child) => child.contains(node))
  }
}

class MockElement extends MockNode {
  public readonly attributes = new Map<string, string>()
  public readonly style: Record<string, string> = {}
  public readonly dataset: Record<string, string> = {}
  public tagName: string

  constructor(tagName: string, ownerDocument: MockDocument) {
    super(1, tagName.toUpperCase(), ownerDocument)
    this.tagName = tagName.toUpperCase()
  }

  setAttribute(name: string, value: string) {
    this.attributes.set(name, String(value))
  }

  removeAttribute(name: string) {
    this.attributes.delete(name)
  }

  get firstChild() {
    return this.childNodes[0] ?? null
  }

  get lastChild() {
    return this.childNodes[this.childNodes.length - 1] ?? null
  }

  get innerHTML() {
    return this.childNodes.map((child) => child.textContent ?? "").join("")
  }

  set innerHTML(value: string) {
    this.childNodes = []
    if (value) {
      const textNode = this.ownerDocument.createTextNode(value)
      this.appendChild(textNode)
    }
  }
}

class MockText extends MockNode {
  constructor(text: string, ownerDocument: MockDocument) {
    super(3, "#text", ownerDocument)
    this.textContent = text
  }
}

class MockComment extends MockNode {
  public nodeValue: string

  constructor(text: string, ownerDocument: MockDocument) {
    super(8, "#comment", ownerDocument)
    this.textContent = text
    this.nodeValue = text
  }
}

class MockDocumentFragment extends MockNode {
  constructor(ownerDocument: MockDocument) {
    super(11, "#document-fragment", ownerDocument)
  }
}

class MockDocument {
  public readonly body: MockElement
  public readonly documentElement: MockElement
  public defaultView: Window & typeof globalThis

  constructor() {
    this.documentElement = new MockElement("html", this)
    this.body = new MockElement("body", this)
    this.documentElement.appendChild(this.body)
    this.defaultView = globalThis as Window & typeof globalThis
  }

  createElement(tagName: string) {
    return new MockElement(tagName, this)
  }

  createTextNode(text: string) {
    return new MockText(text, this)
  }

  createComment(text: string) {
    return new MockComment(text, this)
  }

  createDocumentFragment() {
    return new MockDocumentFragment(this)
  }
}

type CartValue = ReturnType<typeof useCart>

function TestConsumer({ onValue }: { onValue: (value: CartValue) => void }) {
  const value = useCart()

  useEffect(() => {
    onValue(value)
  }, [value, onValue])

  return null
}

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value))

interface UpdateCall {
  cartId: string
  payload: UpdateCartCommand
}

class MockCartService implements CartService {
  public readonly calls = {
    create: [] as CreateCartCommand[],
    get: [] as string[],
    update: [] as UpdateCall[],
    submit: [] as SubmitOrderCommand[],
  }

  private currentCart: Cart

  constructor(initialCart: Cart) {
    this.currentCart = clone(initialCart)
  }

  async createOrGetCart(payload: CreateCartCommand): Promise<Cart> {
    this.calls.create.push(payload)
    this.currentCart.sessionId = payload.sessionId ?? this.currentCart.sessionId ?? null
    return this.cloneCart()
  }

  async getCart(cartId: string): Promise<Cart> {
    this.calls.get.push(cartId)
    return this.cloneCart()
  }

  async updateCart(cartId: string, payload: UpdateCartCommand): Promise<Cart> {
    this.calls.update.push({ cartId, payload })
    if (payload.items) {
      this.currentCart.items = payload.items.map((item) => this.createLineItem(item))
    }
    if (payload.promoCode !== undefined) {
      this.currentCart.promoCode = payload.promoCode
    }
    this.recalculateTotals()
    this.currentCart.updatedAt = new Date().toISOString()
    return this.cloneCart()
  }

  async submitOrder(payload: SubmitOrderCommand): Promise<Order> {
    this.calls.submit.push(payload)
    return {
      id: "order-1",
      cartId: payload.cartId,
      status: "submitted",
      total: this.currentCart.totals.total,
      currency: this.currentCart.totals.currency,
      submittedAt: new Date().toISOString(),
      promotion: this.currentCart.promotion ?? null,
      totals: clone(this.currentCart.totals),
    }
  }

  private createLineItem(item: { menuItemId: string; quantity: number; notes?: string }): CartLineItem {
    const basePrice = 12
    return {
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      notes: item.notes,
      menuItem: {
        id: item.menuItemId,
        menuId: "menu-1",
        name: `Item ${item.menuItemId}`,
        price: basePrice,
        currency: this.currentCart.totals.currency,
        isAvailable: true,
      },
    }
  }

  private recalculateTotals() {
    const subtotal = this.currentCart.items.reduce((total, line) => {
      const unitPrice = line.menuItem?.price ?? 0
      return total + unitPrice * line.quantity
    }, 0)
    const deliveryFee = this.currentCart.totals.deliveryFee
    const discount = this.currentCart.promoCode ? 2 : 0
    const total = Math.max(subtotal - discount + deliveryFee, 0)

    this.currentCart.totals = {
      ...this.currentCart.totals,
      subtotal,
      discount,
      total,
    }
  }

  private cloneCart(): Cart {
    return clone(this.currentCart)
  }
}

function createCart(overrides: Partial<Cart> = {}): Cart {
  const now = new Date().toISOString()
  return {
    id: "cart-1",
    deviceId: "device-1",
    sessionId: "session-1",
    userId: null,
    status: "open",
    promoCode: null,
    createdAt: now,
    updatedAt: now,
    items: [
      {
        menuItemId: "42",
        quantity: 1,
        menuItem: {
          id: "42",
          menuId: "menu-1",
          name: "Four Cheese Pizza",
          price: 18,
          currency: "EUR",
          isAvailable: true,
        },
      },
    ],
    totals: {
      subtotal: 18,
      deliveryFee: 5,
      discount: 0,
      total: 23,
      currency: "EUR",
    },
    promotion: null,
    ...overrides,
  }
}

function setupDomEnvironment() {
  if (typeof globalThis.document !== "undefined") {
    return
  }
  const document = new MockDocument()
  const window = globalThis as Window & typeof globalThis
  const storage = new LocalStorageMock()
  document.defaultView = window
  window.document = document as unknown as Document
  window.localStorage = storage as unknown as Storage
  window.navigator = { userAgent: "node" } as Navigator
  window.window = window
  globalThis.window = window
  globalThis.document = window.document
  globalThis.localStorage = storage as unknown as Storage
  globalThis.navigator = window.navigator
  Object.defineProperty(globalThis, "IS_REACT_ACT_ENVIRONMENT", {
    configurable: true,
    writable: true,
    value: true,
  })
}

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

describe("CartProvider with mock CartService", () => {
  let root: Root | null = null
  let container: MockElement | null = null

  before(() => {
    setupDomEnvironment()
  })

  afterEach(() => {
    if (root) {
      root.unmount()
      root = null
    }
    container = null
    if (globalThis.localStorage) {
      globalThis.localStorage.clear()
    }
  })

  it("initializes cart state via injected service", async () => {
    const service = new MockCartService(createCart())
    container = (document as unknown as MockDocument).createElement("div")
    root = createRoot(container as unknown as Element)

    let latestValue: CartValue | undefined
    const handleValue = (value: CartValue) => {
      latestValue = value
    }

    act(() => {
      root.render(
        <LanguageProvider>
          <CartProvider service={service}>
            <TestConsumer onValue={handleValue} />
          </CartProvider>
        </LanguageProvider>,
      )
    })

    await flushPromises()

    assert.equal(service.calls.create.length, 1)
    assert.ok(latestValue, "Cart context value should be defined after initialization")
    assert.equal(latestValue?.itemCount, 1)
    assert.equal(latestValue?.items[0]?.name, "Four Cheese Pizza")
    assert.equal(latestValue?.subtotal, 18)
    assert.equal(latestValue?.deliveryFee, 5)
  })

  it("updates cart items without touching real API", async () => {
    const service = new MockCartService(createCart({ items: [] }))
    container = (document as unknown as MockDocument).createElement("div")
    root = createRoot(container as unknown as Element)

    let latestValue: CartValue | undefined
    const handleValue = (value: CartValue) => {
      latestValue = value
    }

    act(() => {
      root.render(
        <LanguageProvider>
          <CartProvider service={service}>
            <TestConsumer onValue={handleValue} />
          </CartProvider>
        </LanguageProvider>,
      )
    })

    await flushPromises()
    assert.ok(latestValue)

    await act(async () => {
      await latestValue?.addItem({ id: 101, name: "Garlic Bread", price: 6 }, 2)
      await flushPromises()
    })

    assert.equal(service.calls.update.length, 1)
    const updatePayload = service.calls.update[0]?.payload
    assert.ok(updatePayload?.items)
    assert.equal(updatePayload?.items?.[0]?.menuItemId, "101")
    assert.equal(updatePayload?.items?.[0]?.quantity, 2)

    assert.equal(latestValue?.itemCount, 2)
    assert(
      latestValue?.items.some((item) => item.id === 101 && item.quantity === 2),
      "Cart items should include the newly added product",
    )
  })
})
