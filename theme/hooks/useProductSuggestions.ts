'use client';

import {useEffect, useState} from "react";
import type {SearchSuggestion} from "@/types";

const DEBOUNCE_MS = 200;
const MIN_QUERY_LENGTH = 2;

type SuggestionsState = {
  loading: boolean;
  items: SearchSuggestion[];
};

export type UseProductSuggestionsResult = {
  suggestions: SuggestionsState;
  open: boolean;
  setOpen: (open: boolean) => void;
};

export function useProductSuggestions(query: string, limit = 12): UseProductSuggestionsResult {
  const [suggestions, setSuggestions] = useState<SuggestionsState>({loading: false, items: []});
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setSuggestions({loading: false, items: []});
      setOpen(false);
      return;
    }

    const controller = new AbortController();
    let isActive = true;
    setSuggestions(prev => ({...prev, loading: true}));

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(trimmed)}&limit=${limit}`,
          {signal: controller.signal},
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: {items: SearchSuggestion[]} = await res.json();
        if (!isActive) return;
        setSuggestions({loading: false, items: data.items ?? []});
        setOpen(true);
      } catch (err) {
        if (!isActive || (err instanceof DOMException && err.name === "AbortError")) return;
        setSuggestions({loading: false, items: []});
        setOpen(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      isActive = false;
      controller.abort();
      clearTimeout(timeout);
    };
  }, [query, limit]);

  return {suggestions, open, setOpen};
}
