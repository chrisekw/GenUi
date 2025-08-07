'use client';

import * as React from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ComponentPreview } from './component-preview';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { handleGenerateComponent } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { galleryItems, type GalleryItem } from '@/lib/gallery-items';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Code, GalleryHorizontal, Wand2 } from 'lucide-react';
import { Logo } from '../icons/logo';
import { ThemeToggle } from './theme-toggle';

type Framework = 'react' | 'vue' | 'html';

export function MainLayout() {
  const [framework, setFramework] = React.useState<Framework>('react');
  const [prompt, setPrompt] = React.useState('');
  const [generatedCode, setGeneratedCode] = React.useState('');
  const [layoutSuggestions, setLayoutSuggestions] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('prompt');
  const { toast } = useToast();

  const filteredGalleryItems = galleryItems.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

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

  const handleGalleryItemClick = (item: GalleryItem) => {
    setPrompt(item.prompt);
    setActiveTab('prompt');
    onGenerate(item.prompt);
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Logo className="w-8 h-8 text-primary" />
            <span className="text-xl font-semibold">GenUI</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Controls</SidebarGroupLabel>
            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Framework</label>
                <Select
                  value={framework}
                  onValueChange={value => setFramework(value as Framework)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select framework" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="react">React</SelectItem>
                    <SelectItem value="vue">Vue</SelectItem>
                    <SelectItem value="html">HTML</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <ThemeToggle />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
          <SidebarTrigger className="md:hidden" />
          <h1 className="text-lg font-semibold sm:text-xl">
            AI Component Generator
          </h1>
        </header>

        <main className="flex-1 p-4 sm:p-6 md:grid md:grid-cols-2 md:gap-6">
          <div className="flex flex-col gap-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="prompt"><Wand2 className="mr-2"/>AI Prompt</TabsTrigger>
                <TabsTrigger value="gallery"><GalleryHorizontal className="mr-2"/>Gallery</TabsTrigger>
              </TabsList>
              <TabsContent value="prompt" className="mt-4">
                <div className="flex flex-col gap-4">
                  <Textarea
                    placeholder="e.g., A pricing card with three tiers and a primary call-to-action button."
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    className="min-h-[120px] text-base"
                  />
                  <Button
                    onClick={() => onGenerate(prompt)}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? 'Generating...' : 'Generate Component'}
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="gallery" className="mt-4">
                <div className="flex flex-col gap-4">
                  <Input
                    placeholder="Search gallery..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
                    {filteredGalleryItems.map(item => (
                      <Card
                        key={item.name}
                        className="cursor-pointer hover:border-primary transition-colors"
                        onClick={() => handleGalleryItemClick(item)}
                      >
                        <CardHeader>
                          <CardTitle className="text-base">{item.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <div className="mt-6 md:mt-0">
            <ComponentPreview
              code={generatedCode}
              suggestions={layoutSuggestions}
              isLoading={isLoading}
              framework={framework}
            />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
