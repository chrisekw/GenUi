'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CodeDisplay } from './code-display';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Lightbulb, Code as CodeIcon, Eye, Wand2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

interface ComponentPreviewProps {
  code: string;
  suggestions: string;
  isLoading: boolean;
  framework: 'react' | 'vue' | 'html';
}

export function ComponentPreview({
  code,
  suggestions,
  isLoading,
  framework,
}: ComponentPreviewProps) {
  const iframeSrcDoc = `
    <!DOCTYPE html>
    <html>
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <script>
          tailwind.config = {
            darkMode: 'class',
             theme: {
              extend: {
                 colors: {
                    background: 'hsl(var(--background))',
                    foreground: 'hsl(var(--foreground))',
                    card: {
                      DEFAULT: 'hsl(var(--card))',
                      foreground: 'hsl(var(--card-foreground))',
                    },
                    popover: {
                      DEFAULT: 'hsl(var(--popover))',
                      foreground: 'hsl(var(--popover-foreground))',
                    },
                    primary: {
                      DEFAULT: 'hsl(var(--primary))',
                      foreground: 'hsl(var(--primary-foreground))',
                    },
                    secondary: {
                      DEFAULT: 'hsl(var(--secondary))',
                      foreground: 'hsl(var(--secondary-foreground))',
                    },
                    muted: {
                      DEFAULT: 'hsl(var(--muted))',
                      foreground: 'hsl(var(--muted-foreground))',
                    },
                    accent: {
                      DEFAULT: 'hsl(var(--accent))',
                      foreground: 'hsl(var(--accent-foreground))',
                    },
                    destructive: {
                      DEFAULT: 'hsl(var(--destructive))',
                      foreground: 'hsl(var(--destructive-foreground))',
                    },
                    border: 'hsl(var(--border))',
                    input: 'hsl(var(--input))',
                    ring: 'hsl(var(--ring))',
                }
              }
            }
          }
          // Function to apply theme based on parent window
          function applyTheme() {
            if (window.parent.document.documentElement.classList.contains('dark')) {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          }
          
          // Apply theme on initial load
          applyTheme();

          // Observe parent for theme changes
          const observer = new MutationObserver(applyTheme);
          observer.observe(window.parent.document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
          });

        </script>
        <style>
            :root {
                --background: 0 0% 100%;
                --foreground: 220 9% 10%;
                --card: 0 0% 100%;
                --card-foreground: 220 9% 10%;
                --popover: 0 0% 100%;
                --popover-foreground: 220 9% 10%;
                --primary: 197 76% 53%;
                --primary-foreground: 0 0% 100%;
                --secondary: 220 13% 91%;
                --secondary-foreground: 220 9% 10%;
                --muted: 220 13% 88%;
                --muted-foreground: 220 9% 45%;
                --accent: 33 100% 50%;
                --accent-foreground: 0 0% 100%;
                --destructive: 0 84.2% 60.2%;
                --destructive-foreground: 0 0% 98%;
                --border: 220 13% 85%;
                --input: 220 13% 89%;
                --ring: 197 76% 53%;
            }
            .dark {
                --background: 220 10% 10%;
                --foreground: 0 0% 98%;
                --card: 220 10% 10%;
                --card-foreground: 0 0% 98%;
                --popover: 220 10% 10%;
                --popover-foreground: 0 0% 98%;
                --primary: 197 76% 63%;
                --primary-foreground: 220 9% 10%;
                --secondary: 220 10% 15%;
                --secondary-foreground: 0 0% 98%;
                --muted: 220 10% 15%;
                --muted-foreground: 0 0% 63.9%;
                --accent: 33 100% 60%;
                --accent-foreground: 220 9% 10%;
                --destructive: 0 62.8% 30.6%;
                --destructive-foreground: 0 0% 98%;
                --border: 220 10% 20%;
                --input: 220 10% 20%;
                --ring: 197 76% 63%;
            }
            body { 
              background-color: hsl(var(--background));
              color: hsl(var(--foreground));
              font-family: Inter, sans-serif;
            }
        </style>
      </head>
      <body>
        <div class="flex items-center justify-center w-full h-full min-h-screen p-4">
          ${code}
        </div>
      </body>
    </html>
  `;

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <Skeleton className="h-6 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!code) {
    return (
      <Card className="flex h-full items-center justify-center">
        <CardContent className="text-center text-muted-foreground p-6">
          <Wand2 className="mx-auto h-12 w-12" />
          <p className="mt-4">
            Your generated component will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Result</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="preview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="preview"><Eye className="mr-2" />Preview</TabsTrigger>
            <TabsTrigger value="code"><CodeIcon className="mr-2" />Code</TabsTrigger>
            <TabsTrigger value="suggestions"><Lightbulb className="mr-2" />Suggestions</TabsTrigger>
          </TabsList>
          <TabsContent value="preview" className="mt-4">
             <div className="relative w-full aspect-video rounded-md border bg-card overflow-hidden">
                <iframe
                    srcDoc={iframeSrcDoc}
                    title="Component Preview"
                    sandbox="allow-scripts allow-same-origin"
                    className="w-full h-full"
                    />
             </div>
          </TabsContent>
          <TabsContent value="code" className="mt-4">
            <CodeDisplay code={code} framework={framework} />
          </TabsContent>
          <TabsContent value="suggestions" className="mt-4">
            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertTitle>Layout Suggestions</AlertTitle>
              <AlertDescription className="whitespace-pre-wrap">
                {suggestions || "No suggestions available."}
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
