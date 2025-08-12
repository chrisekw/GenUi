
'use client';

import { useEffect, useState, useTransition } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getUserComponents } from '@/app/actions';
import type { GalleryItem } from '@/lib/gallery-items';
import { Header } from '@/components/app/header';
import { Sidebar } from '@/components/app/sidebar';
import { Button } from '@/components/ui/button';
import { Heart, Copy, Eye } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
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

export default function MyComponentsPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [components, setComponents] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // State to track liked components for instant feedback
  const [likedComponents, setLikedComponents] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!authLoading && user) {
      async function fetchUserComponents() {
        setLoading(true);
        try {
          const userComps = await getUserComponents(user.uid);
          setComponents(userComps);
        } catch (error) {
          console.error("Error fetching user components:", error);
          toast({ title: 'Failed to load your components', variant: 'destructive'});
        } finally {
          setLoading(false);
        }
      }
      fetchUserComponents();
    } else if (!authLoading && !user) {
        setLoading(false);
    }
  }, [user, authLoading, toast]);


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
          <div 
            key={item.id} 
            className="group relative rounded-xl border border-border/20 bg-card/60 text-card-foreground shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:border-border/50 overflow-hidden hover:-translate-y-1 animate-fade-in-up"
            style={{ animationDelay: `${index * 100}ms`}}
          >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"/>
              <div className="p-1">
                  <div className="relative aspect-video rounded-lg overflow-hidden border border-border/10 shadow-inner">
                      <ComponentRenderer html={item.previewHtml} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"/>
                      <div className="absolute bottom-2 left-3 flex items-center gap-2">
                          <Avatar className="h-6 w-6 border-2 border-background/50">
                              <AvatarImage src={item.authorImage} />
                              <AvatarFallback>{item.authorName?.[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-medium text-white/90 drop-shadow-sm">{item.authorName || 'Anonymous'}</span>
                      </div>
                  </div>
              </div>
              <div className="p-4 pt-2">
                  <h3 className="font-semibold text-foreground truncate">{item.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 h-10">{item.description || 'No description provided.'}</p>
              </div>
              <div className="px-4 pb-4 flex justify-between items-center">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Heart className="h-3.5 w-3.5"/>
                    <span>{item.likes || 0}</span>
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
                        <Tooltip>
                        <TooltipTrigger asChild>
                            <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                                <Link href={`/component/${item.id}`}><Eye className="h-4 w-4" /></Link>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>View Details</p></TooltipContent>
                      </Tooltip>
                  </div>
              </div>
          </div>
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
