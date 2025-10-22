"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"

import {
  createOrGetCart,
  updateCart,
  getCart,
  submitOrder,
  type CartApi,
  type CartLineItem,
  type CartResponse,
} from "@/lib/api/cart"
import { type CartItem, type OrderMode, DEFAULT_DELIVERY_FEE } from "@/lib/cart"
import { useLanguage } from "./language-context"
import type { TranslationKey } from "@/lib/translations"

interface CartContextValue {
  cartId: string | null
  items: CartItem[]
  orderMode: OrderMode
  itemCount: number
  totalItems: number
  subtotal: number
  deliveryFee: number
  discount: number
  total: number
  promoCode: string | null
  isLoading: boolean
  error: string | null
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => Promise<void>
  removeItem: (id: number) => Promise<void>
  updateQuantity: (id: number, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  setOrderMode: (mode: OrderMode) => void
  applyPromoCode: (code: string | null) => Promise<void>
  refreshCart: () => Promise<void>
  submitCurrentOrder: (
    params?: { notes?: string; customer?: { name?: string; phone?: string; email?: string } },
  ) => Promise<void>
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

const CART_SESSION_STORAGE_KEY = "pizzakebab.cartSessionId"

const generateSessionId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2)
}

const ensureSessionId = (): string => {
  if (typeof window === "undefined") {
    return generateSessionId()
  }
  const existing = window.localStorage.getItem(CART_SESSION_STORAGE_KEY)
  if (existing) {
    return existing
  }
  const newId = generateSessionId()
  window.localStorage.setItem(CART_SESSION_STORAGE_KEY, newId)
  return newId
}

const parseMenuItemId = (raw: string): number => {
  const parsed = Number.parseInt(raw, 10)
  if (Number.isFinite(parsed)) {
    return parsed
  }

  // create a stable numeric hash for non-numeric ids
  return Array.from(raw).reduce((acc, char) => acc + char.charCodeAt(0), 0)
}

type TranslateFn = (key: TranslationKey) => string

const toDisplayItems = (lines: CartLineItem[], translate: TranslateFn): CartItem[] =>
  lines
    .filter((line) => line.quantity > 0)
    .map((line) => {
      const menuItem = line.menuItem
      const fallbackName = menuItem?.name ?? `Item ${line.menuItemId}`
      const name = menuItem?.nameKey ? translate(menuItem.nameKey) : fallbackName
      const image = menuItem?.imageUrl
      const price = menuItem?.price ?? 0
      const id = parseMenuItemId(menuItem?.id ?? line.menuItemId)

      return {
        id,
        name,
        price,
        quantity: line.quantity,
        image,
      }
    })

const sumQuantities = (items: CartItem[]): number => items.reduce((total, item) => total + item.quantity, 0)

const toCartUpdateItems = (lines: CartLineItem[]): UpdatePayloadItem[] =>
  lines.map((line) => ({
    menuItemId: line.menuItemId,
    quantity: line.quantity,
    notes: line.notes,
  }))

interface UpdatePayloadItem {
  menuItemId: string
  quantity: number
  notes?: string
}

const mergeLineItems = (current: CartLineItem[], updates: Map<string, number>): CartLineItem[] => {
  const mergedMap = new Map<string, CartLineItem>()

  for (const line of current) {
    mergedMap.set(line.menuItemId, { ...line })
  }

  for (const [menuItemId, quantity] of updates.entries()) {
    const existing = mergedMap.get(menuItemId)
    if (quantity <= 0) {
      mergedMap.delete(menuItemId)
      continue
    }

    mergedMap.set(menuItemId, {
      menuItemId,
      quantity,
      notes: existing?.notes,
      menuItem: existing?.menuItem,
    })
  }

  return Array.from(mergedMap.values())
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { t } = useLanguage()
  const [cart, setCart] = useState<CartApi | null>(null)
  const [orderMode, setOrderMode] = useState<OrderMode>("delivery")
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const sessionIdRef = useRef<string | null>(null)

  const initializeCart = useCallback(async () => {
    setIsLoading(true)
    try {
      if (!sessionIdRef.current) {
        sessionIdRef.current = ensureSessionId()
      }
      const response = await createOrGetCart({ sessionId: sessionIdRef.current })
      setCart(response.cart)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load cart")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void initializeCart()
  }, [initializeCart])

  const syncCart = useCallback(async (operation: () => Promise<CartResponse | void>) => {
    setIsLoading(true)
    try {
      const result = await operation()
      if (result && "cart" in result) {
        setCart(result.cart)
      } else if (cart?.id) {
        const refreshed = await getCart(cart.id)
        setCart(refreshed.cart)
      }
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update cart")
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [cart?.id])

  const updateCartItems = useCallback(
    async (updater: (current: CartLineItem[]) => CartLineItem[]) => {
      if (!cart?.id) {
        return
      }
      await syncCart(async () => {
        const nextItems = updater(cart.items)
        return updateCart(cart.id, { items: toCartUpdateItems(nextItems) })
      })
    },
    [cart, syncCart],
  )

  const addItem = useCallback<Required<CartContextValue>["addItem"]>(
    async (item, quantity = 1) => {
      const menuItemId = String(item.id)
      const updates = new Map<string, number>()
      updates.set(menuItemId, (cart?.items.find((line) => line.menuItemId === menuItemId)?.quantity ?? 0) + quantity)

      await updateCartItems((current) => mergeLineItems(current, updates))
    },
    [cart?.items, updateCartItems],
  )

  const removeItem = useCallback<Required<CartContextValue>["removeItem"]>(
    async (id) => {
      const menuItemId = String(id)
      const updates = new Map<string, number>()
      updates.set(menuItemId, 0)

      await updateCartItems((current) => mergeLineItems(current, updates))
    },
    [updateCartItems],
  )

  const updateQuantity = useCallback<Required<CartContextValue>["updateQuantity"]>(
    async (id, quantity) => {
      const menuItemId = String(id)
      const updates = new Map<string, number>()
      updates.set(menuItemId, quantity)

      await updateCartItems((current) => mergeLineItems(current, updates))
    },
    [updateCartItems],
  )

  const clearCart = useCallback(async () => {
    if (!cart?.id) {
      return
    }
    await syncCart(() => updateCart(cart.id, { items: [] }))
  }, [cart?.id, syncCart])

  const applyPromoCode = useCallback<Required<CartContextValue>["applyPromoCode"]>(
    async (code) => {
      if (!cart?.id) {
        return
      }
      await syncCart(() => updateCart(cart.id, { promoCode: code }))
    },
    [cart?.id, syncCart],
  )

  const refreshCart = useCallback(async () => {
    if (!cart?.id) {
      await initializeCart()
      return
    }
    setIsLoading(true)
    try {
      const refreshed = await getCart(cart.id)
      setCart(refreshed.cart)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refresh cart")
    } finally {
      setIsLoading(false)
    }
  }, [cart?.id, initializeCart])

  const submitCurrentOrder = useCallback<Required<CartContextValue>["submitCurrentOrder"]>(
    async (params) => {
      if (!cart?.id) {
        return
      }
      await syncCart(async () => {
        await submitOrder({
          cartId: cart.id,
          promoCode: cart.promoCode,
          notes: params?.notes,
          customer: params?.customer,
        })
        setCart(null)
        sessionIdRef.current = null
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(CART_SESSION_STORAGE_KEY)
        }
        return createOrGetCart({ sessionId: ensureSessionId() })
      })
    },
    [cart, syncCart],
  )

  const displayItems = useMemo(() => toDisplayItems(cart?.items ?? [], t), [cart?.items, t])
  const itemCount = useMemo(() => sumQuantities(displayItems), [displayItems])

  const baseSubtotal = cart?.totals.subtotal ?? 0
  const baseDeliveryFee = cart?.totals.deliveryFee ?? DEFAULT_DELIVERY_FEE
  const discount = cart?.totals.discount ?? 0
  const appliedDeliveryFee = orderMode === "pickup" ? 0 : baseDeliveryFee
  const total = Math.max(baseSubtotal - discount + appliedDeliveryFee, 0)

  const value = useMemo<CartContextValue>(
    () => ({
      cartId: cart?.id ?? null,
      items: displayItems,
      orderMode,
      itemCount,
      totalItems: itemCount,
      subtotal: baseSubtotal,
      deliveryFee: appliedDeliveryFee,
      discount,
      total,
      promoCode: cart?.promoCode ?? null,
      isLoading,
      error,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      setOrderMode,
      applyPromoCode,
      refreshCart,
      submitCurrentOrder,
    }),
    [
      cart?.id,
      cart?.promoCode,
      displayItems,
      orderMode,
      itemCount,
      baseSubtotal,
      appliedDeliveryFee,
      discount,
      total,
      isLoading,
      error,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      applyPromoCode,
      refreshCart,
      submitCurrentOrder,
    ],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

