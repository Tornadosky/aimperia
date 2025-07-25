import MeetingHeader from "@/components/MeetingHeader/MeetingHeader";

export default function HomeLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div>
            <MeetingHeader />
            {children}
        </div>
    );
}