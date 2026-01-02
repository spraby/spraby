'use client'

import {useState, useEffect, useCallback} from 'react';

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

export function useCart() {
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

  const saveToStorage = useCallback((newItems: CartItem[]) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newItems));
    } catch (error) {
      console.error('Failed to save cart', error);
    }
  }, []);

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

      saveToStorage(newItems);
      return newItems;
    });
  }, [saveToStorage]);

  const removeItem = useCallback((id: string) => {
    setItems(currentItems => {
      const newItems = currentItems.filter(item => item.id !== id);
      saveToStorage(newItems);
      return newItems;
    });
  }, [saveToStorage]);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setItems(currentItems => {
      const newItems = currentItems.map(item => {
        if (item.id === id) {
          return { ...item, quantity: Math.max(1, quantity) };
        }
        return item;
      });
      saveToStorage(newItems);
      return newItems;
    });
  }, [saveToStorage]);

  const clearCart = useCallback(() => {
    setItems([]);
    saveToStorage([]);
  }, [saveToStorage]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const totalPrice = items.reduce((sum, item) => {
    return sum + (Number(item.finalPrice) * item.quantity);
  }, 0);

  return {
    items,
    ready,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice
  };
}
