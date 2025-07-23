import AuthHeader from "@/components/AuthHeader/AuthHeader";

export default function SignUpLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div>
            <AuthHeader />
            {children}
        </div>
    );
}