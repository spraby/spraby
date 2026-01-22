'use client'

import {createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode} from 'react';

const CART_STORAGE_KEY = 'spraby_cart';

export type CartItem = {
  id: string
  productId: string
  variantId?: string
  brandId: string
  brandName?: string
  title: string
  variantTitle?: string
  image?: string | null
  price: string
  finalPrice: string
  quantity: number
}

type CartContextValue = {
  items: CartItem[]
  ready: boolean
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }, merge?: boolean) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider = ({children}: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (error) {
      console.error('Failed to load cart', error);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready || typeof window === 'undefined') return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to persist cart', error);
    }
  }, [items, ready]);

  const addItem = useCallback((item: Omit<CartItem, 'quantity'> & { quantity?: number }, merge: boolean = true) => {
    setItems(currentItems => {
      let newItems: CartItem[];

      if (merge) {
        // Поиск существующего товара с точно таким же ID
        const existingIndex = currentItems.findIndex(i => i.id === item.id);

        if (existingIndex >= 0) {
          // Увеличиваем количество существующего товара
          newItems = [...currentItems];
          newItems[existingIndex] = {
            ...newItems[existingIndex],
            quantity: newItems[existingIndex].quantity + (item.quantity ?? 1)
          };
        } else {
          // Добавляем новый товар
          newItems = [...currentItems, { ...item, quantity: item.quantity ?? 1 }];
        }
      } else {
        // Просто добавляем без объединения (для разных вариантов одного товара)
        newItems = [...currentItems, { ...item, quantity: item.quantity ?? 1 }];
      }

      return newItems;
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(currentItems => currentItems.filter(item => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setItems(currentItems => {
      return currentItems.map(item => {
        if (item.id === id) {
          return { ...item, quantity: Math.max(1, quantity) };
        }
        return item;
      });
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = useMemo(() =>
    items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const totalPrice = useMemo(() =>
    items.reduce((sum, item) => sum + (Number(item.finalPrice) * item.quantity), 0),
    [items]
  );

  const value = useMemo<CartContextValue>(() => ({
    items,
    ready,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice
  }), [items, ready, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
