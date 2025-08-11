'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { Header } from '@/components/app/header';
import { Sidebar } from '@/components/app/sidebar';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Copy } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import type { GalleryItem } from '@/lib/gallery-items';
import { Skeleton } from '@/components/ui/skeleton';


export default function CommunityFeedPage() {
  const [components, setComponents] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'community_components'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const comps = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date()
        } as GalleryItem;
      });
      setComponents(comps);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching community components:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const renderSkeleton = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                </CardHeader>
                <CardContent>
                    <Skeleton className="aspect-video rounded-md" />
                </CardContent>
                <CardFooter className="flex flex-col items-start gap-4">
                    <div>
                        <Skeleton className="h-5 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-full" />
                         <Skeleton className="h-4 w-1/2 mt-1" />
                    </div>
                    <div className="flex w-full justify-between items-center">
                        <div className="flex gap-2">
                           <Skeleton className="h-8 w-8" />
                           <Skeleton className="h-8 w-8" />
                        </div>
                        <Skeleton className="h-9 w-20" />
                    </div>
                </CardFooter>
            </Card>
        ))}
    </div>
    );


  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar />
      <div className="flex flex-col md:pl-[220px] lg:pl-[280px]">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="grid w-full max-w-6xl gap-2">
            <h1 className="text-3xl font-semibold">Community Gallery</h1>
            <p className="text-muted-foreground">
              Explore components created by the community. Updates in real-time.
            </p>
          </div>
          
          {loading ? renderSkeleton() : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {components.length === 0 ? (
                <div className="col-span-full text-center py-12">
                    <p className="text-muted-foreground">No components published yet. Be the first!</p>
                </div>
            ) : (
                components.map((item) => (
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
                ))
            )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}