
'use client';

import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { CodeDisplay } from './code-display';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Lightbulb, Code as CodeIcon, Eye, ArrowLeft, Upload } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Button } from '../ui/button';
import { Wand2 } from 'lucide-react';
import type { Framework } from './main-layout';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { handlePublishComponent } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

interface ComponentPreviewProps {
  code: string;
  suggestions: string;
  isLoading: boolean;
  framework: Framework;
  prompt: string;
  onBack: () => void;
  onFrameworkChange: (framework: Framework) => void;
}

export function ComponentPreview({
  code,
  suggestions,
  isLoading,
  framework,
  prompt,
  onBack,
  onFrameworkChange,
}: ComponentPreviewProps) {
  const [isPublishing, setIsPublishing] = React.useState(false);
  const [componentName, setComponentName] = React.useState('');
  const [showPublishDialog, setShowPublishDialog] = React.useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();


  const handlePublish = async () => {
    if (!user) {
        toast({ title: 'Authentication required', description: 'You must be signed in to publish a component.', variant: 'destructive' });
        router.push('/login');
        return;
    }
    if (!componentName) {
      toast({
        title: 'Component name is required',
        variant: 'destructive',
      });
      return;
    }
    setIsPublishing(true);
    try {
      await handlePublishComponent({
        name: componentName,
        description: prompt, // Using prompt as description
        prompt: prompt,
        code: code,
        authorId: user.uid,
      });
      toast({
        title: 'Component published!',
        description: 'Your component is now available in the community gallery.',
      });
      setShowPublishDialog(false);
      onBack();
    } catch (error) {
      toast({
        title: 'Error publishing component',
        description: 'There was an error publishing the component. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsPublishing(false);
    }
  };


  const getIframeSrcDoc = () => {
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

  const iframeSrcDoc = getIframeSrcDoc();
  
  const renderContent = () => {
    if (isLoading && !code) {
      return (
         <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-4">
                <Wand2 className="h-12 w-12 animate-pulse text-primary" />
                <p className="text-muted-foreground">Generating component...</p>
            </div>
         </div>
      );
    }
  
    if (!code && !isLoading) {
      return (
        <div className="flex h-full items-center justify-center">
          <div className="text-center text-muted-foreground p-6">
             <Wand2 className="mx-auto h-12 w-12" />
            <p className="mt-4">
              Something went wrong. Please try again.
            </p>
             <Button onClick={onBack} variant="outline" className="mt-4">Go Back</Button>
          </div>
        </div>
      );
    }

    return (
        <Tabs defaultValue="preview" className="w-full h-full flex flex-col">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 pt-4 border-b">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <Button variant="ghost" size="icon" onClick={onBack}>
                  <ArrowLeft />
                </Button>
                <TabsList>
                    <TabsTrigger value="preview"><Eye className="h-4 w-4 md:mr-2" /><span className="hidden md:inline">Preview</span></TabsTrigger>
                    <TabsTrigger value="code"><CodeIcon className="h-4 w-4 md:mr-2" /><span className="hidden md:inline">Code</span></TabsTrigger>
                    <TabsTrigger value="suggestions"><Lightbulb className="h-4 w-4 md:mr-2" /><span className="hidden md:inline">Suggestions</span></TabsTrigger>
                </TabsList>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Tabs value={framework} onValueChange={(value) => onFrameworkChange(value as Framework)}>
                  <TabsList className="w-full">
                    <TabsTrigger value="react" className="flex-1">React</TabsTrigger>
                    <TabsTrigger value="vue" className="flex-1">Vue</TabsTrigger>
                    <TabsTrigger value="html" className="flex-1">HTML</TabsTrigger>
                  </TabsList>
                </Tabs>
                <Button onClick={() => setShowPublishDialog(true)} variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Publish
                </Button>
              </div>
            </div>
            <TabsContent value="preview" className="flex-1 bg-muted/20">
              {isLoading && (
                  <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
                      <div className="flex flex-col items-center gap-4">
                          <Wand2 className="h-12 w-12 animate-pulse text-primary" />
                          <p className="text-muted-foreground">Generating component...</p>
                      </div>
                  </div>
              )}
                <div className="relative w-full h-full rounded-md overflow-hidden">
                    <iframe
                        srcDoc={iframeSrcDoc}
                        title="Component Preview"
                        sandbox="allow-scripts allow-same-origin"
                        className="w-full h-full"
                        />
                </div>
            </TabsContent>
            <TabsContent value="code" className="flex-1 overflow-y-auto p-4">
                <CodeDisplay code={code} framework={framework} />
            </TabsContent>
            <TabsContent value="suggestions" className="p-4">
                <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertTitle>Layout Suggestions</AlertTitle>
                <AlertDescription className="whitespace-pre-wrap">
                    {suggestions || "No suggestions available."}
                </AlertDescription>
                </Alert>
            </TabsContent>
        </Tabs>
    );
  }

  return (
    <div className="h-full">
      {renderContent()}
      <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publish to Community</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={componentName}
                onChange={(e) => setComponentName(e.target.value)}
                className="col-span-3"
                placeholder="E.g. 'Cool Button'"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowPublishDialog(false)}>Cancel</Button>
            <Button onClick={handlePublish} disabled={isPublishing}>
              {isPublishing ? 'Publishing...' : 'Publish'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
