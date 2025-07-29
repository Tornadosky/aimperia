import AuthHeader from "@/components/AuthHeader/AuthHeader";
import AppFooter from "@/components/Footer/Footer";

export default function SignUpLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
            }}>
            <AuthHeader />
            {children}
            <AppFooter />
        </div>
    );
}