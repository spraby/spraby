import ProductPage from "@/theme/templates/ProductPage";
import {findFirst, findMany} from "@/services/Products";
import {getBreadcrumbs, getInformationSettings} from "@/services/Settings";
import {serializeObject} from "@/services/utilits";
import {BreadcrumbItem} from "@/types";
import db from "@/prisma/db.client";
import {notFound} from "next/navigation";
import {cache} from "react";
import {buildProductJsonLd, createMissingProductMetadata, createProductMetadata, stringifyJsonLd} from "./seo";

// export const revalidate = 120

const MAX_POSTGRES_BIGINT = BigInt("9223372036854775807");

function parseProductId(value: unknown) {
  if (typeof value !== "string" || !/^\d+$/.test(value)) return null;

  const id = BigInt(value);
  return id > BigInt(0) && id <= MAX_POSTGRES_BIGINT ? id : null;
}

const getProductDetail = cache(async (productId: bigint) => {
  return findFirst({
    where: {
      id: productId,
      enabled: true,
    },
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
        orderBy: {
          id: 'asc'
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
  });
});

export async function generateMetadata({params}: any) {
  const productId = parseProductId(params.id);
  const path = `/products/${params.id}`;

  if (!productId) {
    return createMissingProductMetadata(path);
  }

  const product = await getProductDetail(productId);

  if (!product) {
    return createMissingProductMetadata(path);
  }

  return createProductMetadata(product, path);
}

export default async function ProductDetailPage(props: any) {
  const productId = parseProductId(props.params.id);

  if (!productId) {
    notFound();
  }

  const product = await getProductDetail(productId);

  if (!product) {
    notFound();
  }

  const productData = {
    ...product,
    price: `${product?.Variants?.[0]?.price ?? 0}`,
    final_price: `${product?.Variants?.[0]?.final_price ?? 0}`,
    Variants: product?.Variants?.map(variant => ({
      ...variant,
      price: `${variant.price}`,
      final_price: `${variant.final_price}`,
      Image: variant.Image ? {
        ...variant.Image,
        Image: variant.Image.Image ? {
          ...variant.Image.Image,
          src: variant.Image.Image.src ? `${process.env.AWS_IMAGE_DOMAIN}/${variant.Image.Image.src}` : variant.Image.Image.src
        } : null
      } : null
    })),
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
        orderBy: {
          id: 'asc'
        },
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
      Variants: (item.Variants ?? []).map(variant => ({
        ...variant,
        price: `${variant.price}`,
        final_price: `${variant.final_price}`
      })),
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

  const productJsonLd = buildProductJsonLd(product, `/products/${props.params.id}`);

  return (
    <>
      {productJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{__html: stringifyJsonLd(productJsonLd)}}
        />
      ) : null}
      <ProductPage
        product={serializeObject(productData)}
        otherProducts={serializeObject(otherProducts)}
        informationSettings={informationSettings}
        breadcrumbs={breadcrumbs}
        brandContacts={serializeObject(brandContacts)}
        brandAddresses={serializeObject(brandAddresses)}
      />
    </>
  );
}
