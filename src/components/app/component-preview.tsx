
'use client';

import * as React from 'react';
import { CodeDisplay } from './code-display';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Lightbulb, Code as CodeIcon, Eye, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Button } from '../ui/button';
import { Wand2 } from 'lucide-react';
import type { Framework } from './main-layout';

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

  const getIframeSrcDoc = () => {
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

    if (framework === 'react') {
        const cleanedCode = code
            .replace(/^import\s.*?;/gm, '')
            .replace(/export\s+default\s+\w+;?/m, '')
            .replace(/export\s+(const|function)\s+(\w+)/, 'const $2 = ');
        const componentNameMatch = code.match(/export\s+(?:default\s+)?(?:function|const)\s+([A-Z]\w*)/);
        const componentName = componentNameMatch ? componentNameMatch[1] : 'Component';

      return `
        <!DOCTYPE html>
        <html>
          <head>
            <script src="https://cdn.tailwindcss.com"></script>
            <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
            <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
            <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
            <style>
            ${baseStyles}
            </style>
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
                    <TabsTrigger value="html" className="flex-1">HTML</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
            <TabsContent value="preview" className="flex-1 bg-muted/20 relative">
              {isLoading && (
                  <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
                      <div className="flex flex-col items-center gap-4">
                          <Wand2 className="h-12 w-12 animate-pulse text-primary" />
                          <p className="text-muted-foreground">Generating component...</p>
                      </div>
                  </div>
              )}
                <div className="relative w-full h-full rounded-md overflow-hidden bg-transparent">
                    <iframe
                        srcDoc={iframeSrcDoc}
                        title="Component Preview"
                        sandbox="allow-scripts allow-same-origin"
                        className="w-full h-full bg-transparent"
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
    </div>
  )
}
