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

export interface CartItem {
  id: number
  quantity: number
}

interface CartContextValue {
  items: CartItem[]
  addItem: (id: number, quantity?: number) => void
  updateItemQuantity: (id: number, quantity: number) => void
  removeItem: (id: number) => void
  clear: () => void
  getItemQuantity: (id: number) => number
  totalItems: number
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

const STORAGE_KEY = "pizzakebab-cart-items"

type CartDraft = Record<number, CartItem>

const toDraft = (items: CartItem[]): CartDraft => {
  return items.reduce<CartDraft>((draft, line) => {
    draft[line.id] = line
    return draft
  }, {})
}

const fromDraft = (draft: CartDraft | undefined | null): CartItem[] => {
  if (!draft) return []
  return Object.values(draft)
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as CartDraft
      setItems(fromDraft(parsed))
    } catch (error) {
      console.warn("Unable to read cart from storage", error)
    }
  }, [])

  useEffect(() => {
    try {
      const draft = toDraft(items)
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
    } catch (error) {
      console.warn("Unable to persist cart", error)
    }
  }, [items])

  const addItem = useCallback((id: number, quantity = 1) => {
    setItems((previous) => {
      const draft = toDraft(previous)
      const existing = draft[id]
      const nextQuantity = Math.max(1, (existing?.quantity ?? 0) + quantity)
      draft[id] = { id, quantity: nextQuantity }
      return fromDraft(draft)
    })
  }, [])

  const updateItemQuantity = useCallback((id: number, quantity: number) => {
    if (quantity < 1) {
      setItems((previous) => previous.filter((line) => line.id !== id))
      return
    }
    setItems((previous) => {
      const draft = toDraft(previous)
      if (!draft[id]) return previous
      draft[id] = { id, quantity }
      return fromDraft(draft)
    })
  }, [])

  const removeItem = useCallback((id: number) => {
    setItems((previous) => previous.filter((line) => line.id !== id))
  }, [])

  const clear = useCallback(() => {
    setItems([])
  }, [])

  const getItemQuantity = useCallback(
    (id: number) => {
      const match = items.find((line) => line.id === id)
      return match?.quantity ?? 0
    },
    [items],
  )

  const totalItems = useMemo(() => items.reduce((sum, line) => sum + line.quantity, 0), [items])

  const value = useMemo(
    () => ({ items, addItem, updateItemQuantity, removeItem, clear, getItemQuantity, totalItems }),
    [items, addItem, updateItemQuantity, removeItem, clear, getItemQuantity, totalItems],
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
