import ProductPage from "@/theme/templates/ProductPage";
import {findFirst, findMany} from "@/services/Products";
import {getBreadcrumbs, getInformationSettings} from "@/services/Settings";
import {serializeObject} from "@/services/utilits";
import {BreadcrumbItem} from "@/types";
import db from "@/prisma/db.client";

// export const revalidate = 120

export default async function ProductDetailPage(props: any) {
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
          User: true,
          brand_shipping_method: {
            include: {
              shipping_methods: true
            }
          }
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
    price: `${product?.Variants?.[0]?.price ?? 0}`,
    final_price: `${product?.Variants?.[0]?.final_price ?? 0}`,
    Images: product?.Images?.map(i => ({
      ...i,
      Image: {
        ...i.Image,
        src: process.env.AWS_IMAGE_DOMAIN + '/' + i.Image?.src
      }
    }))
  }

  const rawOtherProducts = product?.brand_id ? await findMany({
    where: {
      brand_id: product.brand_id,
      enabled: true,
      NOT: {
        id: product.id
      }
    },
    include: {
      Brand: {
        include: {
          User: true
        }
      },
      Images: {
        include: {
          Image: true
        }
      },
      Variants: {
        where: { enabled: true },
        take: 1,
      },
    },
    orderBy: {
      created_at: 'desc'
    },
    take: 12
  }) : [];

  const otherProducts = (rawOtherProducts ?? [])
    .map(item => ({
      ...item,
      price: `${item.Variants?.[0]?.price ?? 0}`,
      final_price: `${item.Variants?.[0]?.final_price ?? 0}`,
      Images: (item.Images ?? []).map(image => ({
        ...image,
        Image: image.Image ? {
          ...image.Image,
          src: image.Image?.src ? `${process.env.AWS_IMAGE_DOMAIN}/${image.Image.src}` : image.Image?.src
        } : null
      }))
    }))
    .filter(productItem => productItem.Images?.some(image => image?.Image?.src));


  const brandContacts = product?.brand_id ? await db.contacts.findMany({
    where: {
      contactable_type: 'App\\Models\\Brand',
      contactable_id: product.brand_id,
    }
  }) : [];

  const brandAddresses = product?.brand_id ? await db.addresses.findMany({
    where: {
      addressable_type: 'App\\Models\\Brand',
      addressable_id: product.brand_id,
    },
    take: 1,
  }) : [];

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
      otherProducts={serializeObject(otherProducts)}
      informationSettings={informationSettings}
      breadcrumbs={breadcrumbs}
      brandContacts={serializeObject(brandContacts)}
      brandAddresses={serializeObject(brandAddresses)}
    /> :
    <div>no product</div>
}
