
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { getGalleryItems, handleGenerateComponent } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { type GalleryItem } from '@/lib/gallery-items';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowUp,
  Camera,
  ChevronRight,
  CodeXml,
  Figma,
  Layout,
  Upload,
  Menu,
  Eye,
  X,
} from 'lucide-react';
import { Logo } from '../icons/logo';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Textarea } from '../ui/textarea';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
  SheetTitle
} from '@/components/ui/sheet';
import { ComponentPreview } from './component-preview';
import Link from 'next/link';
import { Header } from './header';

export type Framework = 'react' | 'vue' | 'html';

const suggestionButtons = [
  { icon: Layout, text: 'Landing Page', prompt: 'A modern landing page with a hero section and features list.' },
  { icon: CodeXml, text: 'Sign Up Form', prompt: 'A sign up form with email and password fields, and a submit button.' },
  { icon: Camera, text: 'Image-based', prompt: 'A card component based on an image of a product.' },
  { icon: Figma, text: 'Figma-inspired', prompt: 'A dashboard sidebar navigation inspired by Figma\'s UI.' },
];

interface PromptViewProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onGenerate: (prompt: string, framework: Framework, imageUrl?: string) => void;
  isLoading: boolean;
  framework: Framework;
  galleryItems: GalleryItem[];
  imageUrl: string | null;
  setImageUrl: (url: string | null) => void;
}

function PromptView({ prompt, setPrompt, onGenerate, isLoading, framework, galleryItems, imageUrl, setImageUrl }: PromptViewProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleSuggestionClick = (item: { text: string, prompt: string}) => {
    const newPrompt = item.prompt;
    setPrompt(newPrompt);
  }

  const handleGalleryItemClick = (item: GalleryItem) => {
    const newPrompt = item.prompt;
    setPrompt(newPrompt);
    onGenerate(newPrompt, framework);
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        setImageUrl(loadEvent.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleRemoveImage = () => {
    setImageUrl(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }

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
    <div className="flex flex-col items-center justify-center h-full p-4 md:p-6">
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-8">
        <h1 className="text-4xl md:text-5xl font-medium text-center tracking-tight">
          What can I help you build?
        </h1>
        {imageUrl && (
            <div className="relative w-full max-w-sm mx-auto">
                <Image src={imageUrl} alt="Uploaded component" width={400} height={300} className="rounded-lg object-contain" />
                <Button variant="destructive" size="icon" className="absolute top-2 right-2" onClick={handleRemoveImage}>
                    <X className="h-4 w-4" />
                </Button>
            </div>
        )}
        <div className="relative">
          <Textarea
            placeholder="A pricing card with three tiers and a call to action button."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="bg-background border rounded-lg p-4 pr-24 h-28 text-base focus-visible:ring-1 focus-visible:ring-ring"
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
            <Button variant="ghost" size="icon" onClick={handleUploadClick}>
              <Upload />
            </Button>
            <Button size="icon" onClick={() => onGenerate(prompt, framework, imageUrl || undefined)} disabled={isLoading}>
              <ArrowUp />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 items-center justify-center gap-2">
          {suggestionButtons.map((item, index) => (
            <Button key={index} variant="outline" className="rounded-lg" onClick={() => handleSuggestionClick(item)}>
              <item.icon className="mr-2" />
              {item.text}
            </Button>
          ))}
        </div>
      </div>
      <div className="w-full max-w-7xl mx-auto mt-16">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-medium tracking-tight">From the Community</h2>
            <p className="text-muted-foreground">Explore what the community is building.</p>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/community">
                Browse All <ChevronRight className="ml-1" />
            </Link>
          </Button>
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
      </div>
    </div>
  );
}

export function MainLayout() {
  const [framework, setFramework] = React.useState<Framework>('react');
  const [prompt, setPrompt] = React.useState('');
  const [generatedCode, setGeneratedCode] = React.useState('');
  const [layoutSuggestions, setLayoutSuggestions] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [activeView, setActiveView] = React.useState('prompt'); // 'prompt' or 'preview'
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);
  const { toast } = useToast();
  const [galleryItems, setGalleryItems] = React.useState<GalleryItem[]>([]);
  
  React.useEffect(() => {
    const fetchGalleryItems = async () => {
        const items = await getGalleryItems();
        setGalleryItems(items.slice(0, 3)); // Show only 3 items on the main page
    };
    if (activeView === 'prompt') {
      fetchGalleryItems();
    }
  }, [activeView]);

  const onGenerate = async (currentPrompt: string, currentFramework: Framework, currentImageUrl?: string) => {
    if (!currentPrompt) {
      toast({
        title: 'Prompt is empty',
        description: 'Please enter a prompt to generate a component.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setGeneratedCode('');
    setLayoutSuggestions('');
    if (activeView !== 'preview') {
      setActiveView('preview');
    }
    
    try {
      const result = await handleGenerateComponent({ prompt: currentPrompt, framework: currentFramework, imageUrl: currentImageUrl });
      setGeneratedCode(result.code);
      setLayoutSuggestions(result.suggestions);
      setFramework(currentFramework);
      setPrompt(currentPrompt);
      if (currentImageUrl) {
        setImageUrl(currentImageUrl);
      }
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error generating component',
        description:
          'There was an error generating the component. Please try again.',
        variant: 'destructive',
      });
      setGeneratedCode('');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFrameworkChange = (newFramework: Framework) => {
    setFramework(newFramework);
    if(prompt && generatedCode) {
      onGenerate(prompt, newFramework, imageUrl || undefined);
    }
  }

  const handleBackToPrompt = () => {
    setActiveView('prompt');
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />
      <main className="flex-1 overflow-y-auto">
        {activeView === 'prompt' && <PromptView 
            prompt={prompt}
            setPrompt={setPrompt}
            onGenerate={onGenerate}
            isLoading={isLoading}
            framework={framework}
            galleryItems={galleryItems}
            imageUrl={imageUrl}
            setImageUrl={setImageUrl}
        />}
        {activeView === 'preview' && (
          <ComponentPreview
            code={generatedCode}
            suggestions={layoutSuggestions}
            isLoading={isLoading}
            framework={framework}
            prompt={prompt}
            onBack={handleBackToPrompt}
            onFrameworkChange={handleFrameworkChange}
          />
        )}
      </main>
    </div>
  );
}
