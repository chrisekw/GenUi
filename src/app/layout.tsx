
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Providers } from './providers';

const BASE_URL = 'https://genoui.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: 'GenoUI: AI Component Generator & UI Builder',
  description: 'Generate production-ready UI components from natural language or an image with AI. Build, preview, and publish beautiful Tailwind CSS and HTML components.',
  keywords: [
    'AI component generator',
    'UI builder',
    'Tailwind CSS',
    'Next.js',
    'React components',
    'generative UI',
    'AI web design',
    'HTML generator',
    'AI coding assistant',
    'frontend development tools',
    'no-code UI builder',
    'low-code development',
    'Tailwind UI generator',
    'React component generator',
    'HTML and CSS generator',
    'AI-powered development',
    'web application builder',
    'user interface design AI',
    'build UI with AI',
    'component library generator',
    'AI front-end developer',
    'website builder with AI',
    'AI for UI/UX design',
    'generative design',
    'code generation AI',
    'AI app builder',
    'Next.js starter AI',
    'React AI tools',
    'Tailwind CSS AI',
    'AI HTML code generator'
  ],
  authors: [{ name: 'GenoUI Team' }],
  creator: 'GenoUI',
  publisher: 'GenoUI',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'GenoUI: AI Component Generator & UI Builder',
    description: 'Instantly generate production-ready UI components with AI.',
    url: BASE_URL,
    siteName: 'GenoUI',
    images: [
      {
        url: `${BASE_URL}/og-image.png`, // It's recommended to create an OG image
        width: 1200,
        height: 630,
        alt: 'GenoUI App Interface',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GenoUI: AI Component Generator & UI Builder',
    description: 'Generate production-ready UI components from natural language or an image with AI.',
    // images: [`${BASE_URL}/og-image.png`], // Add twitter image
  },
  verification: {
    google: '9ifqbutJRLZ3_J8Er3nA_aD1UjORyyYD3Rdwkckkoho',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
