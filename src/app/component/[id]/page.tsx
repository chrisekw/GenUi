
'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { getComponentById } from '@/app/actions';
import type { GalleryItem } from '@/lib/gallery-items';
import { Header } from '@/components/app/header';
import { Sidebar } from '@/components/app/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { ComponentPreview } from '@/components/app/component-preview';
import { MainLayout } from '@/components/app/main-layout';

export default function ComponentDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const [component, setComponent] = React.useState<GalleryItem | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (id) {
            async function fetchComponent() {
                try {
                    const comp = await getComponentById(id);
                    if (comp) {
                        setComponent(comp);
                    } else {
                        setError('Component not found.');
                    }
                } catch (e) {
                    setError('Failed to fetch component.');
                    console.error(e);
                } finally {
                    setLoading(false);
                }
            }
            fetchComponent();
        }
    }, [id]);

    const renderSkeleton = () => (
        <div className="p-8">
            <Skeleton className="h-12 w-1/2 mb-4" />
            <Skeleton className="h-6 w-3/4 mb-8" />
            <div className="border rounded-lg">
                <div className="h-12 bg-muted border-b" />
                <Skeleton className="aspect-video w-full" />
            </div>
        </div>
    );
    
    if (loading) {
        return (
             <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
                <Sidebar />
                <div className="flex flex-col">
                    <Header />
                    <main className="flex-1">
                        {renderSkeleton()}
                    </main>
                </div>
            </div>
        )
    }

    if (error || !component) {
       return (
             <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
                <Sidebar />
                <div className="flex flex-col">
                    <Header />
                    <main className="flex-1 flex items-center justify-center">
                       <p>{error || 'Component could not be loaded.'}</p>
                    </main>
                </div>
            </div>
        )
    }

    // We can reuse the MainLayout and ComponentPreview by passing the fetched component data
    // This requires some refactoring of MainLayout and ComponentPreview to accept initial data.
    // For now, let's just display it. A better implementation would be to make the core layout reusable.
    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <Sidebar />
            <div className="flex flex-col">
                <Header />
                <main className="flex-1 h-[calc(100vh-60px)]">
                    <ComponentPreview
                        code={component.code}
                        suggestions={`This component was created from the prompt: "${component.prompt}"`}
                        isLoading={false}
                        framework={component.framework}
                        prompt={component.prompt}
                        onBack={() => window.history.back()}
                        onFrameworkChange={() => { /* Framework change can be handled here if needed */}}
                        isPublished
                    />
                </main>
            </div>
        </div>
    );
}

