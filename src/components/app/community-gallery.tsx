
'use client';

import * as React from 'react';
import { type GalleryItem } from '@/lib/gallery-items';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Copy, ThumbsUp, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { handleGenerateComponent } from '@/app/actions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CommunityGalleryProps {
  galleryItems: GalleryItem[];
}

export function CommunityGallery({ galleryItems }: CommunityGalleryProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loadingStates, setLoadingStates] = React.useState<Record<string, boolean>>({});
  const [generatedCodes, setGeneratedCodes] = React.useState<Record<string, Record<string, string>>>({});
  const [activeTabs, setActiveTabs] = React.useState<Record<string, string>>({});

  const handleUseComponent = (item: GalleryItem) => {
    router.push(`/?prompt=${encodeURIComponent(item.prompt)}`);
  };

  const handleCopyCode = (itemId: string, itemCode: string) => {
    const activeFramework = activeTabs[itemId] || 'react';
    const codeToCopy = generatedCodes[itemId]?.[activeFramework] || itemCode;
    navigator.clipboard.writeText(codeToCopy);
    toast({
      title: 'Copied to clipboard!',
      description: 'The component code has been copied.',
    });
  };

  const handleFrameworkChange = async (itemId: string, itemPrompt: string, framework: 'react' | 'vue' | 'html') => {
    setActiveTabs(prev => ({...prev, [itemId]: framework}));
    const itemKey = `${itemId}-${framework}`;
    if (generatedCodes[itemId]?.[framework]) {
      return;
    }

    setLoadingStates(prev => ({...prev, [itemKey]: true}));
    try {
        const result = await handleGenerateComponent({prompt: itemPrompt, framework});
        setGeneratedCodes(prev => ({
            ...prev,
            [itemId]: {
                ...prev[itemId],
                [framework]: result.code,
            }
        }));
    } catch (error) {
        toast({
            title: 'Error generating code',
            description: 'Could not generate code for the selected framework.',
            variant: 'destructive',
        });
    } finally {
        setLoadingStates(prev => ({...prev, [itemKey]: false}));
    }
  }

  const getIframeSrcDoc = (code: string, framework: 'react' | 'vue' | 'html') => {
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
      body { 
        background-color: hsl(var(--background));
        color: hsl(var(--foreground));
        font-family: Inter, sans-serif;
        zoom: 0.5;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        min-height: 100vh;
        padding: 1rem;
        box-sizing: border-box;
      }
    `;
    
    if (framework === 'react') {
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
            <div id="root"></div>
            <script type="text/babel">
                ${code
                .replace(/^import\s.*?;/gm, '')
                .replace(/export\s+default\s+\w+;?/m, '')
                .replace(/export\s+(const|function)\s+(\w+)/, 'const $2 = ')}
                const Component = ${code.match(/export\s+default\s+(\w+)/)?.[1] || code.match(/export\s+(?:const|function)\s+([A-Z]\w*)/)?.[1] || '() => null'};
                ReactDOM.render(<Component />, document.getElementById('root'));
            </script>
            </body>
        </html>
        `;
    }
    
    if (framework === 'vue') {
        return `
        <!DOCTYPE html>
        <html>
            <head>
                <script src="https://cdn.tailwindcss.com"></script>
                <script src="https://unpkg.com/vue@3"></script>
                <style>${baseStyles}</style>
            </head>
            <body class="dark">
                <div id="app"></div>
                <script>
                    const component = {
                        template: \`
                            ${code.replace(/`/g, '\\`')}
                        \`
                    };
                    Vue.createApp(component).mount('#app');
                </script>
            </body>
        </html>
        `;
    }

    // HTML
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>${baseStyles}</style>
        </head>
        <body class="dark">
          ${code}
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
          {galleryItems.map((item, index) => {
            const itemId = `${item.name}-${index}`;
            const initialCode = item.code;
            const activeFramework = activeTabs[itemId] || 'react';
            const code = generatedCodes[itemId]?.[activeFramework] || (activeFramework === 'react' ? initialCode : '');
            
            return (
                <Card key={itemId} id={itemId} className="overflow-hidden group flex flex-col">
                  <Tabs defaultValue="react" className="w-full flex flex-col flex-grow" onValueChange={(fw) => handleFrameworkChange(itemId, item.prompt, fw as any)}>
                    <CardContent className="p-0 flex-grow">
                      <div className="aspect-video overflow-hidden bg-muted relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button variant="secondary" onClick={() => handleUseComponent(item)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Use Component
                          </Button>
                        </div>
                        <iframe
                            srcDoc={getIframeSrcDoc(code, activeFramework as any)}
                            title={`${item.name} - ${activeFramework}`}
                            sandbox="allow-scripts allow-same-origin"
                            className="w-full h-full object-cover"
                            scrolling="no"
                        />
                      </div>
                      <div className="p-4 border-b">
                        <p className="font-medium">{item.name}</p>
                      </div>
                      <div className="p-2 flex items-center justify-between">
                         <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="react">React</TabsTrigger>
                            <TabsTrigger value="vue">Vue</TabsTrigger>
                            <TabsTrigger value="html">HTML</TabsTrigger>
                        </TabsList>
                      </div>
                       <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Button variant="ghost" size="icon">
                                    <ThumbsUp className="h-4 w-4"/>
                                </Button>
                                 <Button variant="ghost" size="icon">
                                    <MessageSquare className="h-4 w-4"/>
                                </Button>
                            </div>
                            <Button variant="outline" onClick={() => handleCopyCode(itemId, item.code)}>
                                <Copy className="h-4 w-4 mr-2" />
                                Copy Code
                            </Button>
                        </div>
                    </CardContent>
                  </Tabs>
                </Card>
            )
          })}
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
