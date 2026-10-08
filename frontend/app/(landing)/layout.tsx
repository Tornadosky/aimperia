import AppHeader from "@/components/Header/Header";
import AppFooter from "@/components/Footer/Footer";

export default function LandingLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div>
            <AppHeader />
            {children}
            <AppFooter />
        </div>
    );
}