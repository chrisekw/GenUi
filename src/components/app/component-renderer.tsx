
'use client';

import * as React from 'react';

interface ComponentRendererProps {
  code?: string;
  framework?: 'html' | 'tailwindcss';
  html?: string;
}

export function ComponentRenderer({ code, framework, html }: ComponentRendererProps) {
  const getIframeSrcDoc = () => {
    if (html) return html;
    if (!code || !framework) return '';

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
      html, body {
        height: 100%;
        margin: 0;
        padding: 0;
        overflow: auto;
      }
      body { 
        background-color: hsl(var(--background));
        color: hsl(var(--foreground));
        font-family: Inter, sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100%;
        box-sizing: border-box;
      }
    `;
    
    // HTML or Tailwind CSS
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>${baseStyles}</style>
        </head>
        <body class="bg-background text-foreground">
          <div style="padding: 1rem;">${code}</div>
        </body>
      </html>
    `;
  };

  const iframeSrcDoc = getIframeSrcDoc();

  return (
    <div className="relative w-full h-full rounded-md overflow-hidden bg-transparent">
        <iframe
            key={iframeSrcDoc}
            srcDoc={iframeSrcDoc}
            title="Component Preview"
            sandbox="allow-scripts allow-same-origin"
            className="w-full h-full bg-transparent"
        />
    </div>
  );
}
