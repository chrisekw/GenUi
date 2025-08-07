'use client';

import * as React from 'react';
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
import { GalleryHorizontal, Wand2 } from 'lucide-react';
import { Logo } from '../icons/logo';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';

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
    <div className="flex flex-col h-screen bg-background">
      <header className="flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <Logo className="w-6 h-6 text-foreground" />
          <span className="font-semibold">GenUI</span>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <Select
            value={framework}
            onValueChange={value => setFramework(value as Framework)}
          >
            <SelectTrigger className="w-[120px] h-8 text-xs">
              <SelectValue placeholder="Select framework" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="react">React</SelectItem>
              <SelectItem value="vue">Vue</SelectItem>
              <SelectItem value="html">HTML</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Wand2 className="h-4 w-4" />
          </Button>
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>
      </header>
      <main className="flex-1 grid grid-cols-1 md:grid-cols-[350px_1fr] overflow-hidden">
        <aside className="flex flex-col border-r">
          <div className="p-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="prompt"><Wand2 className="h-4 w-4 mr-2"/>AI Prompt</TabsTrigger>
                <TabsTrigger value="gallery"><GalleryHorizontal className="h-4 w-4 mr-2"/>Gallery</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <Separator />
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'prompt' && (
              <div className="p-4 flex flex-col gap-4 h-full">
                <Textarea
                  placeholder="e.g., A pricing card with three tiers and a primary call-to-action button."
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  className="flex-1 text-base bg-secondary"
                />
                <Button
                  onClick={() => onGenerate(prompt)}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Generating...' : 'Generate'}
                </Button>
              </div>
            )}
             {activeTab === 'gallery' && (
              <div className="p-4 flex flex-col gap-4">
                  <Input
                    placeholder="Search gallery..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="bg-secondary"
                  />
                  <div className="grid grid-cols-1 gap-4">
                    {filteredGalleryItems.map(item => (
                      <Card
                        key={item.name}
                        className="cursor-pointer hover:border-primary transition-colors overflow-hidden bg-secondary"
                        onClick={() => handleGalleryItemClick(item)}
                      >
                        <div className="aspect-video overflow-hidden">
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={600}
                            height={400}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <CardHeader className="p-3">
                          <CardTitle className="text-sm">{item.name}</CardTitle>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
              </div>
             )}
          </div>
        </aside>
        <div className="flex-1 flex flex-col overflow-hidden">
           <ComponentPreview
              code={generatedCode}
              suggestions={layoutSuggestions}
              isLoading={isLoading}
              framework={framework}
            />
        </div>
      </main>
    </div>
  );
}
