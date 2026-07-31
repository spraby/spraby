import {createMetadata} from '@/lib/seo';
import ForSellersPage from '@/theme/templates/ForSellersPage';

export const metadata = createMetadata({
  title: 'Возможности для продавцов',
  description: 'Размещайте товары на spraby бесплатно, управляйте заказами во встроенной CRM и развивайте продажи с помощью аналитики.',
  path: '/for-sellers',
});

export default function Page() {
  return <ForSellersPage/>;
}

