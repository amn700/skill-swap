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
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between px-6 sm:px-8 pt-7 sm:pt-10 pb-6 sm:pb-8">
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
    <section className="flex min-h-[50svh] w-full max-w-7xl mx-auto flex-col items-center justify-center px-5 py-20 text-center sm:px-6 sm:py-24 lg:py-28">
      <Badge variant="" className="px-4 py-1.5 text-sm">
        Free peer-to-peer learning
      </Badge>

      <h1 className="hero-title mx-auto mt-7 sm:mt-8 mb-10 sm:mb-12 max-w-8xl text-7xl sm:text-8xl md:text-7xl lg:text-8xl tracking-[-0.035em] leading-[1.08]">
        <span className="hero-title">Teach what you know.</span>
        <span className="hero-title-accent block">Learn what you want.</span>
      </h1>

      <p className="mx-auto max-w-2xl text-lg sm:text-xl leading-relaxed text-muted-foreground">
        Swap skills with people who need what you have and have what you need.
        No money, just time.
      </p>

      <div className="mt-60 flex flex-col sm:flex-row items-center justify-center gap-4">
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
    <section id="how-it-works" className="max-w-6xl mx-auto px-5 sm:px-6 pt-4 pb-16 sm:pb-20">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {steps.map(({ icon: Icon, title, description }) => (
          <Card key={title} className="border-white/10 bg-card/35 p-6 sm:p-8 backdrop-blur-sm transition-colors hover:bg-card/55">
            <Icon className="h-6 w-6 text-accent mb-5" />
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
    <section className="max-w-6xl mx-auto px-5 sm:px-6 pb-16 sm:pb-20">
      <div className="grid grid-cols-3 divide-x divide-border text-center">
        {stats.map(({ value, label }) => (
          <div key={label}>
            <p className="text-2xl sm:text-4xl font-bold">{value}</p>
            <p className="mt-2 px-2 text-xs sm:text-base text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-5 text-sm text-muted-foreground">
        <span>Made for learning, built by SkillSwap.</span>
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
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,transparent_34%,rgba(0,0,0,0.2)_72%,rgba(0,0,0,0.42)_100%)] backdrop-blur-[4px] [mask-image:radial-gradient(ellipse_at_center,transparent_28%,black_78%)]"
      />
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
