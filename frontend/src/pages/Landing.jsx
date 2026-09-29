import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import FluidBackground from "@/components/FluidBackground/FluidBackground.jsx";
import { ListChecks, Users, Trophy, Globe } from 'lucide-react';

const steps = [
  {
    icon: ListChecks,
    title: '1. Pick your skills',
    description: 'List what you teach and what you want to learn.',
  },
  {
    icon: Users,
    title: '2. Get matched',
    description: 'We pair you with someone whose skills fit yours.',
  },
  {
    icon: Trophy,
    title: '3. Swap and level up',
    description: 'Chat, learn, rate, and earn XP and badges.',
  },
];

const stats = [
  { value: '1,240', label: 'Members' },
  { value: '3,860', label: 'Sessions completed' },
  { value: '210', label: 'Skills to swap' },
];

function Navbar() {
  return (
    <header>
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between px-8 pt-10 pb-8">
        <Link to="/" className="font-semibold text-2xl tracking-tight hover:opacity-80 transition-opacity">
          SkillSwap
        </Link>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-11 px-5 text-base">
            Log in
          </Button>
          <Button size="sm" className="h-11 px-5 text-base">Sign up</Button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="max-w-4xl mx-auto px-6 pt-28 pb-24 text-center">
      <Badge variant="default" className="mb-8 px-4 py-1.5 text-sm">
        Free peer-to-peer learning
      </Badge>

      <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.08]">
        Teach what you know.
        <br />
        Learn what you want.
      </h1>

      <p className="mt-7 text-muted-foreground text-xl leading-relaxed max-w-2xl mx-auto">
        Swap skills with people who need what you have and have what you need.
        No money, just time.
      </p>

      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button size="lg">Get started</Button>
        <Button size="lg" variant="outline" className="gap-2">
          <Globe className="h-4 w-4" />
          Continue with Google
        </Button>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="max-w-6xl mx-auto px-6 pb-24">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {steps.map(({ icon: Icon, title, description }) => (
          <Card key={title} className="p-8 bg-card/50">
            <Icon className="h-6 w-6 text-muted-foreground mb-5" />
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-base text-muted-foreground mt-2 leading-relaxed">{description}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}

function Stats() {
  return (
    <section className="max-w-6xl mx-auto px-6 pb-24">
      <div className="grid grid-cols-3 divide-x divide-border text-center">
        {stats.map(({ value, label }) => (
          <div key={label}>
            <p className="text-4xl font-bold">{value}</p>
            <p className="text-base text-muted-foreground mt-2">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-5 text-sm text-muted-foreground">
        <span>Made with hate by UR-DADDY :)</span>
        <div className="flex gap-4">
          <a href="/privacy" className="hover:text-foreground transition-colors">
            Privacy policy
          </a>
          <a href="/terms" className="hover:text-foreground transition-colors">
            Terms of service
          </a>
        </div>
      </div>
    </footer>
  );
}

function Landing() {
  return (
    <div className="relative min-h-screen text-foreground flex flex-col">
      <FluidBackground />
      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <Hero />
          <HowItWorks />
          <Stats />
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default Landing;
