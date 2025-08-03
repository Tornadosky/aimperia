import type { Metadata } from "next";
import { AuthProvider } from "./context/AuthContext";
import {NextIntlClientProvider} from 'next-intl';
import {getLocale} from 'next-intl/server';
import "./globals.css";

export const metadata: Metadata = {
    title: "AImperia",
    description: "",
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const locale = await getLocale();
    
    return (
        <html lang={locale}>
            <body
                // className={`${geistSans.variable} ${geistMono.variable}`}
            >   
                <NextIntlClientProvider>
                    <AuthProvider>
                        <div
                        style={{
                            minHeight: "100vh",
                            display: "flex",
                            flexDirection: "column",
                        }}>
                            <main style={{ flex: 1 }}>{children}</main>
                        </div>
                    </AuthProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
