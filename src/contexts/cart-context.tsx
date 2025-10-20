"use client"

import { createContext, useCallback, useContext, useMemo, useReducer, type ReactNode } from "react"

export interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image?: string
}

interface CartState {
  items: CartItem[]
}

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: { id: number } }
  | { type: "INCREMENT"; payload: { id: number } }
  | { type: "DECREMENT"; payload: { id: number } }
  | { type: "SET_QUANTITY"; payload: { id: number; quantity: number } }
  | { type: "CLEAR" }

interface CartContextValue {
  items: CartItem[]
  subtotal: number
  deliveryFee: number
  total: number
  addItem: (item: CartItem) => void
  removeItem: (id: number) => void
  increaseQuantity: (id: number) => void
  decreaseQuantity: (id: number) => void
  setQuantity: (id: number, quantity: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingIndex = state.items.findIndex((item) => item.id === action.payload.id)

      if (existingIndex >= 0) {
        const items = state.items.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item,
        )
        return { items }
      }

      return { items: [...state.items, action.payload] }
    }
    case "REMOVE_ITEM": {
      return { items: state.items.filter((item) => item.id !== action.payload.id) }
    }
    case "INCREMENT": {
      return {
        items: state.items.map((item) =>
          item.id === action.payload.id ? { ...item, quantity: item.quantity + 1 } : item,
        ),
      }
    }
    case "DECREMENT": {
      return {
        items: state.items
          .map((item) =>
            item.id === action.payload.id ? { ...item, quantity: item.quantity - 1 } : item,
          )
          .filter((item) => item.quantity > 0),
      }
    }
    case "SET_QUANTITY": {
      const { id, quantity } = action.payload
      if (quantity <= 0) {
        return { items: state.items.filter((item) => item.id !== id) }
      }

      return {
        items: state.items.map((item) => (item.id === id ? { ...item, quantity } : item)),
      }
    }
    case "CLEAR": {
      return { items: [] }
    }
    default: {
      return state
    }
  }
}

const DELIVERY_FEE = 2.99

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] })

  const subtotal = useMemo(
    () => state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [state.items],
  )
  const total = useMemo(() => subtotal + DELIVERY_FEE, [subtotal])

  const addItem = useCallback((item: CartItem) => {
    dispatch({ type: "ADD_ITEM", payload: item })
  }, [])

  const removeItem = useCallback((id: number) => {
    dispatch({ type: "REMOVE_ITEM", payload: { id } })
  }, [])

  const increaseQuantity = useCallback((id: number) => {
    dispatch({ type: "INCREMENT", payload: { id } })
  }, [])

  const decreaseQuantity = useCallback((id: number) => {
    dispatch({ type: "DECREMENT", payload: { id } })
  }, [])

  const setQuantity = useCallback((id: number, quantity: number) => {
    dispatch({ type: "SET_QUANTITY", payload: { id, quantity } })
  }, [])

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR" })
  }, [])

  const value = useMemo(
    () => ({
      items: state.items,
      subtotal,
      deliveryFee: DELIVERY_FEE,
      total,
      addItem,
      removeItem,
      increaseQuantity,
      decreaseQuantity,
      setQuantity,
      clearCart,
    }),
    [state.items, subtotal, total, addItem, removeItem, increaseQuantity, decreaseQuantity, setQuantity, clearCart],
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
