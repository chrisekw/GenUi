
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { handleGenerateComponent } from '@/app/actions';
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
  Link as LinkIcon,
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
} from '@/components/ui/sheet';
import { ComponentPreview } from './component-preview';
import { DialogTitle } from '@radix-ui/react-dialog';

type Framework = 'react' | 'vue' | 'html';

const suggestionButtons = [
  { icon: Camera, text: 'Clone a Screenshot', prompt: 'Clone a screenshot to component' },
  { icon: Figma, text: 'Import from Figma', prompt: 'Import a component from Figma' },
  { icon: Layout, text: 'Landing Page', prompt: 'A modern landing page with a hero section and features list.' },
  { icon: CodeXml, text: 'Sign Up Form', prompt: 'A sign up form with email and password fields, and a submit button.' },
];

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

  const onGenerate = async (currentPrompt: string) => {
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
    setActiveView('preview');
    try {
      const result = await handleGenerateComponent(currentPrompt, framework);
      setGeneratedCode(result.code);
      setLayoutSuggestions(result.suggestions);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error generating component',
        description:
          'There was an error generating the component. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (item: { text: string, prompt: string}) => {
    setPrompt(item.prompt);
    onGenerate(item.prompt);
  }

  const handleGalleryItemClick = (item: GalleryItem) => {
    setPrompt(item.prompt);
    onGenerate(item.prompt);
  };
  
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
              <DialogTitle>
                <div className="flex items-center gap-2 py-4">
                  <Logo />
                  <span className="text-xl font-semibold">GenUI</span>
                </div>
              </DialogTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-2">
              {/* Add mobile navigation items here */}
            </nav>
          </SheetContent>
        </Sheet>
      ) : (
        <div className="flex items-center gap-2">
          <Logo />
           <h1 className="text-xl font-semibold">GenUI</h1>
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

  const PromptView = () => (
    <div className="flex flex-col items-center justify-center h-full p-4 md:p-6">
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-8">
        <h1 className="text-4xl md:text-5xl font-medium text-center tracking-tight">
          What can I help you build?
        </h1>
        <div className="relative">
          <Textarea
            placeholder="A pricing card with three tiers..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="bg-background border rounded-lg p-4 pr-24 h-28 text-base focus-visible:ring-1 focus-visible:ring-ring"
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <LinkIcon />
            </Button>
            <Button size="icon" onClick={() => onGenerate(prompt)} disabled={isLoading}>
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
  
  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />
      <main className="flex-1 overflow-y-auto">
        {activeView === 'prompt' && <PromptView />}
        {activeView === 'preview' && (
          <ComponentPreview
            code={generatedCode}
            suggestions={layoutSuggestions}
            isLoading={isLoading}
            framework={framework}
            onBack={() => setActiveView('prompt')}
          />
        )}
      </main>
    </div>
  );
}
