import ProductPage from "@/theme/templates/ProductPage";
import {findFirst} from "@/services/Products";

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
          BrandSettings: true
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
              Value: true
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
  });

  return !!product ? <ProductPage product={product}/> : <div>no product</div>
}
