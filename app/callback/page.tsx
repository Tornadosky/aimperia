'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { message, Spin } from 'antd';
import { handleCallback, getCurrentUser } from '../lib/auth';
import { useAuth } from '../context/AuthContext';


export default function CallbackPage() {
    const [messageApi, contextHolder] = message.useMessage();
    const router = useRouter();
    const { setUser } = useAuth();
    useEffect(() => {
        // Parse query params from URL
        const hash = window.location.hash.startsWith('#') ? window.location.hash.substring(1) : window.location.hash;
        const params = new URLSearchParams(hash);
        const access_token = params.get('access_token');
        const expires_in = params.get('expires_in');

        if (!access_token) {
            message.error('Ошибка: отсутствует access_token');
            router.replace('/signin');
            return;
        }
        
        const handleLogin = async () => {
            const result = await handleCallback(access_token);
            if (result?.ok) {
                messageApi.open({type:'success',content:'Успешный вход', key:'loginSuccess'});
                const user = await getCurrentUser();
                if (user?.id) {
                    setUser(user);
                    messageApi.open({ type: 'success', content: 'Успешный вход через Google', key: 'loginSuccess' });
                    router.push('/home');
                }
                else {
                    message.error('Ошибка получения пользователя');
                    router.replace('/signin');
                }
            } else {
                message.error(result?.error || 'Ошибка входа');
                router.replace('/signin');
            }
        }
        
        handleLogin();
        
    }, [router]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            {contextHolder}
            <Spin size="large" tip="Входим через Google..." />
        </div>
    );
}