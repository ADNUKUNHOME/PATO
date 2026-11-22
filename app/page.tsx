import BrandIdentity from "./components/home/brandIdentity";
import CollectionDiscovery from "./components/home/collectionDiscovery";
import FeaturedCollection from "./components/home/featuredCollection";
import Hero from "./components/home/hero";
import NewArrivals from "./components/home/newArrivals";

export default function Home() {
  return (
    <main>
      <Hero />
      <CollectionDiscovery />
      <FeaturedCollection />
      <BrandIdentity />
      <NewArrivals />
    </main>
  );
}
