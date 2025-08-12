
'use client';

import { useEffect, useState, useTransition } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, orderBy, query, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { Header } from '@/components/app/header';
import { Sidebar } from '@/components/app/sidebar';
import { Button } from '@/components/ui/button';
import { Heart, Copy, GitFork } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import type { GalleryItem } from '@/lib/gallery-items';
import { Skeleton } from '@/components/ui/skeleton';
import { ComponentRenderer } from '@/components/app/component-renderer';
import { useAuth } from '@/hooks/use-auth';
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

export default function CommunityFeedPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [components, setComponents] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // State to track liked components for instant feedback
  const [likedComponents, setLikedComponents] = useState<Record<string, boolean>>({});

   useEffect(() => {
    if (user) {
      const checkLikes = async (comps: GalleryItem[]) => {
        const liked: Record<string, boolean> = {};
        for (const comp of comps) {
          const likeRef = doc(db, `users/${user.uid}/likes`, comp.id);
          const likeDoc = await getDoc(likeRef);
          if (likeDoc.exists()) {
            liked[comp.id] = true;
          }
        }
        setLikedComponents(liked);
      };

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
        checkLikes(comps);
        setLoading(false);
      }, (error) => {
          console.error("Error fetching community components:", error);
          setLoading(false);
      });

      return () => unsubscribe();

    } else {
        // Fetch components without checking likes if user is not logged in
        const q = query(collection(db, 'community_components'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const comps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GalleryItem));
            setComponents(comps);
            setLoading(false);
        });
        return () => unsubscribe();
    }
  }, [user]);

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
        {Array.from({ length: 8 }).map((_, i) => (
             <div key={i} className="rounded-xl bg-muted/40 p-4 h-96 animate-pulse" />
        ))}
    </div>
    );


  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar />
      <div className="flex flex-col">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 bg-background animate-fade-in">
          <div className="grid w-full max-w-7xl mx-auto gap-2">
            <h1 className="text-3xl font-semibold">Community Gallery</h1>
            <p className="text-muted-foreground">
              Explore components created by the community. Updates in real-time.
            </p>
          </div>
          
          <TooltipProvider>
            {loading ? renderSkeleton() : (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full max-w-7xl mx-auto">
              {components.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                      <p className="text-muted-foreground">No components published yet. Be the first!</p>
                  </div>
              ) : (
                  components.map((item, index) => (
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
                  ))
              )}
              </div>
            )}
          </TooltipProvider>
        </main>
      </div>
    </div>
  );
}
