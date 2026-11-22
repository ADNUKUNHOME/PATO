import CollectionDiscovery from "./components/home/collectionDiscovery";
import FeaturedCollection from "./components/home/featuredCollection";
import Hero from "./components/home/hero";

export default function Home() {
  return (
    <main>
      <Hero />
      <CollectionDiscovery />
      <FeaturedCollection />
    </main>
  );
}
