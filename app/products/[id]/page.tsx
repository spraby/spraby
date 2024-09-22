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
          Options: true,
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
          Values: {
            include: {
              Value: {
                include: {
                  Option: true
                }
              },
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

  const informationSettings = await getInformationSettings() as any;
  return !!product ? <ProductPage product={serializeObject(product)} informationSettings={informationSettings}/> :
    <div>no product</div>
}
