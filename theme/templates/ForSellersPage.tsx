import ForSellersHero from '@/theme/sections/for-sellers/ForSellersHero';
import SellerAdminShowcase from '@/theme/sections/for-sellers/SellerAdminShowcase/SellerAdminShowcase';
import SellerBenefits from '@/theme/sections/for-sellers/SellerBenefits';
import SellerJourney from '@/theme/sections/for-sellers/SellerJourney';

export default function ForSellersPage() {
  return (
    <main className="overflow-hidden">
      <ForSellersHero/>
      <SellerAdminShowcase/>
      <SellerBenefits/>
      <SellerJourney/>
    </main>
  );
}
