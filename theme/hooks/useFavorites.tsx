'use client';

import {createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode} from "react";

const FAVORITES_STORAGE_KEY = 'spraby_favorites';

export type FavoriteProduct = {
  id: string;
  title: string;
  finalPrice: string;
  price: string | null;
  image: string | null;
  brand: string | null;
  productUrl: string;
};

export type FavoriteCandidate = {
  id: string | number | bigint;
  title?: string | null;
  finalPrice?: string | number | null;
  price?: string | number | null;
  image?: string | null;
  brand?: string | null;
  productUrl?: string | null;
};

type FavoritesContextValue = {
  favorites: FavoriteProduct[];
  count: number;
  ready: boolean;
  isFavorite: (id: string | number | bigint) => boolean;
  addFavorite: (payload: FavoriteCandidate) => void;
  removeFavorite: (id: string | number | bigint) => void;
  toggleFavorite: (payload: FavoriteCandidate) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

const toIdString = (value: unknown) => {
  if (typeof value === 'bigint') return value.toString();
  if (typeof value === 'number') return Number.isFinite(value) ? value.toString() : '';
  if (typeof value === 'string') return value.trim();
  return '';
};

const toPriceString = (raw: unknown): string | null => {
  if (typeof raw === 'number') {
    return Number.isFinite(raw) ? raw.toString() : null;
  }
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    return trimmed.length ? trimmed : null;
  }
  return null;
};

const normalizeImageSrc = (raw?: string | null): string | null => {
  if (!raw) return null;
  const value = raw.trim();
  if (!value.length) return null;
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:')) return value;
  if (value.startsWith('/')) return value;
  const stripped = value.replace(/^\.?\//, '');
  return stripped.length ? `/${stripped}` : null;
};

const normalizeFavoriteItem = (item: FavoriteCandidate): FavoriteProduct | null => {
  if (!item) return null;
  const id = toIdString(item.id);
  if (!id) return null;
  const title = typeof item.title === 'string' ? item.title.trim() : '';
  if (!title.length) return null;
  const finalPrice = toPriceString(item.finalPrice);
  if (!finalPrice) return null;

  const price = toPriceString(item.price);
  const normalizedImage = normalizeImageSrc(item.image ?? null);
  const normalizedBrand = typeof item.brand === 'string' ? item.brand.trim() : '';
  const productUrl = typeof item.productUrl === 'string' ? item.productUrl.trim() : '';

  return {
    id,
    title,
    finalPrice,
    price,
    image: normalizedImage,
    brand: normalizedBrand.length ? normalizedBrand : null,
    productUrl: productUrl.length ? productUrl : `/products/${id}`
  };
};

export const FavoritesProvider = ({children}: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (!raw) {
        setReady(true);
        return;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        setReady(true);
        return;
      }
      const normalized = parsed
        .map((item) => normalizeFavoriteItem(item))
        .filter((item): item is FavoriteProduct => item !== null);
      setFavorites(normalized);
    } catch (error) {
      console.error('Failed to load favorites', error);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready || typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error('Failed to persist favorites', error);
    }
  }, [favorites, ready]);

  const addFavorite = useCallback((payload: FavoriteCandidate) => {
    setFavorites((prev) => {
      const normalized = normalizeFavoriteItem(payload);
      if (!normalized) return prev;
      if (prev.some((item) => item.id === normalized.id)) return prev;
      return [normalized, ...prev];
    });
  }, []);

  const removeFavorite = useCallback((id: string | number | bigint) => {
    const targetId = toIdString(id);
    if (!targetId) return;
    setFavorites((prev) => prev.filter((item) => item.id !== targetId));
  }, []);

  const isFavorite = useCallback((id: string | number | bigint) => {
    const targetId = toIdString(id);
    if (!targetId) return false;
    return favorites.some((item) => item.id === targetId);
  }, [favorites]);

  const toggleFavorite = useCallback((payload: FavoriteCandidate) => {
    setFavorites((prev) => {
      const targetId = toIdString(payload.id);
      if (!targetId) return prev;
      const exists = prev.some((item) => item.id === targetId);
      if (exists) {
        return prev.filter((item) => item.id !== targetId);
      }
      const normalized = normalizeFavoriteItem(payload);
      if (!normalized) return prev;
      return [normalized, ...prev];
    });
  }, []);

  const value = useMemo<FavoritesContextValue>(() => ({
    favorites,
    count: favorites.length,
    ready,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
  }), [addFavorite, favorites, isFavorite, ready, removeFavorite, toggleFavorite]);

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return context;
};
