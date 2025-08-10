
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { getGalleryItems, handleGenerateComponent, handleCloneUrl } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { type GalleryItem } from '@/lib/gallery-items';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowUp,
  Image as ImageIcon,
  ChevronRight,
  CodeXml,
  Layout,
  Link as LinkIcon,
  Eye,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { Textarea } from '../ui/textarea';
import { ComponentPreview } from './component-preview';
import Link from 'next/link';
import { Header } from './header';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useAuth } from '@/hooks/use-auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sidebar } from './sidebar';

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
  framework: Framework;
  galleryItems: GalleryItem[];
  imageUrl: string | null;
  setImageUrl: (url: string | null) => void;
}

function PromptView({ prompt, setPrompt, onGenerate, onClone, isLoading, framework, galleryItems, imageUrl, setImageUrl }: PromptViewProps) {
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
    onClone(cloneUrl, framework);
    setShowCloneDialog(false);
  }

  const getIframeSrcDoc = (code: string) => {
    const baseStyles = `
      :root {
        --background: 0 0% 100%;
        --foreground: 240 10% 3.9%;
        --card: 0 0% 100%;
        --card-foreground: 240 10% 3.9%;
        --popover: 0 0% 100%;
        --popover-foreground: 240 10% 3.9%;
        --primary: 240 5.9% 10%;
        --primary-foreground: 0 0% 98%;
        --secondary: 240 4.8% 95.9%;
        --secondary-foreground: 240 5.9% 10%;
        --muted: 240 4.8% 95.9%;
        --muted-foreground: 240 3.8% 46.1%;
        --accent: 240 4.8% 95.9%;
        --accent-foreground: 240 5.9% 10%;
        --destructive: 0 84.2% 60.2%;
        --destructive-foreground: 0 0% 98%;
        --border: 240 5.9% 90%;
        --input: 240 5.9% 90%;
        --ring: 240 5.9% 10%;
        --radius: 0.5rem;
      }
      .dark {
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
        background-color: transparent;
        color: hsl(var(--foreground));
        font-family: Inter, sans-serif;
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

    const cleanedCode = code
        .replace(/^import\\s.*?;/gm, '')
        .replace(/export\\s+default\\s+\\w+;?/m, '')
        .replace(/export\\s+(const|function)\\s+(\\w+)/, 'const $2 = ');
    const componentName = code.match(/export\\s+default\\s+function\\s+([A-Z]\\w*)/)?.[1] || code.match(/export\\s+(?:const|function)\\s+([A-Z]\\w*)/)?.[1] || 'Component';

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
            ${cleanedCode}
            const ComponentToRender = ${componentName};
            ReactDOM.render(<ComponentToRender />, document.getElementById('root'));
          </script>
        </body>
      </html>
    `;
  };

  return (
    <>
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
                    <Button size="icon" onClick={() => onGenerate(prompt, framework, imageUrl || undefined)} disabled={isLoading}>
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
        <div className="w-full max-w-7xl mx-auto mt-16">
            <div className="flex items-center justify-between mb-4">
            <div>
                <h2 className="text-2xl font-medium tracking-tight">From the Community</h2>
                <p className="text-muted-foreground">Explore what the community is building.</p>
            </div>
            <Button variant="ghost" asChild>
                <Link href="/community">
                    Browse All <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
            </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryItems.map((item) => (
                <Card
                key={item.id}
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
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform border-0"
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

  React.useEffect(() => {
    const promptFromUrl = searchParams.get('prompt');
    if (promptFromUrl) {
      const decodedPrompt = decodeURIComponent(promptFromUrl);
      setPrompt(decodedPrompt);
      onGenerate(decodedPrompt, 'react');
    }
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
            {activeView === 'prompt' && <PromptView 
                prompt={prompt}
                setPrompt={setPrompt}
                onGenerate={onGenerate}
                onClone={onClone}
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
    </div>
  );
}
