import type { NextApiRequest, NextApiResponse } from 'next';
import { StreamChat } from 'stream-chat';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
	try {
		const { userId, lessonId } = req.body || {};
		if (!userId) return res.status(400).json({ error: 'Missing userId' });
		const apiKey = process.env.NEXT_PUBLIC_STREAM_KEY as string | undefined;
		const apiSecret = process.env.STREAM_SECRET_KEY as string | undefined;
		if (!apiKey || !apiSecret) return res.status(500).json({ error: 'Server not configured' });

		const serverClient = StreamChat.getInstance(apiKey, apiSecret);
		const token = serverClient.createToken(userId);

		// Ensure messaging channel exists and user is a member
		const channelId = `lesson_${lessonId || 'demo'}`;
		const channel = serverClient.channel('messaging', channelId);
		await channel.create().catch(() => undefined);
		await channel.addMembers([userId]).catch(() => undefined);

		return res.status(200).json({ token });
	} catch (e: any) {
		return res.status(500).json({ error: e?.message || 'Internal error' });
	}
}


