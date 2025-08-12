
import { Header } from '@/components/app/header';
import { Sidebar } from '@/components/app/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import Link from 'next/link';

const tiers = [
    {
        name: 'Free',
        price: '$0',
        description: 'For individuals and hobbyists',
        features: [
            '10 component generations per day',
            'Community access',
            'Limited support',
        ],
        cta: 'Get Started'
    },
    {
        name: 'Pro',
        price: '$29',
        description: 'For professionals and small teams',
        features: [
            'Unlimited component generations',
            'Priority support',
            'Access to premium components',
            'Team collaboration features',
        ],
        cta: 'Upgrade to Pro',
        highlighted: true,
    },
    {
        name: 'Enterprise',
        price: 'Contact Us',
        description: 'For large organizations',
        features: [
            'All Pro features',
            'Dedicated account manager',
            'On-premise deployment option',
            'Custom integrations',
        ],
        cta: 'Contact Sales'
    }
];

export default function PricingPage() {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar />
      <div className="flex flex-col">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 animate-fade-in">
          <div className="grid w-full max-w-5xl mx-auto gap-2 text-center">
            <h1 className="text-3xl font-semibold">Pricing Plans</h1>
            <p className="text-muted-foreground">
              Choose the plan that's right for you.
            </p>
          </div>
          <div className="grid w-full max-w-5xl mx-auto gap-8 md:grid-cols-3 items-start">
            {tiers.map((tier) => (
              <Card key={tier.name} className={tier.highlighted ? 'border-primary shadow-lg' : ''}>
                <CardHeader>
                  <CardTitle>{tier.name}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-4xl font-bold">{tier.price} <span className="text-sm font-normal text-muted-foreground">{tier.price.startsWith('$') ? '/ month' : ''}</span></div>
                  <ul className="space-y-2">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full" variant={tier.highlighted ? 'default' : 'outline'}>
                    <Link href="/login">{tier.cta}</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
