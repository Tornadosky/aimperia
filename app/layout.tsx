// app/layout.tsx  (server component – keep as server)
import type { Metadata } from 'next';
import { AuthProvider } from './context/AuthContext';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import AntdRegistry from './AntdRegistry';
import Providers from './providers';     // ← the new client wrapper
import './globals.css';

export const metadata: Metadata = {
  title: 'AImperia',
  description: '',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale   = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <AntdRegistry>
          <Providers> {/* ★ runs on the client, but you can nest it here */}
            <NextIntlClientProvider locale={locale} messages={messages}>
              <AuthProvider>
                <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                  <main style={{ flex: 1 }}>{children}</main>
                </div>
              </AuthProvider>
            </NextIntlClientProvider>
          </Providers>
        </AntdRegistry>
      </body>
    </html>
  );
}
