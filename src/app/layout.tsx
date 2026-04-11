import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { GoogleAnalytics } from '@next/third-parties/google';
import './globals.css';
import Creature from '@/components/Creature';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: "yukyu's diary - DecoBoco Digital",
  description: "yukyu's thoughts and digital archive",
  authors: [{ name: 'yukyu' }],
  alternates: {
    types: {
      'application/rss+xml': '/rss.xml',
    },
  },
  openGraph: {
    title: "yukyu's diary - DecoBoco Digital",
    description: "yukyu's thoughts and digital archive",
    type: 'website',
    locale: 'ja_JP',
    siteName: 'DecoBoco Digital',
    images: [
      {
        url: `https://yukyu-site-og.vercel.app/api/og?title=${encodeURIComponent(
          "yukyu's diary - DecoBoco Digital"
        )}`,
        width: 1200,
        height: 630,
        alt: "yukyu's diary - DecoBoco Digital",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "yukyu's diary - DecoBoco Digital",
    description: "yukyu's thoughts and digital archive",
    images: [
      `https://yukyu-site-og.vercel.app/api/og?title=${encodeURIComponent(
        "yukyu's diary - DecoBoco Digital"
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
