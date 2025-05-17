// src/app/layout.tsx

import { Outfit } from 'next/font/google';
import './globals.css';

import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import ClientOnly from '@/components/common/ClientOnly';
import { QueryProvider } from './providers/QueryProvider';
import ToasterProvider from './providers/ToasterProvider';
import HydrateZustand from '@/components/HydrateZustand'; // Add this import

const outfit = Outfit({
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ThemeProvider>
          <ClientOnly>
            <QueryProvider>
              <ToasterProvider />
              <HydrateZustand /> {/* Add this line */}
              <SidebarProvider>
                {children}
              </SidebarProvider>
            </QueryProvider>
          </ClientOnly>
        </ThemeProvider>
      </body>
    </html>
  );
}