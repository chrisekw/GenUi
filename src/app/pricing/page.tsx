
'use client';

import * as React from 'react';
import { Header } from '@/components/app/header';
import { Sidebar } from '@/components/app/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import type { PlanId } from '@/lib/user-profile';

interface Tier {
    name: PlanId;
    price: string;
    description: string;
    features: string[];
    cta: string;
    link: string;
    highlighted?: boolean;
}

const tiers: Tier[] = [
    {
        name: 'Free',
        price: '$0',
        description: 'For trying things out',
        features: [
            'Unlimited generations',
            'Access to standard UI components',
            'Community support',
            'Publish to community',
        ],
        cta: 'Get Started',
        link: '/login'
    },
    {
        name: 'Pro',
        price: '$10',
        description: 'For indie devs & hobbyists',
        features: [
            'Everything in Free',
            'Priority processing',
            'Advanced design customization',
        ],
        cta: 'Upgrade to Pro',
        highlighted: true,
        link: 'https://flutterwave.com/pay/ja8l4j3t4vrs'
    },
    {
        name: 'Studio',
        price: '$35',
        description: 'For startups & small teams',
        features: [
            'Everything in Pro',
            'Saved component library',
            'Access to exclusive components',
        ],
        cta: 'Choose Studio',
        link: 'https://flutterwave.com/pay/szpg37lzuyf0'
    },
    {
        name: 'Enterprise',
        price: '$155',
        description: 'For big teams & agencies',
        features: [
            'Everything in Studio',
            'Dedicated support',
            'Team collaboration features',
        ],
        cta: 'Contact Sales',
        link: 'https://flutterwave.com/pay/jlxrbpjfsmfk'
    }
];

export default function PricingPage() {
    const { user } = useAuth();
    const { toast } = useToast();

    const getPaymentLink = (tier: Tier) => {
        if (tier.name === 'Free') {
            return tier.link;
        }

        if (!user) {
            // If user is not logged in, clicking the button will show a toast.
            return '#';
        }
        
        // Construct the redirect URL which Flutterwave will use to send the user back to our app
        const redirectUrl = `${window.location.origin}/payment/status`;

        const paymentLink = new URL(tier.link);
        
        // Pass user and transaction info to Flutterwave
        paymentLink.searchParams.set('email', user.email || '');
        paymentLink.searchParams.set('name', user.displayName || '');
        // We combine userId and planId into tx_ref because it's a common field for internal references.
        paymentLink.searchParams.set('tx_ref', `${user.uid}_${tier.name}`);
        paymentLink.searchParams.set('redirect_url', redirectUrl);

        return paymentLink.toString();
    }

    const handleCtaClick = (e: React.MouseEvent<HTMLAnchorElement>, tier: Tier) => {
        if (tier.name !== 'Free' && !user) {
            e.preventDefault();
            toast({
                title: "Please log in to upgrade",
                description: "You need to be logged in to choose a paid plan.",
                variant: "destructive"
            });
        }
    }


  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar />
      <div className="flex flex-col">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 animate-fade-in">
          <div className="grid w-full max-w-6xl mx-auto gap-2 text-center">
            <h1 className="text-3xl font-semibold">Pricing Plans</h1>
            <p className="text-muted-foreground">
              Choose the plan that's right for you.
            </p>
          </div>
          <div className="grid w-full max-w-6xl mx-auto gap-8 md:grid-cols-2 lg:grid-cols-4 items-start">
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
                        <span className="text-muted-foreground text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full" variant={tier.highlighted ? 'default' : 'outline'}>
                    <Link href={getPaymentLink(tier)} onClick={(e) => handleCtaClick(e, tier)}>{tier.cta}</Link>
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
