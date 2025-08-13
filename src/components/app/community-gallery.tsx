
'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { GalleryItem } from '@/lib/gallery-items';
import { getCommunityComponents } from '@/app/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { ComponentRenderer } from '@/components/app/component-renderer';
import { Card, CardContent } from '@/components/ui/card';

export function CommunityGallery() {
  const [components, setComponents] = React.useState<GalleryItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchComponents() {
      try {
        const comps = await getCommunityComponents(4);
        setComponents(comps);
      } catch (error) {
        console.error("Error fetching community components:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchComponents();
  }, []);

  const renderSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardContent className="p-0">
            <Skeleton className="w-full h-64" />
             <div className="p-4">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-12">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">From the Community</h2>
          <p className="text-muted-foreground">Explore what the community is building.</p>
        </div>
        <Link href="/community" className="flex items-center text-sm font-medium text-primary hover:underline">
          Browse All <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
      {loading ? renderSkeleton() : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {components.map((item) => (
            <Link key={item.id} href={`/component/${item.id}`} className="group">
              <Card className="overflow-hidden h-full">
                <CardContent className="p-0">
                    <div className="bg-muted aspect-video flex items-center justify-center overflow-hidden">
                        <ComponentRenderer html={item.previewHtml} />
                    </div>
                     <div className="p-4">
                        <h3 className="font-semibold truncate group-hover:text-primary">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">By {item.authorName || 'Anonymous'}</p>
                    </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
