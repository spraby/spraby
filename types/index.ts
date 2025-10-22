export type FilterItem = {
  title: string,
  key: string,
  values: {
    value: string,
    optionIds: bigint[]
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
