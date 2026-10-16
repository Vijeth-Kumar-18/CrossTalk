import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { APP_CONFIG } from '@/constants/appConstants';

export const metadata: Metadata = {
  title: `${APP_CONFIG.NAME} - ${APP_CONFIG.BRAND_LINE}`,
  description: APP_CONFIG.SUBTITLE,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-[#f8fafc] text-slate-900 antialiased h-full">
      <body className="min-h-full flex flex-col bg-[#f8fafc] text-slate-900 font-sans">
        <AuthProvider>
          <Navbar />
          <div className="flex-1 flex flex-col">{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}
