import {
  User,
  Brand,
  BrandSettings,
  Option,
  OptionValue,
  Category,
  Collection,
  Product,
  Variant,
  VariantValue,
  Settings,
  Image,
  ProductImage,
  Prisma,
  Customer,
  Order,
  OrderItem,
  OrderShipping,
  BrandSettingsType as BrandSettingsTypeDefault
} from '@prisma/client'

export default Prisma

export type BrandSettingsType = BrandSettingsTypeDefault

export type UserModel = User & {
  Brands?: BrandModel[]
}

export type BrandModel = Brand & {
  User?: UserModel
  Products?: ProductModel[]
  Categories?: CategoryModel[]
  Images?: ImageModel[]
  Settings?: BrandSettingsModel[]
  Orders?: OrderModel[]
}

export type OptionModel = Option & {
  Values?: OptionValueModel[]
  Categories?: CategoryModel[]
  VariantValues?: VariantValueModel[]
}

export type OptionValueModel = OptionValue & {
  Option?: OptionModel
  VariantValues?: VariantValueModel[]
}

export type CategoryModel = Category & {
  Options?: OptionModel[]
  Collections?: CollectionModel[]
  Brands?: BrandModel[]
  Products?: ProductModel[]
}

export type CollectionModel = Collection & {
  Categories?: CategoryModel[]
}

export type ProductModel = Product & {
  Brand?: BrandModel
  Category?: CategoryModel
  Variants?: VariantModel[]
  Images?: ProductImageModel[],
  OrderItems?: OrderItemModel[]
}

export type VariantModel = Variant & {
  Product?: ProductModel
  Image?: ProductImageModel
  Values?: VariantValueModel[],
  OrderItems?: OrderItemModel[]
}

export type VariantValueModel = VariantValue & {
  Variant?: VariantModel
  Option?: OptionModel
  Value?: OptionValueModel
}

export type ImageModel = Image & {
  Brands?: BrandModel[]
  ProductImages?: ProductImageModel[]
  Variants?: VariantModel[]
}

export type ProductImageModel = ProductImage & {
  Product?: ProductModel
  Image?: ImageModel
}

export type SettingsModel = Settings & {}

export type BrandSettingsModel = BrandSettings & {
  Brand?: BrandModel
}

export type CustomerModel = Customer & {
  Orders?: OrderModel[]
}

export type OrderModel = Order & {
  Brand?: BrandModel,
  Customer?: CustomerModel,
  OrderShippings?: OrderShippingModel[],
  OrderItems?: OrderItemModel[]
}

export type OrderItemModel = OrderItem & {
  Order: OrderModel,
  Product: ProductModel,
  Variant: VariantModel,
  Image: ProductImage
}

export type OrderShippingModel = OrderShipping & {
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

