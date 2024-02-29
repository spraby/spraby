import DoubleSlider from "@/theme/snippents/DoubleSlider";
import Tabs from "@/theme/snippents/Tabs";
import Accordion from "@/theme/snippents/Accordion";
import VariantSelector from "@/theme/snippents/VariantSelector";

export default function ProductPage() {
  const product = {
    title: 'test product',
    images: [
      'https://avatars.mds.yandex.net/i?id=43131c522436b4d49d2229d770e7d46f-4766550-images-thumbs&n=13&exp=1',
      'https://avatars.mds.yandex.net/i?id=31b6375bebb40ffbb28ca32ebf0e6de2-5311685-images-thumbs&n=13&exp=1',
      'https://avatars.mds.yandex.net/i?id=7b9ab108d7cdcd2cfbff44e6d423ced9-5673334-images-thumbs&n=13&exp=1',
      'https://avatars.mds.yandex.net/i?id=7ee764dec4cc15fa74f03c138979ab16-5346024-images-thumbs&n=13&exp=1',
      'https://avatars.mds.yandex.net/i?id=b1e343efd12ee13775cd9b25f874e352-5038807-images-thumbs&n=13&exp=1',
    ]
  }

  const variant = {}


  return <main>
    <div className='container mx-auto grid gap-10 grid-cols-12'>
      <div className='flex gap-7 flex-col col-span-12 lg:col-span-6 xl:col-span-7'>
        <DoubleSlider images={product.images} startImage={product.images[0]}/>
        <Tabs
          tabs={[
            {
              label: 'Описание',
              value:
                '1 sdfbsdb Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quod quos alias ipsam in eligendi blanditiis sint et, ratione nisi vero voluptates, amet mollitia perferendis nostrum minima atque sunt rerum at.',
            },
            {
              label: 'Характеристики',
              value:
                '2 sdvsdvfdsb Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quod quos alias ipsam in eligendi blanditiis sint et, ratione nisi vero voluptates, amet mollitia perferendis nostrum minima atque sunt rerum at.',
            },
            {
              label: 'Способы доставки',
              value:
                '3 sdvssdcvsv Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quod quos alias ipsam in eligendi blanditiis sint et, ratione nisi vero voluptates, amet mollitia perferendis nostrum minima atque sunt rerum at.',
            },
            {
              label: 'Условия возврата',
              value:
                '4 sdvssdcvcascsacsv Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quod quos alias ipsam in eligendi blanditiis sint et, ratione nisi vero voluptates, amet mollitia perferendis nostrum minima atque sunt rerum at.',
            },
          ]}
        />
        <div className='h-px bg-gray-200'></div>
      </div>
      <div className='flex gap-7 flex-col col-span-12 lg:col-span-6 xl:col-span-5'>
        <h2 className='text-2xl font-semibold'>{product.title}</h2>
        <div className='grid grid-cols-2 gap-3'>
          <label
            className={`${!!variant ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-200'} transition-colors duration-300 text-center text-white p-3 rounded-md`}>
            <button disabled={!variant}>Заказать</button>
          </label>
          <label
            className='bg-white text-center text-purple-600 hover:bg-purple-700 hover:text-white transition-colors duration-300 p-3 rounded-md border border-purple-600'>
            <button>Контакты</button>
          </label>
        </div>
        <Accordion label='Дополнительная информация' value={'Дополнительная информация'}/>
        <div className='h-px bg-gray-200'></div>
        <VariantSelector />
        <div className='h-px bg-gray-200'></div>
      </div>
    </div>
  </main>
}
