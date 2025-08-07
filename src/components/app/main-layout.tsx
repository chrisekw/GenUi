
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
  onGenerate: (prompt: string, framework: Framework) => void;
  isLoading: boolean;
  framework: Framework;
  galleryItems: GalleryItem[];
}

function PromptView({ prompt, setPrompt, onGenerate, isLoading, framework, galleryItems }: PromptViewProps) {
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
      // Handle the file upload here.
      // For now, let's just log the file name to the console.
      console.log('Uploaded file:', file.name);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 md:p-6">
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-8">
        <h1 className="text-4xl md:text-5xl font-medium text-center tracking-tight">
          What can I help you build?
        </h1>
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
            />
            <Button variant="ghost" size="icon" onClick={handleUploadClick}>
              <Upload />
            </Button>
            <Button size="icon" onClick={() => onGenerate(prompt, framework)} disabled={isLoading}>
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
          <Button variant="ghost">Browse All <ChevronRight className="ml-1" /></Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryItems.map((item) => (
            <Card
              key={item.name}
              className="cursor-pointer hover:border-primary/50 transition-colors overflow-hidden group"
              onClick={() => handleGalleryItemClick(item)}
            >
              <CardContent className="p-0">
                <div className="aspect-video overflow-hidden bg-muted">
                   <Image
                      src={item.image}
                      alt={item.name}
                      width={600}
                      height={400}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                      data-ai-hint={item['data-ai-hint']}
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
  const [isSidebarOpen, setSidebarOpen] = React.useState(false);
  const [activeView, setActiveView] = React.useState('prompt'); // 'prompt' or 'preview'
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [galleryItems, setGalleryItems] = React.useState<GalleryItem[]>([]);
  
  React.useEffect(() => {
    const fetchGalleryItems = async () => {
        const items = await getGalleryItems();
        setGalleryItems(items);
    };
    if (activeView === 'prompt') {
      fetchGalleryItems();
    }
  }, [activeView]);

  const onGenerate = async (currentPrompt: string, currentFramework: Framework) => {
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
      const result = await handleGenerateComponent(currentPrompt, currentFramework);
      setGeneratedCode(result.code);
      setLayoutSuggestions(result.suggestions);
      setFramework(currentFramework);
      setPrompt(currentPrompt);
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
      onGenerate(prompt, newFramework);
    }
  }

  const handleBackToPrompt = () => {
    setActiveView('prompt');
  }

  const Header = () => (
    <header className="flex h-16 items-center justify-between gap-4 border-b bg-background px-4 sm:px-6">
    <div className="flex items-center gap-4">
      {isMobile ? (
        <Sheet open={isSidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full max-w-xs">
            <SheetHeader>
              <SheetTitle>
                <div className="flex items-center gap-2 py-4">
                  <Logo />
                  <span className="text-xl font-semibold">GenUI</span>
                </div>
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-2">
              {/* Add mobile navigation items here */}
            </nav>
          </SheetContent>
        </Sheet>
      ) : (
        <div className="flex items-center gap-2">
          <Logo />
           <h1 className="text-xl font-semibold">GenUi</h1>
        </div>
      )}
    </div>

    <div className="flex items-center gap-4">
      <Avatar className="h-8 w-8">
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
    </div>
  </header>
  );

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
