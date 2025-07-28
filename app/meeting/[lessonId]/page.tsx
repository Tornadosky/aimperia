"use client";

import React, { useState, useRef, useEffect } from "react";
import { Form, Input, Button, Spin, message, List, Layout, Image, ConfigProvider, Tooltip, Collapse, Popover } from "antd";
import { fetchLessons, createLesson, attendLesson, fetchLessonById } from "@/app/lib/lessons";
import { logout } from "@/app/lib/auth";
import { useAuth } from '@/app/context/AuthContext'
import styles from './meeting.module.css'
import classNames from 'classnames'
import { Tldraw, useEditor, Editor } from 'tldraw'
import { useSyncDemo } from '@tldraw/sync'
import 'tldraw/tldraw.css'
import ruRU from 'antd/locale/ru_RU';
import { DeleteOutlined, TeamOutlined, LogoutOutlined } from "@ant-design/icons";
const { Header, Sider, Content } = Layout;
import HeaderLogo from '@/components/HeaderLogo/HeaderLogo';

import AgoraPage from "./agora";
import { useRouter } from 'next/navigation';

export default function MeetingPage({ params }: { params: { lessonId: string } }) {
    const router = useRouter();
    const { user, setUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [client, setClient] = useState<any>(null);
    const [lessonInfo, setLessonInfo] = useState<any>(null);
    const [signature, setSignature] = useState<string | null>(null);
    // const [whiteBoardId, setWhiteBoardId] = useState<string | null>('unique-id-465845654654');
    const whiteBoardId = useSyncDemo({ roomId: 'unique-id-465845654654' })

    useEffect(() => {
        if (!user) {
            router.push('/signin');
            return;
        }
    }, [user]);
    
    useEffect(() => {
        if (!user) return;
        const fetchLesson = async () => {
            try {
                const lesson = await fetchLessonById(params.lessonId);
                console.log("Fetched lesson:", lesson);
                if (lesson?.id){
                    setLessonInfo(lesson);
                    if (lesson.endedAt) {
                        message.error("Встреча уже завершена");
                        router.push('/home');
                        return;
                    }
                }
                else
                    message.error("Не удалось загрузить информацию о встрече");
            } catch (error) {
                console.error("Error fetching lesson:", error);
                message.error("Не удалось загрузить информацию о встрече");
            }
        }
        fetchLesson();
    }, [params.lessonId, user]);

    const handleJoin = async (values: {
        meetingNumber: string;
        userName: string;
        meetingPassword?: string;
    }) => {
        if (!client) {
            message.error("Zoom SDK еще не готов");
            return;
        }

        setLoading(true);
        try {

            message.success("Подключено к встрече");
        } catch (err) {
            console.error(err);
            message.error("Ошибка при подключении к встрече");
        } finally {
            setLoading(false);
        }
    };
    
    const [editor, setEditor] = useState<Editor|null>(null);
    const [screenshots, setScreenshots] = useState<string[]>([]);
    
    function InsideOfContext() {
        const editor = useEditor()
        setEditor(editor as Editor);
        return null
    }
    
    return (
        <Layout className={styles.container}>
            
            <Sider
                width={180}
                className={styles.leftSider}
                breakpoint="lg"
                collapsedWidth="0"
            >   
                
                <HeaderLogo imageStyle={{height:'20px'}} textStyle={{fontSize:'20px', marginBottom:'5px'}}/>
                < AgoraPage params={{
                    lessonId: params.lessonId,
                    user: user,
                    router: router,
                    channelName: lessonInfo?.agoraChannelName || '',
                }} />
                {/* <div style={{ height: '100%', }}>
                    <div style={{ width: '150px', height: '150px', backgroundColor: '#000000FF' }} />
                </div> */}
                
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
                    placement="topRight"
                >
                    <Button icon={<TeamOutlined />} className={styles.button}>Аккаунт</Button>
                </Popover>
            </Sider>
            
            <Content
                    className={classNames(
                    styles.content,
                    loading ? styles.loading : styles.loaded
                    )}
                >
                <div style={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    paddingTop: '16px',
                }}>
                    <Tldraw store={whiteBoardId}>
                        <InsideOfContext />
                    </Tldraw>
                </div>
            </Content>
            
            <Sider
                width={300}
                className={styles.sider}
                breakpoint="lg"
                collapsedWidth="0"
            >
                
                <Button
                    type="primary"
                    onClick={() => {
                        if (!editor) {
                            message.error("Редактор не инициализирован");
                            return;
                        }
                        const renderingShapes = editor.getCurrentPageRenderingShapesSorted()
                        editor.toImage(renderingShapes, {padding:60}).then((value: {blob: Blob, height: number, width: number}) => {
                            const url = URL.createObjectURL(value.blob);
                            setScreenshots([url, ...screenshots]);
                            message.success("Скриншот успешно создан");
                        })
                    }}
                >Добавить скриншот в конспект</Button>
                <ConfigProvider locale={ruRU}>
                    <List
                        className={styles.screenshotsList}
                        itemLayout="horizontal"
                        dataSource={screenshots}
                        renderItem={(item) => (
                            <List.Item
                                actions={[
                                    <Tooltip title="Удалить скриншот">
                                        <Button
                                            style={{ height: '32px' }}
                                            onClick={() => {
                                                setScreenshots(screenshots.filter(i => i !== item));
                                                message.success("Скриншот успешно удален");
                                            }}
                                            icon={<DeleteOutlined />}
                                        />
                                    </Tooltip>
                                ]}
                            >
                                <Image src={item} alt="Screenshot" className={styles.screenshotImage} />
                            </List.Item>
                        )}
                        locale={{ emptyText: "Нет скриншотов" }}
                    />
                </ConfigProvider>
                
            </Sider>

        </Layout>
    );
}
