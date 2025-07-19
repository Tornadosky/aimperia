'use client';

import { useState } from 'react';
import { Button, Form, Input, Typography, Space, Divider, Steps } from 'antd';
import {
    GoogleOutlined,
    GithubOutlined,
    MailOutlined,
    LockOutlined,
    LoginOutlined,
} from '@ant-design/icons';

const { Title } = Typography;
const { Step } = Steps;

export default function SignIn() {
    const [currentStep, setCurrentStep] = useState(0);

    const next = () => setCurrentStep(currentStep + 1);
    const prev = () => setCurrentStep(currentStep - 1);

    return (
        <div style={{ maxWidth: 400, margin: 'auto', padding: '40px 20px' }}>
            <Title level={2} style={{ textAlign: 'center' }}>Вход</Title>

            <Form layout="vertical" onFinish={() => alert('Вход...')}>
                <Form.Item
                    label="Email"
                    name="email"
                    rules={[{ required: true, message: 'Пожалуйста, введите email' }]}
                >
                    <Input prefix={<MailOutlined />} placeholder="you@example.com" />
                </Form.Item>

                <Form.Item
                    label="Пароль"
                    name="password"
                    rules={[{ required: true, message: 'Пожалуйста, введите пароль' }]}
                >
                    <Input.Password prefix={<LockOutlined />} placeholder="••••••••" />
                </Form.Item>

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        style={{ width: '100%' }}
                        icon={<LoginOutlined />}
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
                >
                    Войти через Google
                </Button>
            </Form>
        </div>
    );
}
