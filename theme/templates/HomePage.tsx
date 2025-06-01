'use client'

import ProductCart from "@/theme/snippents/ProductCart";
import {ProductModel} from "@/prisma/types";
import '@splidejs/react-splide/css';
import {Splide, SplideSlide} from "react-splide-ts";

export default function HomePage({topProducts}: { topProducts: ProductModel[] }) {

  return <main>
    <div className={'container mx-auto'}>
      <h3 className={'text-xl font-bold text-center m-5'}>В тренде</h3>
      <Splide
        options={{
          perPage: 4,
          breakpoints: {
            320: {
              perPage: 1,
            },
            640: {
              perPage: 2,
            },
            768: {
              perPage: 3,
            },
          },
          arrows: false,
          cover: false,
        }}
      >
        {
          topProducts.reduce((acc: ProductModel[], product) => {
            const image = (product?.Images ?? []).find(i => !!i?.Image?.src);
            const src = image?.Image?.src ?? null;
            if (src) acc.push(product);
            return acc;
          }, []).map((product, index) => {
            return (
              <SplideSlide key={index}>

                <ProductCart product={product} key={index}/>

              </SplideSlide>
            );
          })
        }
      </Splide>
    </div>
  </main>
}

function getRandomProducts(): any[] {
  const images = [
    'https://avatars.mds.yandex.net/i?id=43131c522436b4d49d2229d770e7d46f-4766550-images-thumbs&n=13&exp=1',
    'https://avatars.mds.yandex.net/i?id=31b6375bebb40ffbb28ca32ebf0e6de2-5311685-images-thumbs&n=13&exp=1',
    'https://avatars.mds.yandex.net/i?id=7b9ab108d7cdcd2cfbff44e6d423ced9-5673334-images-thumbs&n=13&exp=1',
    'https://avatars.mds.yandex.net/i?id=7ee764dec4cc15fa74f03c138979ab16-5346024-images-thumbs&n=13&exp=1',
    'https://avatars.mds.yandex.net/i?id=b1e343efd12ee13775cd9b25f874e352-5038807-images-thumbs&n=13&exp=1',
  ];

  return new Array(30).fill('-').map((i, index) => ({
    'id': 'product_' + index,
    'title': 'Название товара ' + index,
    'description': 'Описание товара' + index,
    'price': '220.00',
    'discountPrice': '200.00 BYN',
    'handle': 'product' + index,
    'options': [],
    'variants': [],
    'images': [{
      id: 'sa',
      src: images[generateRandom(0, 4)],
      description: '',
      updatedAt: '2023-08-22',
      createdAt: '2023-08-22',
    }],
  }));
}

export const generateRandom = (min = 0, max = 100) => Math.floor(Math.random() * (max - min)) + min;
