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
    CopyOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import styles from "./styles.module.css";
import { useTranslations } from 'next-intl';

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
    const t = useTranslations('Header');
    
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
                            type="primary"
                            icon={<PlusOutlined />}
                            className={styles.button}
                            onClick={async () => {
                                setCreateLessonModal(true);
                            }}
                        >
                            {t('createLesson')}
                        </Button>:
                        null}
                        
                        {user?.role === 'student'?
                        <Button
                            type="primary"
                            icon={<LoginOutlined />}
                                className={styles.button}
                                onClick={() => {
                                    setJoinLessonModal(true);
                                }}
                        >
                            {t('joinLesson')}
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
                                        <b>{t('profile')}:</b> {user?.firstName ? user?.firstName + ' ' + user?.lastName : t('guest')}
                                    </p>
                                    <p>
                                        <b>Email:</b> {user?.email || t('noEmail')}
                                    </p>
                                    <Button
                                        icon={<LogoutOutlined />}
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
                                        {t('logout')}
                                    </Button>
                                </div>
                            }
                            placement="bottomRight"
                        >
                            <Button icon={<TeamOutlined />} className={styles.button}>{t('account')}</Button>
                        </Popover>
                    </Space>
                </div>
                
                
                <Modal
                    title={<div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "20px",
                    }}><InfoCircleFilled style={{color:'#3d8eff', marginRight:'10px', fontSize:'20px'}}/>{t('createLessonModal.title')}</div>}
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
                        }}>{t('createLessonModal.instruction')}</p>
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
                                        Modal.success({
                                            title: t('createLessonModal.successTitle'),
                                            content: (
                                                <div style={{
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    marginRight: '30px'
                                                }}>
                                                    <p style={{fontSize:'16px', fontWeight:'bold'}}>{t('createLessonModal.lessonName')}: {newLesson.title}</p>
                                                    <p style={{ fontSize: '16px' }}>{t('createLessonModal.successCopyInstruction')}</p>
                                                    
                                                    <div style={{
                                                        textWrap: 'nowrap',
                                                        border: '1px solid #3d8eff',
                                                        borderRadius: '50px',
                                                        padding: '5px 20px',
                                                        cursor: 'pointer',
                                                        marginTop: '10px',
                                                    }}
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(newLesson.inviteCode);
                                                        message.success(t('createLessonModal.codeCopied'));
                                                    }}>
                                                        <span
                                                            style={{ cursor: "pointer", color: "#3d8eff" }}
                                                        >
                                                            {newLesson.inviteCode}
                                                        </span>
                                                        <Button
                                                            type="primary"
                                                            style={{ marginLeft: "10px", height: "32px" }}
                                                            icon={<CopyOutlined />}
                                                        />
                                                    </div>
                                                    <Button
                                                        type="primary"
                                                        style={{ marginTop: "10px" }}
                                                        onClick={() => {
                                                            router.push(`/meeting/${newLesson.id}`);
                                                            Modal.destroyAll();
                                                        }}
                                                        icon={<DesktopOutlined />}
                                                    >
                                                        {t('createLessonModal.goToLesson')}
                                                    </Button>
                                                    
                                                </div>
                                            ),
                                        });
                                        setCreateLessonModal(false)
                                        form.resetFields();
                                    }
                                    else {
                                        message.error(t('createLessonModal.error'));
                                    }
                                    setCreateLoading(false);
                                }}
                                layout="vertical"
                                style={{ maxWidth: 400, width: "100%" }}
                                
                            >
                                <Form.Item
                                    name="title"
                                    rules={[{ required: true, message: t('createLessonModal.namePlaceholder') }]}
                                >
                                    <Input placeholder={t('createLessonModal.namePlaceholder')} />
                                </Form.Item>
                                <Form.Item
                                    name="description"
                                    rules={[]}
                                >
                                    <Input.TextArea placeholder={t('createLessonModal.descriptionPlaceholder')} />
                                </Form.Item>
                                <Form.Item style={{ display: "flex", justifyContent: "center", marginBottom: 0 }}>
                                    <Space>
                                        <Button type="primary" htmlType="submit"
                                            loading={createLoading}
                                        >
                                            {t('createLessonModal.submit')}
                                        </Button>
                                        <Button
                                            onClick={() => setCreateLessonModal(false)}
                                        >
                                            {t('createLessonModal.cancel')}
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
                    }}><InfoCircleFilled style={{color:'#3d8eff', marginRight:'10px', fontSize:'20px'}}/>{t('joinLessonModal.title')}</div>}
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
                        }}>{t('joinLessonModal.instruction')}</p>
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
                                            message.success(t('joinLessonModal.successTitle'));
                                            setJoinLessonModal(false)
                                            form.resetFields();
                                            
                                            Modal.success({
                                                title: t('joinLessonModal.successTitle'),
                                                content: (
                                                    <div style={{
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        marginRight: '30px'
                                                    }}>
                                                        <p style={{fontSize:'16px', fontWeight:'bold'}}>{t('createLessonModal.lessonName')}: {fullLesson.title}</p>
                                                        <p style={{ fontSize: '16px' }}>{t('joinLessonModal.instruction')}</p>
                                                        
                                                        <Button
                                                            type="primary"
                                                            style={{ marginTop: "10px" }}
                                                            onClick={() => {
                                                                router.push(`/meeting/${fullLesson.id}`);
                                                                Modal.destroyAll();
                                                            }}
                                                            icon={<DesktopOutlined />}
                                                        >
                                                            {t('joinLessonModal.goToLesson')}
                                                        </Button>
                                                        
                                                    </div>
                                                ),
                                            });
                                            
                                            
                                        }
                                        else {
                                            message.error(t('joinLessonModal.errorFetch'));
                                        }
                                    }
                                    else {
                                        message.error(t('joinLessonModal.errorJoin'));
                                    }
                                    setJoinLoading(false);
                                }}
                                layout="vertical"
                                style={{ maxWidth: 400, width: "100%" }}
                                
                            >
                                <Form.Item
                                    name="code"
                                    rules={[{ required: true, message: t('joinLessonModal.codePlaceholder') }]}
                                >
                                    <Input placeholder={t('joinLessonModal.codePlaceholder')} />
                                </Form.Item>
                                <Form.Item style={{ display: "flex", justifyContent: "center", marginBottom: 0 }}>
                                    <Space>
                                        <Button type="primary" htmlType="submit"
                                            loading={joinLoading}
                                        >
                                            {t('joinLessonModal.submit')}
                                        </Button>
                                        <Button
                                            onClick={() => setJoinLessonModal(false)}
                                        >
                                            {t('joinLessonModal.cancel')}
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