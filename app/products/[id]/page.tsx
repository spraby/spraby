import ProductPage from "@/theme/templates/ProductPage";
import {findFirst} from "@/services/Products";
import {getBreadcrumbs, getInformationSettings} from "@/services/Settings";
import {serializeObject} from "@/services/utilits";
import {BreadcrumbItem} from "@/types";

// export const revalidate = 120

export default async function (props: any) {
  const product = await findFirst({
    where: {id: props.params.id},
    include: {
      Category: {
        include: {
          CategoryOption: {
            include: {
              Option: {
                include: {
                  Values: true
                }
              }
            }
          },
        }
      },
      Brand: {
        include: {
          Settings: true,
          User: true
        }
      },
      Variants: {
        where: {
          enabled: true,
        },
        include: {
          Image: {
            include: {
              Image: true
            }
          },
          VariantValue: {
            include: {
              Value: {
                include: {
                  Option: true
                }
              }
            }
          }
        }
      },
      Images: {
        include: {
          Image: true
        }
      }
    }
  })

  const productData = {
    ...product,
    Images: product?.Images?.map(i => ({
      ...i,
      Image: {
        ...i.Image,
        src: process.env.AWS_IMAGE_DOMAIN + '/' + i.Image?.src
      }
    }))
  }


  const informationSettings = await getInformationSettings() as any;

  let breadcrumbs: BreadcrumbItem[] = [];
  if (productData?.Category?.handle) {
    breadcrumbs = await getBreadcrumbs(`/categories/${productData.Category.handle}`) ?? [];
  } else {
    breadcrumbs = await getBreadcrumbs('/') ?? [];
  }

  return !!productData ?
    <ProductPage
      product={serializeObject(productData)}
      informationSettings={informationSettings}
      breadcrumbs={breadcrumbs}
    /> :
    <div>no product</div>
}
