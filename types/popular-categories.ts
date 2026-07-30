export type PopularCategoryImage = {
  productId: string;
  imageUrl: string;
};

export type PopularCategoryCard = {
  id: string;
  title: string;
  href: string;
  images: PopularCategoryImage[];
  productsCount: number;
  cacheUntil: number;
};

