import MeetingHeader from "@/components/MeetingHeader/MeetingHeader";
import "stream-chat-react/dist/css/v2/index.css";

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