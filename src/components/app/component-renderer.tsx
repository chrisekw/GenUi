
'use client';

import * as React from 'react';

interface ComponentRendererProps {
  code?: string;
  framework?: 'react' | 'html';
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
            .replace(/^import\\s.*?;/gm, '')
            .replace(/export\\s+default\\s+\\w+;?/m, '')
            .replace(/export\\s+(const|function)\\s+(\\w+)/, 'const $2 = ');
        const componentNameMatch = code.match(/export\\s+(?:default\\s+)?(?:function|const)\\s+([A-Z]\\w*)/);
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

  return (
    <div className="relative w-full h-full rounded-md overflow-hidden bg-transparent">
        <iframe
            srcDoc={iframeSrcDoc}
            title="Component Preview"
            sandbox="allow-same-origin"
            className="w-full h-full bg-transparent"
        />
    </div>
  );
}
