'use client'

import ProductCart from "@/theme/snippents/ProductCart";
import FilterPanel from "@/theme/snippents/FilterPanel";

export default function CollectionPage({filter, searchParams}: Props) {
  const products = getRandomProducts();

  return <main className='container mx-auto grid grid-cols-12 gap-5'>
    <div className='col-span-3'>
      <FilterPanel options={filter} searchParams={searchParams}/>
    </div>
    <div className='col-span-9'>
      <div className='grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-5'>
        {
          products.map((product, index) => {
            return <ProductCart product={product} key={index}/>;
          })
        }
      </div>
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

type Props = {
  searchParams: any,
  filter: {
    title: string,
    values: {
      value: string,
      optionId: string
    }[]
  }[]
}
