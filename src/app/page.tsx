import HomePageClient from '@/components/HomePageClient';
import { getHomeBanners } from '@/lib/home-banners';

// Os banners vêm no HTML inicial: o fundo do topo já aparece certo na primeira pintura.
export default async function HomePage() {
  return <HomePageClient banners={await getHomeBanners()} />;
}
