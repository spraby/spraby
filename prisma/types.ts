import {
  Users,
  Brands,
  Options,
  Categories,
  Collections,
  Products,
  Variants,
  VariantValues,
  Images,
  ProductImages,
  Settings,
  Prisma,
} from '@prisma/client'

export default Prisma


export type UsersModel = Users & {
  brands?: BrandsModel[]
}

export type BrandsModel = Brands & {
  user?: UsersModel
  Products?: ProductsModel[]
  Categories?: CategoriesModel[]
}

export type OptionsModel = Options & {
  Categories?: CategoriesModel[]
  Values?: VariantValuesModel[]
}

export type CategoriesModel = Categories & {
  Options?: OptionsModel[]
  Collections?: CollectionsModel[]
  Products?: ProductsModel[]
  Brands?: BrandsModel[]
}

export type CollectionsModel = Collections & {
  Categories?: Categories[]
}

export type ProductsModel = Products & {
  Brand?: BrandsModel,
  Category?: CategoriesModel
  Variants?: VariantsModel[]
  Images?: ProductImagesModel[]
}

export type VariantsModel = Variants & {
  Product?: ProductsModel
  Values?: VariantValuesModel[]
  Image?: ProductImagesModel
}

export type VariantValuesModel = VariantValues & {
  Variant?: VariantsModel
  Option?: OptionsModel
}

export type ProductImagesModel = ProductImages & {
  Product?: ProductsModel
  Image?: ImagesModel
  Variants?: VariantsModel[]
}

export type ImagesModel = Images & {
  ProductImages?: ProductImagesModel[]
}

export type SettingsModel = Settings
