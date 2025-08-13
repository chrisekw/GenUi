
'use client';

import { useEffect, useState, useTransition } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getUserComponents } from '@/app/actions';
import type { GalleryItem } from '@/lib/gallery-items';
import { Header } from '@/components/app/header';
import { Sidebar } from '@/components/app/sidebar';
import { Button } from '@/components/ui/button';
import { Heart, Copy, GitFork } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { ComponentRenderer } from '@/components/app/component-renderer';
import { useToast } from '@/hooks/use-toast';
import { handleLikeComponent, handleCopyComponent } from '@/app/actions';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';

export default function MyComponentsPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [components, setComponents] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [likedComponents, setLikedComponents] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }
    if (!user) {
      setLoading(false);
      setComponents([]);
      return;
    }

    const q = query(
      collection(db, 'community_components'),
      where('authorId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userComps = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date()
        } as GalleryItem;
      });
      setComponents(userComps);

      const checkLikes = async () => {
        const liked: Record<string, boolean> = {};
        for (const comp of userComps) {
          const likeRef = doc(db, `users/${user.uid}/likes`, comp.id);
          const likeDoc = await getDoc(likeRef);
          if (likeDoc.exists()) {
            liked[comp.id] = true;
          }
        }
        setLikedComponents(liked);
      };
      checkLikes();
      setLoading(false);
    }, (error) => {
      console.error("Error fetching user components:", error);
      toast({ title: 'Failed to load your components', variant: 'destructive'});
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, authLoading, toast]);


  const onLikeClick = (componentId: string) => {
    if (!user) {
        toast({ title: 'Please log in to like components', variant: 'destructive'});
        return;
    }
    const isCurrentlyLiked = !!likedComponents[componentId];

    // Optimistic update
    startTransition(() => {
        setLikedComponents(prev => ({...prev, [componentId]: !isCurrentlyLiked}));
        setComponents(prev => prev.map(c => 
            c.id === componentId 
            ? {...c, likes: (c.likes || 0) + (isCurrentlyLiked ? -1 : 1)} 
            : c
        ));
    });

    startTransition(async () => {
        const result = await handleLikeComponent(componentId, user.uid);
        if (!result.success) {
            toast({ title: 'Failed to update like', variant: 'destructive' });
            // Revert optimistic update on failure
            startTransition(() => {
                setLikedComponents(prev => ({...prev, [componentId]: isCurrentlyLiked}));
                 setComponents(prev => prev.map(c => 
                    c.id === componentId 
                    ? {...c, likes: (c.likes || 0) - (isCurrentlyLiked ? -1 : 1)} 
                    : c
                ));
            });
        }
    });
  }

  const onCopyClick = (code: string, componentId: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: 'Code copied to clipboard!' });
    
    // Optimistic update for copy count
    startTransition(() => {
        setComponents(prev => prev.map(c => 
            c.id === componentId 
            ? {...c, copies: (c.copies || 0) + 1} 
            : c
        ));
    });

    startTransition(() => {
        handleCopyComponent(componentId);
    });
  }

  const renderSkeleton = () => (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
             <div key={i} className="rounded-xl bg-muted/40 p-4 h-96 animate-pulse" />
        ))}
    </div>
    );

  const renderContent = () => {
    if (loading || authLoading) {
      return renderSkeleton();
    }
    
    if (!user) {
        return (
            <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">Please log in to see your components.</p>
                 <Button asChild className="mt-4">
                    <Link href="/login">Log In</Link>
                </Button>
            </div>
        )
    }

    if (components.length === 0) {
      return (
        <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">You haven't published any components yet.</p>
            <Button asChild className="mt-4">
                <Link href="/">Create a Component</Link>
            </Button>
        </div>
      )
    }

    return (
       <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full max-w-7xl mx-auto">
        {components.map((item, index) => (
           <Card 
            key={item.id}
            className="group relative flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-fade-in-up"
            style={{ animationDelay: `${index * 100}ms`}}
          >
              <CardContent className="p-0 aspect-video flex-grow">
                <Link href={`/component/${item.id}`} className="block w-full h-full">
                  <ComponentRenderer html={item.previewHtml} />
                </Link>
              </CardContent>
              <CardFooter className="flex items-center justify-between p-4 bg-card border-t">
                  <div className='flex-grow overflow-hidden'>
                    <p className="font-semibold truncate text-sm">{item.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3"/>
                        <span>{item.likes || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <GitFork className="h-3 w-3"/>
                        <span>{item.copies || 0}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onLikeClick(item.id)} disabled={isPending}>
                              <Heart className={cn("h-4 w-4", likedComponents[item.id] && "fill-red-500 text-red-500")} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Like</p></TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onCopyClick(item.code, item.id)}>
                              <Copy className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Copy Code</p></TooltipContent>
                      </Tooltip>
                  </div>
              </CardFooter>
          </Card>
        ))}
      </div>
    )
  }


  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar />
      <div className="flex flex-col">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 bg-background animate-fade-in">
          <div className="grid w-full max-w-7xl mx-auto gap-2">
            <h1 className="text-3xl font-semibold">My Components</h1>
            <p className="text-muted-foreground">
              Here are the components you've created and published.
            </p>
          </div>
          
          <TooltipProvider>
            {renderContent()}
          </TooltipProvider>
        </main>
      </div>
    </div>
  );
}
