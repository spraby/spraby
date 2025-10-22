'use client'

import {Checkbox} from "@nextui-org/react";
import {useMemo, useState} from "react";
import type {FilterItem} from "@/types";

type FilterProps = {
  filter: FilterItem;
  selected?: string[];
  onChange: (active: boolean, item: FilterValue) => void;
  onReset?: () => void;
};

type FilterValue = {
  value: string;
  optionIds: bigint[];
};

export default function Filter({filter, onChange, selected = [], onReset}: FilterProps) {
  const [expanded, setExpanded] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [query, setQuery] = useState('');

  const filterValues = useMemo(() => {
    if (!query.trim()) return filter.values;
    const normalized = query.toLowerCase();
    return filter.values.filter((item) => item.value.toLowerCase().includes(normalized));
  }, [filter.values, query]);

  const selectedCount = selected.length;
  const enableSearch = filter.values.length > 12;
  const shouldClamp = !showAll && !query && filterValues.length > 8;
  const visibleValues = shouldClamp ? filterValues.slice(0, 8) : filterValues;

  return (
    <section className="rounded-xl bg-white p-3 sm:p-4">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 text-left"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
      >
        <div>
          <p className="text-sm font-semibold text-gray-900">{filter.title}</p>
          {selectedCount > 0 && (
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700">
              {selectedCount} выбрано
            </span>
          )}
        </div>
        <ChevronIcon className={`h-4 w-4 text-gray-400 transition-transform ${expanded ? 'rotate-0' : '-rotate-90'}`}/>
      </button>

      <div className={`mt-3 space-y-3 ${expanded ? 'block' : 'hidden'} sm:mt-4 sm:space-y-4`}>
        {enableSearch && (
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
            <SearchIcon/>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Быстрый поиск"
              className="w-full border-none bg-transparent text-sm text-gray-700 outline-none"
            />
            {query.length > 0 && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-xs font-semibold uppercase tracking-wide text-gray-400 transition hover:text-gray-600"
              >
                Очистить
              </button>
            )}
          </div>
        )}

        <ul className="flex flex-col gap-2">
          {visibleValues.map((item, index) => {
            const isSelected = selected.includes(item.value);
            return (
              <li key={`${filter.key}-${index}`} title={item.value}>
                <Checkbox
                  value={item.value}
                  color="default"
                  radius="sm"
                  classNames={{
                    base: "items-start gap-2 py-1",
                    wrapper: "border-0 shadow-none before:border before:border-gray-300 before:bg-white group-data-[hover=true]:before:border-purple-400 group-data-[selected=true]:before:border-purple-500",
                    label: "text-sm text-gray-700",
                  }}
                  isSelected={isSelected}
                  onValueChange={(active: boolean) => onChange(active, item)}
                >
                  {item.value}
                </Checkbox>
              </li>
            );
          })}

          {filterValues.length === 0 && (
            <li className="rounded-md border border-dashed border-gray-200 p-3 text-center text-xs text-gray-400">
              Ничего не найдено
            </li>
          )}
        </ul>

        {shouldClamp && (
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="inline-flex items-center gap-1 text-sm font-semibold text-gray-900 transition hover:text-purple-600"
          >
            Показать все
            <ArrowRightIcon/>
          </button>
        )}

        {selectedCount > 0 && onReset && (
          <button
            type="button"
            onClick={onReset}
            className="text-sm font-semibold text-purple-600 transition hover:text-purple-700"
          >
            Сбросить выбор
          </button>
        )}
      </div>
    </section>
  );
}

const ChevronIcon = ({className}: { className?: string }) => (
  <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-gray-400" aria-hidden="true">
    <path
      d="M9.5 15a5.5 5.5 0 100-11 5.5 5.5 0 000 11zM15.5 15.5l-2.4-2.4"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ArrowRightIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
    <path d="M6 3l4 5-4 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
