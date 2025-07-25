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

import { login } from '../../lib/auth';
import { useAuth } from '../../context/AuthContext';

import { useRouter } from 'next/navigation';

const { Title } = Typography;
const { Step } = Steps;

export default function SignIn() {

    const { user, setUser } = useAuth();
    const router = useRouter();
    
    useEffect(() => {
        if (user) {
            router.push('/home');
        }
    }, [user, router]);
    
    return (
        <div style={{ maxWidth: 400, margin: 'auto', padding: '40px 20px' }}>
            <Title level={2} style={{ textAlign: 'center' }}>Вход</Title>
            <Form layout="vertical" onFinish={async (values) => {
                    try {
                        const data = await login(values.email, values.password);
                        setUser(data.user);
                        if(data.error){
                            message.error(data.error);
                            return;
                        }
                        message.success('Успешный вход');
                        router.push('/home');
                    } catch (err) {
                        console.error(err);
                    }
                }
            }>
                <Form.Item
                    label="Email"
                    name="email"
                    rules={[{ required: true, message: 'Пожалуйста, введите email' }]}
                >
                    <Input prefix={<MailOutlined style={{marginRight:'10px'}}/>} placeholder="you@example.com" className={styles.input} />
                </Form.Item>

                <Form.Item
                    label="Пароль"
                    name="password"
                    rules={[{ required: true, message: 'Пожалуйста, введите пароль' }]}
                >
                    <Input.Password prefix={<LockOutlined style={{marginRight:'10px'}} />} placeholder="••••••••" className={styles.input} />
                </Form.Item>

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        style={{ width: '100%' }}
                        icon={<LoginOutlined />}
                        className={styles.button}
                    >
                        Войти
                    </Button>
                </Form.Item>
                
                <Divider plain>Или используйте Google</Divider>
                <Button
                    icon={<GoogleOutlined />}
                    type="primary"
                    href="/signin/google"
                    block
                    className={styles.button}
                >
                    Войти через Google
                </Button>
            </Form>
        </div>
    );
}
