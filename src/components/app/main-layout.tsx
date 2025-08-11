
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { handleGenerateComponent, handleCloneUrl } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowUp,
  Image as ImageIcon,
  CodeXml,
  Layout,
  Link as LinkIcon,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { Textarea } from '../ui/textarea';
import { ComponentPreview } from './component-preview';
import { Header } from './header';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useAuth } from '@/hooks/use-auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sidebar } from './sidebar';
import { CommunityGallery } from './community-gallery';

export type Framework = 'react' | 'html';

const samplePrompts = [
    'A modern login form with social media buttons.',
    'A product card with an image, title, price, and "Add to Cart" button.',
    'A responsive navigation bar with a logo and links.',
    'A hero section with a background image and a call-to-action.',
    'A pricing table with three different plans.',
    'A testimonial slider.',
    'A contact form with name, email, and message fields.',
    'A footer with social media icons and navigation links.',
    'A sign up form with email and password fields, and a submit button.'
];

interface PromptViewProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onGenerate: (prompt: string, framework: Framework, imageUrl?: string) => void;
  onClone: (url: string, framework: Framework) => void;
  isLoading: boolean;
  imageUrl: string | null;
  setImageUrl: (url: string | null) => void;
}

function PromptView({ prompt, setPrompt, onGenerate, onClone, isLoading, imageUrl, setImageUrl }: PromptViewProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [showCloneDialog, setShowCloneDialog] = React.useState(false);
  const [cloneUrl, setCloneUrlValue] = React.useState('');
  const [dynamicPrompt, setDynamicPrompt] = React.useState(samplePrompts[1]);

  React.useEffect(() => {
    const interval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * samplePrompts.length);
        setDynamicPrompt(samplePrompts[randomIndex]);
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, []);
  
  const suggestionButtons = [
    { icon: Layout, text: 'Landing Page', prompt: 'A professional landing page for a SaaS product. It should include a navigation bar, a hero section with a call-to-action, a features section with three columns, a pricing table with three tiers, a customer testimonials section, and a footer.' },
    { icon: CodeXml, text: 'Dynamic Prompt', prompt: dynamicPrompt },
    { icon: ImageIcon, text: 'Image-based', prompt: 'A component that looks like the image provided.' },
    { icon: LinkIcon, text: 'Clone URL', prompt: '' },
  ];

  const handleSuggestionClick = (item: { text: string, prompt: string}) => {
    const newPrompt = item.prompt;
    setPrompt(newPrompt);
    if (item.text === 'Image-based') {
        handleUploadClick();
    } else if (item.text === 'Clone URL') {
        setShowCloneDialog(true);
    }
  }
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const result = loadEvent.target?.result as string;
        setImageUrl(result);
        if(!prompt.trim()) {
            setPrompt("A component that looks like the image provided.");
        }
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
  
  const handleClone = () => {
    onClone(cloneUrl, 'react');
    setShowCloneDialog(false);
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center p-4 md:p-6 my-12">
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
                    className="bg-background border rounded-lg p-4 pr-16 h-28 text-base focus-visible:ring-1 focus-visible:ring-ring"
                />
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                    />
                    <Button size="icon" onClick={() => onGenerate(prompt, 'react', imageUrl || undefined)} disabled={isLoading}>
                        <ArrowUp />
                    </Button>
                </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 items-center justify-center gap-2">
            {suggestionButtons.map((item, index) => (
                <Button key={index} variant="outline" className="rounded-lg" onClick={() => handleSuggestionClick(item)}>
                <item.icon className="mr-2 h-4 w-4" />
                 {item.text === 'Dynamic Prompt' ? 'Random Suggestion' : item.text}
                </Button>
            ))}
            </div>
        </div>
        </div>
        <Dialog open={showCloneDialog} onOpenChange={setShowCloneDialog}>
            <DialogContent>
            <DialogHeader>
                <DialogTitle>Clone from URL</DialogTitle>
                <DialogDescription>
                    Enter a URL to clone a component from an existing website.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                    URL
                </Label>
                <Input
                    id="url"
                    value={cloneUrl}
                    onChange={(e) => setCloneUrlValue(e.target.value)}
                    className="col-span-3"
                    placeholder="https://example.com"
                />
                </div>
            </div>
            <DialogFooter>
                <Button variant="ghost" onClick={() => setShowCloneDialog(false)}>Cancel</Button>
                <Button onClick={handleClone} disabled={isLoading}>
                {isLoading ? 'Cloning...' : 'Clone'}
                </Button>
            </DialogFooter>
            </DialogContent>
        </Dialog>
    </>
  );
}

export function MainLayout() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [framework, setFramework] = React.useState<Framework>('react');
  const [prompt, setPrompt] = React.useState('');
  const [generatedCode, setGeneratedCode] = React.useState('');
  const [layoutSuggestions, setLayoutSuggestions] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [activeView, setActiveView] = React.useState('prompt'); // 'prompt' or 'preview'
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);
  const { toast } = useToast();
  
  React.useEffect(() => {
    const promptFromUrl = searchParams.get('prompt');
    if (promptFromUrl) {
      const decodedPrompt = decodeURIComponent(promptFromUrl);
      setPrompt(decodedPrompt);
      onGenerate(decodedPrompt, 'react');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const onGenerate = async (currentPrompt: string, currentFramework: Framework, currentImageUrl?: string) => {
    if (!user) {
        router.push('/login');
        return;
    }

    if (!currentPrompt && !currentImageUrl) {
      toast({
        title: 'Prompt or image is required',
        description: 'Please enter a prompt or upload an image to generate a component.',
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

  const onClone = async (url: string, currentFramework: Framework) => {
    if (!user) {
        router.push('/login');
        return;
    }

    if (!url) {
      toast({
        title: 'URL is empty',
        description: 'Please enter a URL to clone a component.',
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
      const result = await handleCloneUrl({ url, framework: currentFramework });
      setGeneratedCode(result.code);
      setLayoutSuggestions(''); // No suggestions for cloned components for now
      setFramework(currentFramework);
      setPrompt(`A component cloned from ${url}`);
      setImageUrl(null);
    } catch (error) {
        console.error(error);
        toast({
            title: 'Error cloning URL',
            description: 'There was an error cloning the URL. Please try again.',
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
    setGeneratedCode('');
    setLayoutSuggestions('');
    setPrompt('');
    setImageUrl(null);
    router.replace('/', undefined);
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar />
      <div className="flex flex-col md:pl-[220px] lg:pl-[280px]">
        <Header />
        <main className="flex-1 overflow-y-auto">
            {activeView === 'prompt' && (
                <>
                    <PromptView 
                        prompt={prompt}
                        setPrompt={setPrompt}
                        onGenerate={onGenerate}
                        onClone={onClone}
                        isLoading={isLoading}
                        imageUrl={imageUrl}
                        setImageUrl={setImageUrl}
                    />
                    <CommunityGallery />
                </>
            )}
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
    </div>
  );
}
