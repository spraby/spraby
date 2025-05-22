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
} from '@prisma/client'

export default Prisma

export type UserModel = users & {
  Brands?: BrandModel[]
}

export type BrandModel = brands & {
  User?: UserModel
  Products?: ProductModel[]
  Categories?: CategoryModel[]
  Images?: ImageModel[]
  Settings?: BrandSettingsModel[]
  Orders?: OrderModel[]
}

export type OptionModel = options & {
  Values?: OptionValueModel[]
  CategoryOption?: CategoryOption[]
  VariantValues?: VariantValueModel[]
}

export type OptionValueModel = option_values & {
  Option?: OptionModel
  VariantValues?: VariantValueModel[]
}

export type CategoryModel = categories & {
  CategoryOption?: CategoryOption[]
  CategoryCollection?: CategoryCollection[]
  Brands?: BrandModel[]
  Products?: ProductModel[]
}

export type CategoryOption = category_option & {
  Category: CategoryModel,
  Option: OptionModel
}

export type CollectionModel = collections & {
  CategoryCollection?: CategoryCollection[],
}

export type CategoryCollection = category_collection & {
  Category: CategoryModel
  Collection: CollectionModel
}

export type ProductModel = products & {
  Brand?: BrandModel
  Category?: CategoryModel
  Variants?: VariantModel[]
  Images?: ProductImageModel[],
  OrderItems?: OrderItemModel[]
}

export type VariantModel = variants & {
  Product?: ProductModel
  Image?: ProductImageModel
  VariantValue?: VariantValueModel[],
  OrderItems?: OrderItemModel[]
}

export type VariantValueModel = variant_values & {
  Variant?: VariantModel
  Option?: OptionModel
  Value?: OptionValueModel
}

export type ImageModel = images & {
  Brands?: BrandModel[]
  ProductImages?: ProductImageModel[]
  Variants?: VariantModel[]
}

export type ProductImageModel = product_images & {
  Product?: ProductModel
  Image?: ImageModel
}

export type SettingsModel = settings & {}

export type BrandSettingsModel = brand_settings & {
  brands?: BrandModel
}

export type CustomerModel = customers & {
  Orders?: OrderModel[]
}

export type OrderModel = orders & {
  Brand?: BrandModel,
  Customer?: CustomerModel,
  OrderShippings?: OrderShippingModel[],
  OrderItems?: OrderItemModel[]
}

export type OrderItemModel = order_items & {
  Order: OrderModel,
  Product: ProductModel,
  Variant: VariantModel,
  Image: ProductImageModel
}

export type OrderShippingModel = order_shippings & {
  Order: OrderModel
}

export type BrandSettingsData = {
  delivery: {
    description: string
  },
  refund: {
    description: string
  },
  phones: string[],
  emails: string[],
  socials: {
    type: 'whatsapp' | 'telegram' | 'instagram'
    link: string
  }[]
  addresses: string[]
}

