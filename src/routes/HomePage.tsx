import CategoryGrid from '../components/home/CategoryGrid';
import DiceCard from '../components/home/DiceCard';

export default function HomePage() {
  return (
    <main className="animate-fade-in">
      <CategoryGrid />
      <DiceCard />
    </main>
  );
}
