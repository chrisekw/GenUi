
'use client';

import { useEffect, useState, useTransition } from 'react';
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
import { ComponentRenderer } from '@/components/app/component-renderer';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { handleLikeComponent, handleCopyComponent } from '@/app/actions';
import { cn } from '@/lib/utils';

export default function CommunityFeedPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [components, setComponents] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // State to track liked components for instant feedback
  const [likedComponents, setLikedComponents] = useState<Record<string, boolean>>({});

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

  const onLikeClick = (componentId: string) => {
    if (!user) {
        toast({ title: 'Please log in to like components', variant: 'destructive'});
        return;
    }
    startTransition(async () => {
        // Optimistic update
        setLikedComponents(prev => ({...prev, [componentId]: !prev[componentId]}));
        setComponents(prev => prev.map(c => c.id === componentId ? {...c, likes: (c.likes || 0) + (likedComponents[componentId] ? -1 : 1)} : c));

        const result = await handleLikeComponent(componentId, user.uid);
        if (!result.success) {
            toast({ title: 'Failed to update like', variant: 'destructive' });
            // Revert optimistic update on failure
            setLikedComponents(prev => ({...prev, [componentId]: !prev[componentId]}));
             setComponents(prev => prev.map(c => c.id === componentId ? {...c, likes: (c.likes || 0) - (likedComponents[componentId] ? -1 : 1)} : c));
        }
    });
  }

  const onCopyClick = (code: string, componentId: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: 'Code copied to clipboard!' });
    startTransition(() => {
        handleCopyComponent(componentId);
    });
  }

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
      <div className="flex flex-col">
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
                <Card key={item.id} className="flex flex-col">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={item.authorImage} />
                                <AvatarFallback>{item.authorName?.[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{item.authorName || 'Anonymous'}</span>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <div className="bg-muted aspect-video rounded-md flex items-center justify-center">
                           <ComponentRenderer html={item.previewHtml} />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col items-start gap-4">
                        <div>
                            <h3 className="font-semibold">{item.name}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                        </div>
                    <div className="flex w-full justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => onLikeClick(item.id)} disabled={isPending}>
                                <Heart className={cn("h-4 w-4", likedComponents[item.id] && "fill-red-500 text-red-500")} />
                                <span className="sr-only">Like</span>
                            </Button>
                             <span className="text-xs text-muted-foreground">{item.likes || 0}</span>
                            <Button variant="ghost" size="icon" onClick={() => onCopyClick(item.code, item.id)}>
                                <Copy className="h-4 w-4" />
                                <span className="sr-only">Copy</span>
                            </Button>
                        </div>
                        <Button asChild variant="outline" size="sm">
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
