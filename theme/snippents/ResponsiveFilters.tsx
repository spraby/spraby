'use client'

import {ReactNode, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useSearchParams} from "next/navigation";
import {isEqual} from "lodash";
import FilterPanel from "@/theme/snippents/FilterPanel";
import type {FilterItem} from "@/types";
import {useBodyScrollLock} from "@/theme/hooks/useBodyScrollLock";

type ResponsiveFiltersProps = {
  options: FilterItem[];
  searchParams?: Record<string, any>;
  onChange: (params: Record<string, string>) => void | Promise<void>;
  title?: string;
};

type QueryMap = Record<string, string>;

export default function ResponsiveFilters({
                                            options,
                                            searchParams: defaultSearchParams,
                                            onChange,
                                            title,
                                          }: ResponsiveFiltersProps) {
  const routeSearchParams = useSearchParams();
  const filterKeys = useMemo(() => options.map((option) => option.key), [options]);

  const initialQuery = useMemo(() => normalizeQuery(defaultSearchParams), [defaultSearchParams]);
  const [query, setQuery] = useState<QueryMap>(initialQuery);
  const [selected, setSelected] = useState<Record<string, string[]>>(() => toSelectedMap(initialQuery, filterKeys));
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const internalUpdateRef = useRef(false);

  useBodyScrollLock(isDrawerOpen);

  // sync when router search params change (browser navigation)
  useEffect(() => {
    const paramsFromRouter = normalizeQuery(routeSearchParams);
    if (internalUpdateRef.current) {
      internalUpdateRef.current = false;
      return;
    }
    if (!isEqual(paramsFromRouter, query)) {
      setQuery(paramsFromRouter);
      setSelected(toSelectedMap(paramsFromRouter, filterKeys));
      void onChange(paramsFromRouter);
    }
  }, [routeSearchParams, filterKeys, onChange, query]);

  // keep state aligned when default search params change (e.g., server navigation)
  useEffect(() => {
    if (!isEqual(initialQuery, query)) {
      setQuery(initialQuery);
      setSelected(toSelectedMap(initialQuery, filterKeys));
    }
  }, [initialQuery, filterKeys]);

  const syncWithUrl = useCallback((mutator: (url: URL) => void) => {
    if (typeof window === 'undefined') return;

    const url = new URL(window.location.href);
    mutator(url);

    internalUpdateRef.current = true;
    window.history.replaceState(null, '', url.toString());

    const nextParams = Object.fromEntries(url.searchParams.entries());
    setQuery(nextParams);
    const nextSelected = toSelectedMap(nextParams, filterKeys);
    setSelected(nextSelected);
    void onChange(nextParams);
  }, [filterKeys, onChange]);

  const updateFilterValue = useCallback((filterKey: string, value: string, shouldAdd: boolean) => {
    const currentValues = new Set(selected[filterKey] ?? []);
    if (shouldAdd) {
      currentValues.add(value);
    } else {
      currentValues.delete(value);
    }
    const nextValues = Array.from(currentValues);
    syncWithUrl((url) => {
      if (nextValues.length) {
        url.searchParams.set(filterKey, nextValues.join(','));
      } else {
        url.searchParams.delete(filterKey);
      }
    });
  }, [selected, syncWithUrl]);

  const handleClearFilter = useCallback((filterKey: string) => {
    syncWithUrl((url) => {
      url.searchParams.delete(filterKey);
    });
  }, [syncWithUrl]);

  const handleClearAll = useCallback(() => {
    if (!filterKeys.length) return;
    syncWithUrl((url) => {
      filterKeys.forEach((key) => url.searchParams.delete(key));
    });
    setIsDrawerOpen(false);
  }, [filterKeys, syncWithUrl]);

  const chips = useMemo(() => buildChips(options, selected), [options, selected]);
  const hasActiveFilters = chips.length > 0;

  const handleChipRemove = (filterKey: string, value: string) => {
    updateFilterValue(filterKey, value, false);
  };

  const handleDrawerClose = () => setIsDrawerOpen(false);

  return (
    <div className="w-full lg:w-72 lg:flex-none">
      <div className="lg:hidden">
        <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm transition hover:border-purple-200 hover:text-purple-700"
            >
              <FilterIcon/>
              Фильтры
              {hasActiveFilters && (
                <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-purple-600 px-2 text-xs font-semibold text-white">
                  {chips.length}
                </span>
              )}
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs font-semibold uppercase tracking-wide text-gray-500 transition hover:text-gray-700"
              >
                Сбросить
              </button>
            )}
          </div>

          {hasActiveFilters && (
            <div className="mt-3 flex flex-wrap gap-2">
              {chips.map((chip) => (
                <button
                  key={`${chip.filterKey}-${chip.value}`}
                  type="button"
                  onClick={() => handleChipRemove(chip.filterKey, chip.value)}
                  className="group inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-purple-300 hover:text-purple-700"
                >
                  {chip.label}
                  <CloseIcon className="h-3 w-3 text-gray-400 transition group-hover:text-purple-600"/>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <aside className="relative hidden lg:block">
        <div className="sticky top-24 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <p className="max-w-[70%] truncate text-base font-semibold text-gray-900">
              {title?.trim() || 'Фильтры'}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs font-semibold uppercase tracking-wide text-purple-600 transition hover:text-purple-700"
              >
                Сбросить всё
              </button>
            )}
          </div>

          {hasActiveFilters && (
            <ul className="flex flex-wrap gap-2">
              {chips.map((chip) => (
                <li key={`desktop-${chip.filterKey}-${chip.value}`}>
                  <button
                    type="button"
                    onClick={() => handleChipRemove(chip.filterKey, chip.value)}
                    className="group inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-purple-300 hover:text-purple-700"
                  >
                    {chip.label}
                    <CloseIcon className="h-3 w-3 text-gray-400 transition group-hover:text-purple-600"/>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <FilterPanel
            options={options}
            selected={selected}
            onToggle={(filterKey, value, active, _item) => updateFilterValue(filterKey, value, active)}
            onClearFilter={handleClearFilter}
          />
        </div>
      </aside>

      <MobileDrawer
        open={isDrawerOpen}
        onClose={handleDrawerClose}
        onClearAll={handleClearAll}
      >
        <FilterPanel
          options={options}
          selected={selected}
          onToggle={(filterKey, value, active, _item) => updateFilterValue(filterKey, value, active)}
          onClearFilter={handleClearFilter}
        />
      </MobileDrawer>
    </div>
  );
}

type FilterChip = {
  filterKey: string;
  filterTitle: string;
  value: string;
  label: string;
};

type MobileDrawerProps = {
  open: boolean;
  onClose: () => void;
  onClearAll: () => void;
  children: ReactNode;
};

const MobileDrawer = ({open, onClose, onClearAll, children}: MobileDrawerProps) => (
  <div className={`fixed inset-0 z-40 transition duration-300 lg:hidden ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}>
    <div
      className={`absolute inset-0 bg-slate-950/40 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
      onClick={onClose}
      aria-hidden="true"
    />

    <div
      className={`absolute inset-x-0 bottom-0 flex max-h-[90%] flex-col rounded-t-3xl bg-white shadow-2xl transition-transform duration-300 ${open ? 'translate-y-0' : 'translate-y-full'}`}
      role="dialog"
      aria-modal="true"
      aria-label="Фильтры"
    >
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:text-gray-900"
          aria-label="Закрыть фильтры"
        >
          <CloseIcon className="h-4 w-4"/>
        </button>

        <p className="text-base font-semibold text-gray-900">Фильтры</p>

        <button
          type="button"
          onClick={onClearAll}
          className="text-xs font-semibold uppercase tracking-wide text-purple-600 transition hover:text-purple-700"
        >
          Сбросить всё
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-24">
        <div className="space-y-4">
          {children}
        </div>
      </div>

      <div className="pointer-events-auto border-t border-gray-100 bg-white px-5 py-4">
        <button
          type="button"
          onClick={onClose}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-purple-700"
        >
          Показать товары
        </button>
      </div>
    </div>
  </div>
);

function normalizeQuery(params: Record<string, any> | URLSearchParams | null | undefined): QueryMap {
  if (!params) return {};

  if (params instanceof URLSearchParams) {
    const entries: QueryMap = {};
    params.forEach((value, key) => {
      entries[key] = value;
    });
    return entries;
  }

  return Object.entries(params).reduce<QueryMap>((acc, [key, value]) => {
    if (value === undefined || value === null) return acc;
    if (Array.isArray(value)) {
      acc[key] = value.join(',');
    } else {
      acc[key] = String(value);
    }
    return acc;
  }, {});
}

function toSelectedMap(params: QueryMap, keys: string[]) {
  return keys.reduce<Record<string, string[]>>((acc, key) => {
    const value = params[key];
    if (!value) return acc;
    acc[key] = value.split(',').filter(Boolean);
    return acc;
  }, {});
}

function buildChips(options: FilterItem[], selected: Record<string, string[]>): FilterChip[] {
  return options.flatMap((filter) => {
    const activeValues = selected[filter.key] ?? [];
    return activeValues.map((value) => {
      const match = filter.values.find((item) => item.value === value);
      return {
        filterKey: filter.key,
        filterTitle: filter.title,
        value,
        label: match?.value ?? value,
      };
    });
  });
}

const FilterIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
    <path
      d="M3 4h14M6 10h8M9 16h2"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CloseIcon = ({className}: { className?: string }) => (
  <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
          strokeLinejoin="round"/>
  </svg>
);
