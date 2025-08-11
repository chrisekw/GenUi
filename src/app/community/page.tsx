
import * as React from 'react';
import { Header } from '@/components/app/header';
import { Sidebar } from '@/components/app/sidebar';
import { getCommunityComponents } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Copy, Share2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';

export default async function CommunityPage() {
  const components = await getCommunityComponents();

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar />
      <div className="flex flex-col md:pl-[220px] lg:pl-[280px]">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="grid w-full max-w-6xl gap-2">
            <h1 className="text-3xl font-semibold">Community Gallery</h1>
            <p className="text-muted-foreground">
              Explore components created by the community.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {components.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={item.authorImage} />
                            <AvatarFallback>{item.authorName?.[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{item.authorName || 'Anonymous'}</span>
                    </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted aspect-video rounded-md flex items-center justify-center p-4">
                    {/* This is a placeholder for a preview image */}
                    <span className="text-sm text-muted-foreground">Preview coming soon</span>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col items-start gap-4">
                    <div>
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                    </div>
                  <div className="flex w-full justify-between items-center">
                    <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                            <Heart className="h-4 w-4" />
                            <span className="sr-only">Like</span>
                        </Button>
                         <Button variant="ghost" size="icon">
                            <Copy className="h-4 w-4" />
                            <span className="sr-only">Copy</span>
                        </Button>
                    </div>
                    <Button asChild variant="outline">
                        <Link href={`/component/${item.id}`}>View</Link>
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
