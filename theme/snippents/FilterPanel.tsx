'use client'

import Filter from "@/theme/snippents/Filter";
import type {FilterItem} from "@/types";

type FilterPanelProps = {
  options: FilterItem[];
  selected: Record<string, string[]>;
  onToggle: (filterKey: string, value: string, active: boolean, item: FilterItem['values'][number]) => void;
  onClearFilter?: (filterKey: string) => void;
};

export default function FilterPanel({
                                      options,
                                      selected,
                                      onToggle,
                                      onClearFilter,
                                    }: FilterPanelProps) {
  if (!options.length) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 px-4 py-10 text-center text-sm text-gray-500">
        Фильтры появятся, когда в категории будут доступные опции.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {options.map((filter) => (
        <Filter
          key={filter.key}
          filter={filter}
          selected={selected[filter.key] ?? []}
          onChange={(active, item) => onToggle(filter.key, item.value, active, item)}
          onReset={onClearFilter ? () => onClearFilter(filter.key) : undefined}
        />
      ))}
    </div>
  );
}
