"use client"

import { createContext, useContext, useMemo, useState, useCallback, type ReactNode } from "react"

import {
  type CartItem,
  type OrderMode,
  calculateItemCount,
  calculateTotals,
} from "@/lib/cart"

interface CartContextValue {
  items: CartItem[]
  orderMode: OrderMode
  itemCount: number
  subtotal: number
  deliveryFee: number
  total: number
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void
  removeItem: (id: number) => void
  updateQuantity: (id: number, quantity: number) => void
  clearCart: () => void
  setOrderMode: (mode: OrderMode) => void
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [orderMode, setOrderMode] = useState<OrderMode>("delivery")

  const addItem = useCallback((item: Omit<CartItem, "quantity">, quantity = 1) => {
    setItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((cartItem) => cartItem.id === item.id)

      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems]
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity,
        }
        return updatedItems
      }

      return [...prevItems, { ...item, quantity }]
    })
  }, [])

  const removeItem = useCallback((id: number) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id))
  }, [])

  const updateQuantity = useCallback((id: number, quantity: number) => {
    setItems((prevItems) => {
      if (quantity <= 0) {
        return prevItems.filter((item) => item.id !== id)
      }

      return prevItems.map((item) => (item.id === id ? { ...item, quantity } : item))
    })
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const totals = useMemo(() => calculateTotals(items, orderMode), [items, orderMode])
  const itemCount = useMemo(() => calculateItemCount(items), [items])

  const value = useMemo(
    () => ({
      items,
      orderMode,
      itemCount,
      subtotal: totals.subtotal,
      deliveryFee: totals.deliveryFee,
      total: totals.total,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      setOrderMode,
    }),
    [items, orderMode, itemCount, totals, addItem, removeItem, updateQuantity, clearCart, setOrderMode],
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
