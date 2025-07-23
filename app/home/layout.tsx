import HomeHeader from "@/components/HomeHeader/HomeHeader";

export default function HomeLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div>
            <HomeHeader />
            {children}
        </div>
    );
}