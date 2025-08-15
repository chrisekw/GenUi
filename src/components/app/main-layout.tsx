
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { handleGenerateComponent, handleCloneUrl, handleEnhancePrompt } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowUp,
  Image as ImageIcon,
  CodeXml,
  Sparkles,
  Link as LinkIcon,
  X,
  Wand2
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
import { Footer } from './footer';

export type Framework = 'html' | 'tailwindcss';

const samplePrompts = [
    "A sleek, futuristic dashboard UI with a dark theme. It should have a sidebar navigation with glowing icons, a main content area with several data visualization widgets (like line charts and donut charts), and a header with a search bar and user profile dropdown. Use a color palette of dark blues, purples, and electric pink for accents.",
    "A minimalist e-commerce product page for a high-end watch. The design should be clean and luxurious, with a large product image on the left and product details (name, price, description) on the right. Include a 'Add to Cart' button with a subtle hover animation. Use a monochrome color scheme with a gold accent color. The font should be a classic serif.",
    "A vibrant and friendly sign-up form for a mobile app. The form should have a playful illustration at the top, fields for username, email, and password, and a prominent 'Create Account' button. Use rounded corners for all elements and a bright color palette (e.g., coral, teal, and yellow).",
    "A professional pricing table for a SaaS product. It should feature three tiers (e.g., Basic, Pro, Enterprise), with a clear list of features for each. The 'Pro' plan should be highlighted as the most popular choice. Use subtle gradients and drop shadows to give the table some depth. Include toggle for monthly/annual pricing.",
    "A modern, image-centric blog layout. The design should feature a grid of cards, where each card represents a blog post and displays a large featured image, the post title, author, and a short excerpt. The layout should be responsive and collapse into a single column on mobile devices.",
    "An interactive testimonial slider with a clean, modern design. Each slide should feature a customer's photo, their testimonial, name, and company. Include previous/next buttons and dot navigation. The transition between slides should be a smooth fade and slide effect.",
    "A sophisticated hero section for a portfolio website. It should have a full-screen background video that plays on a loop, with a headline, a sub-headline, and a call-to-action button overlaid on top. The text should be white with a subtle text shadow to ensure readability.",
    "A clean and organized settings page with a sidebar menu for different sections (e.g., Profile, Notifications, Billing). The main content area should display the corresponding settings form. Use toggle switches for boolean settings and clean input fields and buttons. The overall design should be simple and intuitive."
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
  const [isEnhancing, setIsEnhancing] = React.useState(false);
  const { toast } = useToast();
  
  const suggestionButtons = [
    { icon: Sparkles, text: 'Animate', prompt: 'Please add a subtle entrance animation (fade-in and slide-up), a hover effect (lift and grow), and a pressed state (scale down). Ensure it is performant and respects reduced motion.' },
    { icon: CodeXml, text: 'Random', prompt: '' },
    { icon: ImageIcon, text: 'Image', prompt: 'A component that looks like the image provided.' },
    { icon: LinkIcon, text: 'Clone URL', prompt: '' },
  ];

  const handleSuggestionClick = (item: { text: string, prompt: string}) => {
    if (item.text === 'Clone URL') {
        setShowCloneDialog(true);
        return;
    }
    
    if (item.text === 'Random') {
        const randomIndex = Math.floor(Math.random() * samplePrompts.length);
        setPrompt(samplePrompts[randomIndex]);
        return;
    }

    if (item.text === 'Animate') {
        if (!prompt.trim()) {
            toast({ title: 'Please enter a prompt first', description: 'The animate feature adds to your existing prompt.', variant: 'destructive'});
            return;
        }
        setPrompt(prev => `${prev.trim()}. ${item.prompt}`);
        toast({ title: 'Animation added to prompt!'});
        return;
    }

    const newPrompt = item.prompt;
    setPrompt(newPrompt);

    if (item.text === 'Image') {
        handleUploadClick();
    }
  }

  const enhancePromptAction = async () => {
    if (!prompt.trim()) {
        toast({ title: 'Please enter a prompt to enhance.', variant: 'destructive'});
        return;
    }
    setIsEnhancing(true);
    try {
        const result = await handleEnhancePrompt(prompt);
        setPrompt(result.enhancedPrompt);
        toast({ title: 'Prompt enhanced!', description: 'Your prompt has been upgraded.' });
    } catch(e: any) {
        toast({ title: 'Failed to enhance prompt', description: e.message || 'An unknown error occurred.', variant: 'destructive'});
    } finally {
        setIsEnhancing(false);
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
    onClone(cloneUrl, 'html');
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
                    className="bg-background border rounded-lg p-4 pr-28 h-36 text-base focus-visible:ring-1 focus-visible:ring-ring"
                />
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                    />
                    <Button size="icon" variant="ghost" onClick={enhancePromptAction} disabled={isLoading || isEnhancing} title="Enhance Prompt">
                        <Wand2 />
                    </Button>
                    <Button size="icon" onClick={() => onGenerate(prompt, 'html', imageUrl || undefined)} disabled={isLoading || isEnhancing}>
                        <ArrowUp />
                    </Button>
                </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 items-center justify-center gap-2">
            {suggestionButtons.map((item, index) => (
                <Button key={index} variant="outline" className="rounded-lg h-auto" onClick={() => handleSuggestionClick(item)}>
                  <item.icon className="h-4 w-4 mr-2" />
                  <span>{item.text}</span>
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

  const [framework, setFramework] = React.useState<Framework>('html');
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
      onGenerate(decodedPrompt, 'html');
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
      const result = await handleGenerateComponent({ prompt: currentPrompt, framework: currentFramework, imageUrl: currentImageUrl }, user.uid);
      setGeneratedCode(result.code);
      setLayoutSuggestions(result.suggestions);
      setFramework(currentFramework);
      setPrompt(currentPrompt);
      if (currentImageUrl) {
        setImageUrl(currentImageUrl);
      }
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Error generating component',
        description: error.message || 'There was an error generating the component. Please try again.',
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
      const result = await handleCloneUrl({ url, framework: currentFramework }, user.uid);
      setGeneratedCode(result.code);
      setLayoutSuggestions(''); // No suggestions for cloned components for now
      setFramework(currentFramework);
      setPrompt(`A component cloned from ${url}`);
      setImageUrl(null);
    } catch (error: any) {
        console.error(error);
        toast({
            title: 'Error cloning URL',
            description: error.message || 'There was an error cloning the URL. Please try again.',
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
      <div className="flex flex-col">
        <Header />
        <main className="flex flex-1 flex-col bg-muted/40">
            {activeView === 'prompt' && (
                <div className="flex-1 flex flex-col">
                    <div className="flex-1 overflow-y-auto">
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
                    </div>
                    <Footer />
                </div>
            )}
            {activeView === 'preview' && (
            <div className="h-[calc(100vh-60px)]">
                <ComponentPreview
                    code={generatedCode}
                    suggestions={layoutSuggestions}
                    isLoading={isLoading}
                    framework={framework}
                    prompt={prompt}
                    onBack={handleBackToPrompt}
                    onFrameworkChange={handleFrameworkChange}
                />
            </div>
            )}
        </main>
      </div>
    </div>
  );
}
