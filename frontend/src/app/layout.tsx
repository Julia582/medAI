import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/layout/providers';

export const metadata: Metadata = {
  title: 'MedAI - AI Medical Assistant',
  description: 'Upload medical documents, chat with AI, and get patient-friendly explanations.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-white dark:bg-gray-950 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
