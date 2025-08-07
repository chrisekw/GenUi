'use client';

import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { CodeDisplay } from './code-display';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Lightbulb, Code as CodeIcon, Eye, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Button } from '../ui/button';
import { Wand2 } from 'lucide-react';

interface ComponentPreviewProps {
  code: string;
  suggestions: string;
  isLoading: boolean;
  framework: 'react' | 'vue' | 'html';
  onBack: () => void;
}

export function ComponentPreview({
  code,
  suggestions,
  isLoading,
  framework,
  onBack,
}: ComponentPreviewProps) {
  const iframeSrcDoc = `
    <!DOCTYPE html>
    <html>
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
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
            }
        </style>
      </head>
      <body class="dark">
        <div class="flex items-center justify-center w-full h-full min-h-screen p-4">
          ${code}
        </div>
      </body>
    </html>
  `;

  const renderContent = () => {
    if (isLoading) {
      return (
         <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-4">
                <Wand2 className="h-12 w-12 animate-pulse text-primary" />
                <p className="text-muted-foreground">Generating component...</p>
            </div>
         </div>
      );
    }
  
    if (!code) {
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
            <div className="flex items-center gap-4 px-4 pt-4 border-b">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft />
              </Button>
              <TabsList>
                  <TabsTrigger value="preview"><Eye className="mr-2 h-4 w-4" />Preview</TabsTrigger>
                  <TabsTrigger value="code"><CodeIcon className="mr-2 h-4 w-4" />Code</TabsTrigger>
                  <TabsTrigger value="suggestions"><Lightbulb className="mr-2 h-4 w-4" />Suggestions</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="preview" className="flex-1 bg-muted/20">
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

  return <div className="h-full">{renderContent()}</div>
}
