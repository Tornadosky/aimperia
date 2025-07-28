"use client";

import { useEffect, useState } from "react";
import {
    Button,
    Layout,
    List,
    Typography,
    Space,
    Card,
    Modal,
    Popover,
    Form,
    Input,
    message,
    DatePicker
} from "antd";
import { ConfigProvider } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import {
    PlusOutlined,
    LoginOutlined,
    DesktopOutlined,
    FileTextOutlined,
    TeamOutlined,
    VideoCameraOutlined,
    LogoutOutlined,
    InfoCircleOutlined,
    InfoCircleFilled,
} from "@ant-design/icons";
import Link from "next/link";
import styles from "./styles.module.css";

import { logout } from "@/app/lib/auth";

const { Header, Content, Sider } = Layout;
const { Title, Paragraph } = Typography;

import { usePathname } from 'next/navigation'
import HeaderLogo from '../HeaderLogo/HeaderLogo';

import { useAuth } from '@/app/context/AuthContext';

import { useRouter } from 'next/navigation';
import { fetchLessons, createLesson, joinLesson, fetchLessonById } from "@/app/lib/lessons";
import { Dispatch, SetStateAction } from "react";

import { Lesson, Lessons } from "@/app/home/page";

interface HomeHeaderProps {
    lessons: any;
    setLessons: Dispatch<SetStateAction<any>>;
}

const HomeHeader = ({ lessons, setLessons }: HomeHeaderProps) => {
    
    const [form] = Form.useForm();
    const { setUser, user } = useAuth();
    const router = useRouter();
    const [createLessonModal, setCreateLessonModal] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    
    const [joinLessonModal, setJoinLessonModal] = useState(false);
    const [joinLoading, setJoinLoading] = useState(false);
    
    return (
        <Header className={styles.header} id="app-header">
            <div className={styles.headerContainer}>
                <HeaderLogo />
                <div className={styles.buttons}>
                    <Space>
                        
                        {user?.role === 'teacher'?
                        <Button
                            icon={<PlusOutlined />}
                            className={styles.button}
                            onClick={async () => {
                                setCreateLessonModal(true);
                            }}
                        >
                            Создать урок
                        </Button>:
                        null}
                        
                        {user?.role === 'student'?
                        <Button
                            icon={<LoginOutlined />}
                                className={styles.button}
                                onClick={() => {
                                    setJoinLessonModal(true);
                                }}
                        >
                            Присоединиться к уроку
                        </Button>
                        :null}
                        <Popover
                            content={
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    width: '200px',
                                    padding: '10px',
                                    gap: '10px'
                                }}>
                                    <p>
                                        <b>Имя:</b> {user?.firstName || 'Гость'}
                                    </p>
                                    <p>
                                        <b>Email:</b> {user?.email || 'Не указан'}
                                    </p>
                                    <Button
                                        icon={<LogoutOutlined />}
                                        // type="link"
                                        style={{ width: '100%' }}
                                        danger
                                        onClick={async () => {
                                            try {
                                                await logout();
                                                setUser(null);
                                                router.push('/signin');
                                            } catch (error) {
                                                console.error("Logout failed", error);
                                            }
                                        }}
                                    >
                                        Выйти
                                    </Button>
                                </div>
                            }
                            placement="bottomRight"
                        >
                            <Button icon={<TeamOutlined />} className={styles.button}>Аккаунт</Button>
                        </Popover>
                    </Space>
                </div>
                
                
                <Modal
                    title={<div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "20px",
                    }}><InfoCircleFilled style={{color:'#3d8eff', marginRight:'10px', fontSize:'20px'}}/>Создание нового урока</div>}
                    open={createLessonModal}
                    onCancel={() => setCreateLessonModal(false)}
                    footer={null}
                    centered
                >
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "20px",
                        width: "100%",
                    }}>
                        <p style={{
                            marginBottom: "16px",
                            fontSize: "16px",
                        }}>Введите название и код приглашения для нового урока:</p>
                        <ConfigProvider locale={ruRU}>
                            <Form
                                form={form}
                                onFinish={async (values) => {
                                    setCreateLoading(true);
                                    const newLesson = await createLesson({
                                        title: values.title,
                                        description: values.description || "",
                                        scheduledAt: values.scheduledAt || undefined,
                                        startNow: true,
                                    });
                                    if (newLesson?.id) {
                                        if (!newLesson.startedAt) {
                                            setLessons((prevLessons: Lessons) => {
                                                return {
                                                    ...prevLessons,
                                                    upcoming: [newLesson, ...prevLessons.ongoing],
                                                }
                                            });
                                        }
                                        else {
                                            setLessons((prevLessons: Lessons) => {
                                                return {
                                                    ...prevLessons,
                                                    ongoing: [newLesson, ...prevLessons.ongoing],
                                                }
                                            });
                                        }
                                        setCreateLoading(false);
                                        message.success("Урок успешно создан");
                                        setCreateLessonModal(false)
                                        form.resetFields();
                                    }
                                    else {
                                        message.error("Ошибка при создании урока");
                                    }
                                }}
                                layout="vertical"
                                style={{ maxWidth: 400, width: "100%" }}
                                
                            >
                                <Form.Item
                                    name="title"
                                    rules={[{ required: true, message: "Введите название урока" }]}
                                >
                                    <Input placeholder="Название урока" />
                                </Form.Item>
                                <Form.Item
                                    name="description"
                                    rules={[]}
                                >
                                    <Input.TextArea placeholder="Описание (необязательно)" />
                                </Form.Item>
                                <Form.Item
                                    name="scheduledAt"
                                    rules={[]}
                                >
                                    <DatePicker
                                        style={{ width: "100%" }}
                                        placeholder="Дата и время начала (необязательно)"
                                        showTime
                                        format="YYYY-MM-DD HH:mm"
                                    />
                                </Form.Item>
                                <Form.Item style={{ display: "flex", justifyContent: "center", marginBottom: 0 }}>
                                    <Space>
                                        <Button type="primary" htmlType="submit"
                                            loading={createLoading}
                                        >
                                            Создать урок
                                        </Button>
                                        <Button
                                            onClick={() => setCreateLessonModal(false)}
                                        >
                                            Отмена
                                        </Button>
                                    </Space>
                                </Form.Item>
                            </Form>
                        </ConfigProvider>
                    </div>
                </Modal>
                
                <Modal
                    title={<div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "20px",
                    }}><InfoCircleFilled style={{color:'#3d8eff', marginRight:'10px', fontSize:'20px'}}/>Присоединение к уроку</div>}
                    open={joinLessonModal}
                    onCancel={() => setJoinLessonModal(false)}
                    footer={null}
                    centered
                >
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "20px",
                        width: "100%",
                    }}>
                        <p style={{
                            marginBottom: "16px",
                            fontSize: "16px",
                        }}>Введите код приглашения для присоединения к уроку:</p>
                        <ConfigProvider locale={ruRU}>
                            <Form
                                form={form}
                                onFinish={async (values) => {
                                    setJoinLoading(true);
                                    const lesson = await joinLesson(values.code);
                                    if (lesson?.lessonId) {
                                        const fullLesson = await fetchLessonById(lesson.lessonId);
                                        if (fullLesson?.id){
                                            setLessons((prevLessons: Lessons) => {
                                                return {
                                                    ...prevLessons,
                                                    ongoing: [fullLesson, ...prevLessons.ongoing],
                                                }
                                            });
                                            setJoinLoading(false);
                                            message.success("Вы успешно присоединились к уроку");
                                            setJoinLessonModal(false)
                                            form.resetFields();
                                        }
                                        else {
                                            message.error("Ошибка при получении информации о встрече");
                                        }
                                    }
                                    else {
                                        message.error("Ошибка при присоединении к уроку");
                                    }
                                }}
                                layout="vertical"
                                style={{ maxWidth: 400, width: "100%" }}
                                
                            >
                                <Form.Item
                                    name="code"
                                    rules={[{ required: true, message: "Введите код приглашения" }]}
                                >
                                    <Input placeholder="Код приглашения" />
                                </Form.Item>
                                <Form.Item style={{ display: "flex", justifyContent: "center", marginBottom: 0 }}>
                                    <Space>
                                        <Button type="primary" htmlType="submit"
                                            loading={joinLoading}
                                        >
                                            Присоединиться
                                        </Button>
                                        <Button
                                            onClick={() => setJoinLessonModal(false)}
                                        >
                                            Отмена
                                        </Button>
                                    </Space>
                                </Form.Item>
                            </Form>
                        </ConfigProvider>
                    </div>
                </Modal>
                
            </div>
        </Header>
    );
};

export default HomeHeader;
