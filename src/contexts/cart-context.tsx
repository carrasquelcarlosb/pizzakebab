"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

const STORAGE_KEY = "pizzakebab.cart.v1"

export interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image?: string
  category?: string
}

interface CartContextValue {
  items: CartItem[]
  totalItems: number
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void
  updateQuantity: (id: number, quantity: number) => void
  removeItem: (id: number) => void
  clearCart: () => void
  getItemQuantity: (id: number) => number
  lastAddedItemId: number | null
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [lastAddedItemId, setLastAddedItemId] = useState<number | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed: CartItem[] = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setItems(parsed)
        }
      }
    } catch (error) {
      console.warn("Failed to restore cart from storage", error)
    } finally {
      setIsHydrated(true)
    }
  }, [])

  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") return

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch (error) {
      console.warn("Failed to persist cart to storage", error)
    }
  }, [items, isHydrated])

  useEffect(() => {
    if (lastAddedItemId === null) return

    const timer = window.setTimeout(() => setLastAddedItemId(null), 2000)
    return () => window.clearTimeout(timer)
  }, [lastAddedItemId])

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, quantity = 1) => {
      setItems((currentItems) => {
        const existingItem = currentItems.find((cartItem) => cartItem.id === item.id)

        if (existingItem) {
          return currentItems.map((cartItem) =>
            cartItem.id === item.id
              ? { ...cartItem, quantity: cartItem.quantity + quantity }
              : cartItem,
          )
        }

        return [...currentItems, { ...item, quantity }]
      })
      setLastAddedItemId(item.id)
    },
    [],
  )

  const updateQuantity = useCallback((id: number, quantity: number) => {
    setItems((currentItems) =>
      currentItems
        .map((item) => (item.id === id ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0),
    )
  }, [])

  const removeItem = useCallback((id: number) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id))
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const getItemQuantity = useCallback(
    (id: number) => items.find((item) => item.id === id)?.quantity ?? 0,
    [items],
  )

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  )

  const value = useMemo(
    () => ({
      items,
      totalItems,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      getItemQuantity,
      lastAddedItemId,
    }),
    [items, totalItems, addItem, updateQuantity, removeItem, clearCart, getItemQuantity, lastAddedItemId],
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
