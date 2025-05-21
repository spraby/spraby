import ProductPage from "@/theme/templates/ProductPage";
import {findFirst} from "@/services/Products";
import {getInformationSettings} from "@/services/Settings";
import {serializeObject} from "@/services/utilits";

// export const revalidate = 120

export default async function (props: any) {
  const product = await findFirst({
    where: {id: props.params.id},
    include: {
      Category: {
        include: {
          CategoryOption: {
            include: {
              Option: true
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
  return !!productData ?
    <ProductPage product={serializeObject(productData)} informationSettings={informationSettings}/> :
    <div>no product</div>
}
