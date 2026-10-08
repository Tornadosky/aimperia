'use client';

import { useEffect, useState } from 'react';
import { Button, Form, Input, Typography, Space, Divider, Steps, message, Modal } from 'antd';
import {
    GoogleOutlined,
    GithubOutlined,
    MailOutlined,
    LockOutlined,
    LoginOutlined,
} from '@ant-design/icons';

import styles from './signin.module.css'

import { login, handleCallback, getCurrentUser } from '../../lib/auth';
import { useAuth } from '../../context/AuthContext';
import { useTranslations } from 'next-intl';

import { useRouter } from 'next/navigation';
const { Title } = Typography;
const { Step } = Steps;

import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function SignIn() {
    const t = useTranslations('Auth');
    const { user, setUser } = useAuth();
    const router = useRouter();
    
    
    useEffect(() => {
        if (!user?.loading && user) {
            router.push('/home');
        }
    }, [user, router]);
    
    return (
        <div style={{ maxWidth: 400, margin: 'auto', padding: '40px 20px' }}>
            <Title level={2} style={{ textAlign: 'center' }}>{t('signIn')}</Title>
            <Form layout="vertical" onFinish={async (values) => {
                    try {
                        const data = await login(values.email, values.password);
                        setUser(data.user);
                        if(data.error){
                            message.error(data.error);
                            return;
                        }
                        message.success(t('signInSuccess'));
                        router.push('/home');
                    } catch (err) {
                        console.error(err);
                        message.error(t('signInError'));
                    }
                }
            }>
                <Form.Item
                    label={t('email')}
                    name="email"
                    rules={[{ required: true, message: t('emailRequired') }]}
                >
                    <Input prefix={<MailOutlined style={{marginRight:'10px'}}/>} placeholder={t('emailPlaceholder')} className={styles.input} />
                </Form.Item>

                <Form.Item
                    label={t('password')}
                    name="password"
                    rules={[{ required: true, message: t('passwordRequired') }]}
                >
                    <Input.Password prefix={<LockOutlined style={{marginRight:'10px'}} />} placeholder={t('passwordPlaceholder')} className={styles.input} />
                </Form.Item>

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        style={{ width: '100%' }}
                        icon={<LoginOutlined />}
                        className={styles.button}
                    >
                        {t('signInButton')}
                    </Button>
                </Form.Item>
                
                <Divider plain>{t('orUseGoogle')}</Divider>
                <Button
                    icon={<GoogleOutlined />}
                    type="primary"
                    block
                    className={styles.button}
                    onClick={async () => {
                        supabase.auth.signInWithOAuth({
                            provider: 'google',
                            options: {
                                redirectTo: `${window.location.origin}/callback`,
                            }
                        });
                    }}
                >
                    {t('signInWithGoogle')}
                </Button>
            </Form>
            <Button
                // type="primary"
                block
                className={styles.button}
                style={{ marginTop: '10px' }}
                onClick={() => {
                    router.push('/signup');
                }}
            >
                {t('signUp')}
            </Button>
        </div>
    );
}