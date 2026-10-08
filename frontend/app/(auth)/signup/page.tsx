"use client";

import { useEffect, useState } from "react";
import {
    Button,
    Form,
    Input,
    Radio,
    Typography,
    Divider,
    Space,
    message,
} from "antd";
import {
    GoogleOutlined,
    UserAddOutlined,
    LockOutlined,
    MailOutlined,
} from "@ant-design/icons";
import styles from "./signup.module.css";
import { useAuth } from "../../context/AuthContext";
import { signup, handleCallback, getCurrentUser } from "../../lib/auth";

import { useRouter } from "next/navigation";
import { createClient } from '@supabase/supabase-js'
import { useTranslations } from 'next-intl';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

const { Title } = Typography;

export default function SignUp() {
    const [role, setRole] = useState<"student" | "teacher" | null>(null);
    const t = useTranslations('Auth');
    const { user, setUser } = useAuth();
    useEffect(() => {
        if (!user?.loading && user) {
            router.push("/home");
        }
    }, [user]);
    
    const router = useRouter();

    interface SignUpFormValues {
        firstName: string;
        lastName: string;
        email: string;
        password: string;
        role: "student" | "teacher";
    }

    const handleFinish = async (values: SignUpFormValues) => {
        try {
            const data = await signup(values);
            setUser(data.user);
            if (data.error) {
                message.error(data.error);
                return;
            }
            message.success(t('signUpSuccess'));
            router.push("/home");
        } catch (error: unknown) {
            if (error instanceof Error) {
                message.error(error.message || t('signUpError'));
            } else {
                message.error(t('signUpError'));
            }
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: "auto", padding: "20px 20px" }}>
            <Title level={2} style={{ textAlign: "center" }}>
                {t('signUp')}
            </Title>

            <Form layout="vertical" onFinish={handleFinish}>
                <Form.Item
                    label={t('firstName')}
                    name="firstName"
                    rules={[
                        { required: true, message: t('firstNameRequired') },
                    ]}
                >
                    <Input placeholder={t('firstNamePlaceholder')} className={styles.input} />
                </Form.Item>

                <Form.Item
                    label={t('lastName')}
                    name="lastName"
                    rules={[
                        {
                            required: true,
                            message: t('lastNameRequired'),
                        },
                    ]}
                >
                    <Input placeholder={t('lastNamePlaceholder')} className={styles.input} />
                </Form.Item>

                <Form.Item
                    label={t('emailLabel')}
                    name="email"
                    rules={[
                        {
                            required: true,
                            message: t('emailInvalid'),
                            type: "email",
                        },
                    ]}
                >
                    <Input
                        prefix={
                            <MailOutlined style={{ marginRight: "10px" }} />
                        }
                        placeholder={t('emailPlaceholder')}
                        className={styles.input}
                    />
                </Form.Item>

                <Form.Item
                    label={t('password')}
                    name="password"
                    rules={[{ required: true, message: t('passwordEnter') }]}
                >
                    <Input.Password
                        prefix={
                            <LockOutlined style={{ marginRight: "10px" }} />
                        }
                        placeholder={t('passwordPlaceholder')}
                        className={styles.input}
                    />
                </Form.Item>

                <Form.Item
                    label={t('role')}
                    name="role"
                    rules={[
                        {
                            required: true,
                            message: t('roleRequired'),
                        },
                    ]}
                >
                    <Radio.Group
                        onChange={(e) => setRole(e.target.value)}
                        style={{ width: "100%" }}
                    >
                        <Radio.Button
                            value="student"
                            style={{ width: "50%" }}
                            className={styles.radio}
                        >
                            {t('roleStudent')}
                        </Radio.Button>
                        <Radio.Button
                            value="teacher"
                            style={{ width: "50%" }}
                            className={styles.radio}
                        >
                            {t('roleTeacher')}
                        </Radio.Button>
                    </Radio.Group>
                </Form.Item>

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        icon={<UserAddOutlined />}
                        block
                        className={styles.button}
                    >
                        {t('signUpButton')}
                    </Button>
                </Form.Item>
            </Form>

            <Divider plain>{t('or')}</Divider>

            <Space direction="vertical" style={{ width: "100%" }}>
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
                    {t('signUpWithGoogle')}
                </Button>
            </Space>
        </div>
    );
}