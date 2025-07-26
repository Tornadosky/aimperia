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
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

const { Title } = Typography;

export default function SignUp() {
    const [role, setRole] = useState<"student" | "teacher" | null>(null);

    const { user, setUser } = useAuth();
    useEffect(() => {
        if (user) {
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
            message.success("Регистрация успешна");
            router.push("/home");
        } catch (error: unknown) {
            if (error instanceof Error) {
                message.error(error.message || "Ошибка при регистрации");
            } else {
                message.error("Ошибка при регистрации");
            }
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: "auto", padding: "20px 20px" }}>
            <Title level={2} style={{ textAlign: "center" }}>
                Регистрация
            </Title>

            <Form layout="vertical" onFinish={handleFinish}>
                <Form.Item
                    label="Имя"
                    name="firstName"
                    rules={[
                        { required: true, message: "Пожалуйста, введите имя" },
                    ]}
                >
                    <Input placeholder="Иван" className={styles.input} />
                </Form.Item>

                <Form.Item
                    label="Фамилия"
                    name="lastName"
                    rules={[
                        {
                            required: true,
                            message: "Пожалуйста, введите фамилию",
                        },
                    ]}
                >
                    <Input placeholder="Иванов" className={styles.input} />
                </Form.Item>

                <Form.Item
                    label="Электронная почта"
                    name="email"
                    rules={[
                        {
                            required: true,
                            message: "Введите корректный email",
                            type: "email",
                        },
                    ]}
                >
                    <Input
                        prefix={
                            <MailOutlined style={{ marginRight: "10px" }} />
                        }
                        placeholder="you@example.com"
                        className={styles.input}
                    />
                </Form.Item>

                <Form.Item
                    label="Пароль"
                    name="password"
                    rules={[{ required: true, message: "Введите пароль" }]}
                >
                    <Input.Password
                        prefix={
                            <LockOutlined style={{ marginRight: "10px" }} />
                        }
                        placeholder="••••••••"
                        className={styles.input}
                    />
                </Form.Item>

                <Form.Item
                    label="Вы —"
                    name="role"
                    rules={[
                        {
                            required: true,
                            message: "Пожалуйста, выберите роль",
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
                            Ученик
                        </Radio.Button>
                        <Radio.Button
                            value="teacher"
                            style={{ width: "50%" }}
                            className={styles.radio}
                        >
                            Преподаватель
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
                        Зарегистрироваться
                    </Button>
                </Form.Item>
            </Form>

            <Divider plain>или</Divider>

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
                    Зарегистрироваться через Google
                </Button>
            </Space>
        </div>
    );
}
