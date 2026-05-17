export type FilterItem = {
  title: string,
  key: string,
  values: {
    value: string,
    optionIds: bigint[]
  }[]
}

export type FilterGroup = {
  key: string,
  clauses: {
    optionId: string,
    values: string[]
  }[]
}

export type BreadcrumbItem = {
  title: string;
  url: string;
}

export type MenuItem = {
  id: number;
  url: string;
  title: string;
  children?: MenuItem[];
}

export type ProductSort = 'newest' | 'oldest' | 'price_asc' | 'price_desc';

export type SearchSuggestion = {
  id: number | string;
  title: string;
  brand: string | null;
  price: string;
  final_price: string;
  discount_percent: number;
  image?: string | null;
  description?: string | null;
};

export type SearchResponse = {
  items: SearchSuggestion[];
  total: number;
  page: number;
  pages: number;
};
