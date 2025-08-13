"use client";

import React, { useEffect, useState } from "react";
import { StreamChat, type Channel as StreamChannel } from "stream-chat";
import {
	Chat,
	Channel as ChannelUI,
	Window,
	ChannelHeader,
	MessageList,
	MessageInput,
	Thread,
} from "stream-chat-react";
import styles from "./StreamChatPanel.module.css";

type Props = {
	lessonId: string;
	showInput?: boolean;
};

export default function StreamChatPanel({ lessonId, showInput }: Props) {
    const enabled = (() => {
        const v = (process.env.NEXT_PUBLIC_ENABLE_STREAM_CHAT || '').trim().toLowerCase();
        return v === 'true' || v === '1' || v === 'yes' || v === 'on';
    })();
	const apiKey = process.env.NEXT_PUBLIC_STREAM_KEY || "";

	const [client, setClient] = useState<StreamChat | null>(null);
	const [channel, setChannel] = useState<StreamChannel | null>(null);
	const [ready, setReady] = useState(false);
	const [userId, setUserId] = useState<string | null>(null);

	const DisabledInput: React.FC = () => null;
	const allowInput = (() => {
		const v = (process.env.NEXT_PUBLIC_STREAM_CHAT_ALLOW_INPUT || '').trim().toLowerCase();
		const fromEnv = v === 'true' || v === '1' || v === 'yes' || v === 'on';
		return typeof showInput === 'boolean' ? showInput : fromEnv;
	})();


	useEffect(() => {
		if (!enabled || !apiKey) return;
		const c = StreamChat.getInstance(apiKey);
		let isMounted = true;

		(async () => {
			try {
				let id: string | null = null;
				try {
					id = window.sessionStorage.getItem("stream_demo_user_id");
				} catch { /* no-op */ }
				if (!id) {
					id = `demo_${Math.random().toString(36).slice(2)}`;
					try {
						window.sessionStorage.setItem("stream_demo_user_id", id);
					} catch { /* no-op */ }
				}
				// Preferred: request server token + ensure channel membership
				try {
					const res = await fetch('/api/stream/token', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ userId: id, lessonId })
					});
					if (res.ok) {
						const data = await res.json();
						if (data?.token) {
							await c.connectUser({ id, name: 'Guest' }, data.token);
							if (!isMounted) return;
							setUserId(id);
							setClient(c);
							return;
						}
					}
				} catch { /* fall through to client-only fallbacks */ }

				// Try dev-token user (works in dev-mode projects)
				try {
					await c.connectUser({ id, name: "Guest" }, c.devToken(id));
					if (!isMounted) return;
					setUserId(id);
					setClient(c);
					return;
				} catch {
					// Fallback to guest user (no backend)
					await c.setGuestUser({ id, name: "Guest" } as any);
					if (!isMounted) return;
					setUserId(id);
					setClient(c);
					return;
				}
			} catch (_e) {
				// As a last resort, anonymous connect to render UI
				try {
					await c.connectAnonymousUser();
					if (!isMounted) return;
					setClient(c);
				} catch { /* ignore */ }
			}
		})();

		return () => {
			isMounted = false;
			c.disconnectUser().catch(() => undefined);
		};
	}, [enabled, apiKey]);


	useEffect(() => {
		if (!client) return;
		let isMounted = true;
		(async () => {
			const channelId = `lesson_${lessonId}`;
			try {
				const ch = client.channel("messaging", channelId);
				await ch.watch({ presence: false });
				if (!isMounted) return;
				setChannel(ch);
				setReady(true);
				return;
			} catch { /* fallthrough */ }

			// Fallback: any livestream channel
			try {
				const res = await client.queryChannels(
					{ type: "livestream" },
					{ last_message_at: -1 },
					{ watch: true, state: true, presence: false }
				);
				if (res && res.length > 0) {
					if (!isMounted) return;
					setChannel(res[0]);
					setReady(true);
					return;
				}
			} catch { /* ignore */ }

			if (!isMounted) return;
			setReady(true);
		})();
		return () => {
			isMounted = false;
		};
	}, [client, lessonId, userId]);

	if (!enabled || !apiKey) return null;
    if (!client || !channel || !ready) {
        return (
            <div className={styles.placeholder}>
                <div className={styles.skeletonHeader}>Chat</div>
                <div className={styles.skeletonBody}>
                    <div className={styles.bubble} />
                    <div className={styles.bubbleAlt + ' ' + styles.bubble} />
                    <div className={styles.bubble} />
                    <div className={styles.bubbleAlt + ' ' + styles.bubble} />
                </div>
            </div>
        );
    }

	return (
		<div className={styles.wrapper}>
			<Chat client={client} theme="str-chat__theme-light">
				<ChannelUI channel={channel}>
					<Window>
						<ChannelHeader />
					<MessageList />
					{allowInput ? <MessageInput focus /> : null}
					</Window>
					<Thread Input={allowInput ? undefined : (DisabledInput as any)} />
				</ChannelUI>
			</Chat>
		</div>
	);
}



