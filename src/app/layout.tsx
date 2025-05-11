import { Outfit } from 'next/font/google';
import './globals.css';

import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import ClientOnly from '@/components/common/ClientOnly';
import { QueryProvider } from './providers/QueryProvider';
import ToasterProvider from './providers/ToasterProvider';
import { UserProvider } from '@/context/UserContext';
import { getCurrentUser } from '@/lib/actions/currentUser';
import { HeroProvider } from './providers/HeroProvider';

const outfit = Outfit({
  subsets: ["latin"],
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser({ withFullUser: true, redirectIfNotFound: false });
  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ThemeProvider>
          <ClientOnly>
            <QueryProvider>
              <ToasterProvider />
              <UserProvider user={user}>
                <SidebarProvider>
                  <HeroProvider> {/* Add this provider */}
                    {children}
                  </HeroProvider>
                </SidebarProvider>
              </UserProvider>
            </QueryProvider>
          </ClientOnly>
        </ThemeProvider>
      </body>
    </html>
  );
}