import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { GoogleAnalytics } from '@next/third-parties/google';
import './globals.css';
import Creature from '@/components/Creature';
import siteConfig from '@/config/site.json';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: siteConfig.name,
  description: "yukyu's thoughts and digital archive",
  authors: [{ name: 'yukyu' }],
  alternates: {
    types: {
      'application/rss+xml': '/rss.xml',
    },
  },
  openGraph: {
    title: siteConfig.name,
    description: "yukyu's thoughts and digital archive",
    type: 'website',
    locale: 'ja_JP',
    siteName: siteConfig.name,
    images: [
      {
        url: `https://yukyu-site-og.vercel.app/api/og?title=${encodeURIComponent(
          siteConfig.name
        )}`,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: "yukyu's thoughts and digital archive",
    images: [
      `https://yukyu-site-og.vercel.app/api/og?title=${encodeURIComponent(
        siteConfig.name
      )}`,
    ],
  },
  other: {
    'theme-color': '#000',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-green-400`}
      >
        <Creature />
        {children}
      </body>
      {gaId && <GoogleAnalytics gaId={gaId} />}
    </html>
  );
}
