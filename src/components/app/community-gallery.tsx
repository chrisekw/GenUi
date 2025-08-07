
'use client';

import * as React from 'react';
import { type GalleryItem } from '@/lib/gallery-items';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CommunityGalleryProps {
  galleryItems: GalleryItem[];
}

export function CommunityGallery({ galleryItems }: CommunityGalleryProps) {
  const router = useRouter();

  const handleGalleryItemClick = (item: GalleryItem) => {
    // This functionality would ideally set the prompt and generate the component.
    // For now, we'll just log it. A more robust solution might use a global state manager.
    console.log('Selected item:', item.prompt);
    // For demonstration, we could navigate back to the main page with the prompt as a query param
    router.push(`/?prompt=${encodeURIComponent(item.prompt)}`);
  };

  const getIframeSrcDoc = (code: string) => {
    const baseStyles = `
      :root {
          --background: 240 6% 10%;
          --foreground: 0 0% 98%;
          --card: 240 6% 10%;
          --card-foreground: 0 0% 98%;
          --popover: 240 6% 10%;
          --popover-foreground: 0 0% 98%;
          --primary: 0 0% 98%;
          --primary-foreground: 240 5.9% 10%;
          --secondary: 240 3.7% 15.9%;
          --secondary-foreground: 0 0% 98%;
          --muted: 240 3.7% 15.9%;
          --muted-foreground: 240 5% 64.9%;
          --accent: 240 3.7% 15.9%;
          --accent-foreground: 0 0% 98%;
          --destructive: 0 62.8% 30.6%;
          --destructive-foreground: 0 0% 98%;
          --border: 240 3.7% 15.9%;
          --input: 240 3.7% 15.9%;
          --ring: 240 4.9% 83.9%;
      }
      html.dark {
          --background: 240 6% 10%;
          --foreground: 0 0% 98%;
          --card: 240 6% 10%;
          --card-foreground: 0 0% 98%;
          --popover: 240 6% 10%;
          --popover-foreground: 0 0% 98%;
          --primary: 0 0% 98%;
          --primary-foreground: 240 5.9% 10%;
          --secondary: 240 3.7% 15.9%;
          --secondary-foreground: 0 0% 98%;
          --muted: 240 3.7% 15.9%;
          --muted-foreground: 240 5% 64.9%;
          --accent: 240 3.7% 15.9%;
          --accent-foreground: 0 0% 98%;
          --destructive: 0 62.8% 30.6%;
          --destructive-foreground: 0 0% 98%;
          --border: 240 3.7% 15.9%;
          --input: 240 3.7% 15.9%;
          --ring: 240 4.9% 83.9%;
      }
      body { 
        background-color: hsl(var(--background));
        color: hsl(var(--foreground));
        font-family: Inter, sans-serif;
        zoom: 0.5;
      }
    `;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <script src="https://cdn.tailwindcss.com"></script>
          <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
          <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
          <style>${baseStyles}</style>
        </head>
        <body class="dark">
          <div id="root" class="flex items-center justify-center w-full h-full min-h-screen p-4"></div>
          <script type="text/babel">
            ${code
              .replace(/^import\s.*?;/gm, '')
              .replace(/export\s+default\s+\w+;?/m, '')
              .replace(/export\s+(const|function)\s+(\w+)/, 'const $2 = ')}
            const Component = ${code.match(/export\s+default\s+(\w+)/)?.[1] || code.match(/export\s+const\s+(\w+)/)?.[1] || '() => null'};
            ReactDOM.render(<Component />, document.getElementById('root'));
          </script>
        </body>
      </html>
    `;
  };

  return (
    <div className="p-4 md:p-6">
      <div className="w-full max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight">Community Gallery</h1>
          <p className="text-muted-foreground mt-2">Explore components created by the community.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryItems.map((item) => (
            <Card
              key={item.name}
              className="cursor-pointer hover:border-primary/50 transition-colors overflow-hidden group"
              onClick={() => handleGalleryItemClick(item)}
            >
              <CardContent className="p-0">
                <div className="aspect-video overflow-hidden bg-muted relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="secondary">
                      <Eye className="h-4 w-4 mr-2" />
                      Use Component
                    </Button>
                  </div>
                  <iframe
                    srcDoc={getIframeSrcDoc(item.code)}
                    title={item.name}
                    sandbox="allow-scripts allow-same-origin"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    scrolling="no"
                  />
                </div>
                <div className="p-4">
                  <p className="font-medium">{item.name}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {galleryItems.length === 0 && (
            <div className="text-center text-muted-foreground py-16">
                <p>The community gallery is empty.</p>
                <p>Generate a component and publish it to get started!</p>
            </div>
        )}
      </div>
    </div>
  );
}

