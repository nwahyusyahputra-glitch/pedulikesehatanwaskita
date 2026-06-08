import React from 'react';
import { Inter, Montserrat } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
});

export const metadata = {
  title: 'Waskita Digital Balance – Refresh. Refocus. Deliver.',
  description: 'Platform Kesehatan Kerja Digital Internal untuk Mencegah Kelelahan Kerja Subjektif (Metode KAUPK2 Tipe I) dan Kelelahan Mata.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body className={`${inter.className} ${montserrat.variable}`}>
        {children}
      </body>
    </html>
  );
}
