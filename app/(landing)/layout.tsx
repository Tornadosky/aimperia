import AppHeader from "@/components/Header/Header";

export default function LandingLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div>
            <AppHeader />
            {children}
        </div>
    );
}