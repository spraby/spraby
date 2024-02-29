import {
  Users,
  Brands,
  Options,
  Categories,
  Collections,
  Products,
  Variants,
  VariantValues,
  Prisma
} from '@prisma/client'

export default Prisma


export type UsersModel = Users & {
  brands?: BrandsModel[]
}

export type BrandsModel = Brands & {
  user?: UsersModel
  Products?: ProductsModel[]
}

export type OptionsModel = Options & {
  Categories?: CategoriesModel[]
  Values?: VariantValuesModel[]
}

export type CategoriesModel = Categories & {
  Options?: OptionsModel[]
  Collections?: CollectionsModel[]
  Products?: ProductsModel[]
}

export type CollectionsModel = Collections & {
  Categories?: Categories[]
}

export type ProductsModel = Products & {
  Brand?: BrandsModel,
  Category?: CategoriesModel
  Variants?: VariantsModel[]
}

export type VariantsModel = Variants & {
  Product?: ProductsModel
  Values?: VariantValuesModel[]
}

export type VariantValuesModel = VariantValues & {
  Variant?: VariantsModel
  Option?: OptionsModel
}
