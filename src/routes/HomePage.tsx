import { useEffect } from 'react';
import CategoryGrid from '../components/home/CategoryGrid';
import DiceCard from '../components/home/DiceCard';
import { useLocationStore } from '../stores/locationStore';

export default function HomePage() {
  const requestLocation = useLocationStore((s) => s.requestLocation);
  const lat = useLocationStore((s) => s.lat);

  useEffect(() => {
    if (lat === null) requestLocation();
  }, [lat, requestLocation]);

  return (
    <main className="animate-fade-in">
      <CategoryGrid />
      <DiceCard />
    </main>
  );
}
