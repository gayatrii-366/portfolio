import type { Metadata } from 'next';
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ui/theme-provider';

import { ScrollProgress } from '@/components/ui/scroll-progress';
import { CustomCursor } from '@/components/ui/custom-cursor';

const inter = Inter({ variable: '--font-inter', subsets: ['latin'] });
const spaceGrotesk = Space_Grotesk({ variable: '--font-space-grotesk', subsets: ['latin'] });
const jetbrainsMono = JetBrains_Mono({ variable: '--font-jetbrains-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Gayatri Swami | AI Developer',
  description: 'AI Developer with a passion for building practical and scalable intelligent systems.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased`}>
        <ThemeProvider>
          <ScrollProgress />
          <CustomCursor />

          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
