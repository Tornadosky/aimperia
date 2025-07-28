import MeetingHeader from "@/components/MeetingHeader/MeetingHeader";

export default function HomeLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div style={{
            height: '100vh',
        }}>
            {/* <MeetingHeader /> */}
            {children}
        </div>
    );
}