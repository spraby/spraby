'use client';

import Money from "@/theme/snippents/Money";
import type {SearchSuggestion} from "@/types";

type SearchSuggestionItemProps = {
  item: SearchSuggestion;
  onSelect: (item: SearchSuggestion) => void;
};

export default function SearchSuggestionItem({item, onSelect}: SearchSuggestionItemProps) {
  const hasDiscount = (item.discount_percent ?? 0) > 0;

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-gray-50"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-12 w-12 overflow-hidden rounded-md border border-gray-200 bg-gray-50 flex items-center justify-center">
          {item.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.image} alt={item.title} className="h-full w-full object-cover"/>
          ) : (
            <span className="text-[11px] text-gray-400">Нет фото</span>
          )}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-semibold text-gray-900 line-clamp-1">{item.title}</span>
          {item.brand && <span className="text-xs text-gray-500">{item.brand}</span>}
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-0.5 text-xs text-gray-900">
        <Money value={item.final_price} className="text-purple-500 text-xs font-semibold"/>
        {hasDiscount && (
          <div className="flex items-center justify-end gap-1.5">
            <Money
              value={item.price}
              showIcon={false}
              className="text-gray-400 line-through text-[11px]"
            />
            <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-rose-600">
              -{item.discount_percent}%
            </span>
          </div>
        )}
      </div>
    </button>
  );
}
