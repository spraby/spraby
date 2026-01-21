import {
  users,
  brands,
  brand_settings,
  options,
  option_values,
  categories,
  collections,
  products,
  variants,
  variant_values,
  settings,
  images,
  product_images,
  category_collection,
  category_option,
  customers,
  orders,
  order_items,
  order_shippings,
  Prisma,
  ProductStatistics,
  audits,
  brand_category,
  brand_image,
  brand_requests,
  image_conversions,
  order_status,
  delivery_status,
  financial_status,
} from '@prisma/client'

export default Prisma

export {
  order_status,
  delivery_status,
  financial_status,
}

export type UserModel = users & {
  Brands?: BrandModel[]
  audits?: AuditModel[]
  brand_requests_reviewed?: BrandRequestModel[]
  brand_requests_user?: BrandRequestModel[]
}

export type BrandModel = brands & {
  User?: UserModel
  Products?: ProductModel[]
  BrandCategory?: BrandCategoryModel[]
  BrandImage?: BrandImageModel[]
  Settings?: BrandSettingsModel[]
  Orders?: OrderModel[]
  BrandRequests?: BrandRequestModel[]
}

export type OptionModel = options & {
  Values?: OptionValueModel[]
  Categories?: CategoryOptionModel[]
  VariantValues?: VariantValueModel[]
}

export type OptionValueModel = option_values & {
  Option?: OptionModel
  VariantValues?: VariantValueModel[]
}

export type CategoryModel = categories & {
  CategoryOption?: CategoryOptionModel[]
  CategoryCollection?: CategoryCollectionModel[]
  BrandCategory?: BrandCategoryModel[]
  Products?: ProductModel[]
}

export type CategoryOptionModel = category_option & {
  Category?: CategoryModel
  Option?: OptionModel
}

export type CollectionModel = collections & {
  CategoryCollection?: CategoryCollectionModel[]
}

export type CategoryCollectionModel = category_collection & {
  Category?: CategoryModel
  Collection?: CollectionModel
}

export type ProductModel = products & {
  Brand?: BrandModel
  Category?: CategoryModel
  Variants?: VariantModel[]
  Images?: ProductImageModel[]
  OrderItems?: OrderItemModel[]
  Statistics?: ProductStatisticsModel[]
}

export type VariantModel = variants & {
  Product?: ProductModel
  Image?: ProductImageModel
  VariantValue?: VariantValueModel[]
  OrderItems?: OrderItemModel[]
}

export type VariantValueModel = variant_values & {
  Variant?: VariantModel
  Option?: OptionModel
  Value?: OptionValueModel
}

export type ProductStatisticsModel = ProductStatistics & {
  Product?: ProductModel
}

export type ImageModel = images & {
  BrandImage?: BrandImageModel[]
  ImageConversions?: ImageConversionModel[]
  ProductImages?: ProductImageModel[]
}

export type ProductImageModel = product_images & {
  Product?: ProductModel
  Image?: ImageModel
  OrderItems?: OrderItemModel[]
  Variant?: VariantModel[]
}

export type SettingsModel = settings & {}

export type BrandSettingsModel = brand_settings & {
  Brand?: BrandModel
}

export type CustomerModel = customers & {
  Orders?: OrderModel[]
}

export type OrderModel = orders & {
  Brand?: BrandModel
  Customer?: CustomerModel
  OrderShippings?: OrderShippingModel[]
  OrderItems?: OrderItemModel[]
}

export type OrderItemModel = order_items & {
  Order?: OrderModel
  Product?: ProductModel
  Variant?: VariantModel
  Image?: ProductImageModel
}

export type OrderShippingModel = order_shippings & {
  Order?: OrderModel
}

export type AuditModel = audits & {
  User?: UserModel
}

export type BrandCategoryModel = brand_category & {
  Brand?: BrandModel
  Category?: CategoryModel
}

export type BrandImageModel = brand_image & {
  Brand?: BrandModel
  Image?: ImageModel
}

export type BrandRequestModel = brand_requests & {
  Brand?: BrandModel
  ReviewedBy?: UserModel
  User?: UserModel
}

export type ImageConversionModel = image_conversions & {
  Image?: ImageModel
}

export type BrandSettingsData = {
  delivery: {
    description: string
  }
  refund: {
    description: string
  }
  phones: string[]
  emails: string[]
  socials: {
    type: 'whatsapp' | 'telegram' | 'instagram'
    link: string
  }[]
  addresses: string[]
}