"use client";

import { useState, useRef, useEffect } from "react";
import classNames from 'classnames';
import {
    Layout,
    Button,
    Typography,
    List,
    Drawer,
    Modal,
    Space,
    Popover,
    Tooltip,
    Spin,
} from "antd";
import {
    PlusOutlined,
    LoginOutlined,
    DesktopOutlined,
    FileTextOutlined,
    TeamOutlined,
    VideoCameraOutlined,
    LogoutOutlined,
} from "@ant-design/icons";
import Notebook from "./notebook";
import styles from "./Home.module.css";

import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { fetchLessons, createLesson, attendLesson } from "@/app/lib/lessons";

import HomeHeader from "@/components/HomeHeader/HomeHeader";
import React from "react";


export type Lesson = {
    id: string;
    teacherId: string;
    title: string;
    description: string;
    inviteCode: string;
    zoomMeetingId: string;
    zoomStartUrl: string;
    zoomJoinUrl: string;
    zoomPassword: string;
    scheduledAt: string | null;
    startedAt: string | null;
    endedAt: string | null;
    recordingUrl: string | null;
    boardSnapshot: string | null;
    createdAt: string;
    updatedAt: string;
};

export type Lessons = {
    upcoming: Lesson[];
    completed: Lesson[];
    ongoing: Lesson[];
};

const { Header, Sider, Content } = Layout;
const { Title, Text, Paragraph } = Typography;

export default function HomePage() {
    
    const router = useRouter();
    const { user, setUser } = useAuth();
    useEffect(() => {
        if (!user) {
            router.push("/signin");
            return;
        }
        
        
        const loadLessons = async () => {
            setLoading(true);
            try {
                const completedLessons = await fetchLessons({ status: 'completed', limit: 10 });
                const ongoingLessons = await fetchLessons({ status: 'ongoing', limit: 10 });
                const upcomingLessons = await fetchLessons({ status: 'upcoming', limit: 10 });
                console.log("Fetched lessons:", {
                    completed: completedLessons.lessons,
                    ongoing: ongoingLessons.lessons,
                    upcoming: upcomingLessons.lessons,
                });
                setLessons({
                    completed: completedLessons.lessons,
                    ongoing: ongoingLessons.lessons,
                    upcoming: upcomingLessons.lessons,
                });
                
                
            } catch (err) {
                console.error("Failed to fetch lessons", err);
            } finally {
                setLoading(false);
            }
        };

        loadLessons();
        
    }, [user]);
    
    const [lessons, setLessons] = useState<Lessons>({} as Lessons);

    
    useEffect(() => {
        console.log(lessons);
    }, [lessons]);
    
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);

    // Assume user is teacher or student
    const isTeacher = true; // You can set dynamically from auth

    const handleLessonClick = (lesson: Lesson) => {
        setLoading(true);

        setSelectedLesson(lesson);

        setTimeout(() => {
            setLoading(false);
        }, 300);
    };
    
    const handleLessonJoin = async (lesson: Lesson) => {
        if (!user) return;
        router.push(`/meeting/${lesson.id}`);
    }

    const [loading, setLoading] = useState(false);
    const container = useRef<HTMLElement>(null);

    useEffect(() => {
        interface ContainerRef {
            current: HTMLElement | null;
        }

        const setPageHeight = (container: ContainerRef) => {
            if (container.current) {
                let footer_header_height: number = 0;
                // const footer: HTMLElement | null = document.querySelector('#app-footer');
                // if (footer)
                //     footer_header_height += footer.clientHeight;
                const header: HTMLElement | null =
                    document.querySelector("#app-header");
                if (header) footer_header_height += header.clientHeight;
                container.current.style.height = `${
                    window.innerHeight - footer_header_height
                }px`;
            }
        };
        addEventListener("resize", () => {
            setPageHeight(container);
        });
        setPageHeight(container);
        return () => {
            removeEventListener("resize", () => {
                setPageHeight(container);
            });
        };
    }, [container]);

    return (
        <>
            <HomeHeader lessons={lessons} setLessons={setLessons} />
            <Layout className={styles.container} ref={container}>
                {/* Left sidebar: list of lessons */}
                <Sider
                    width={300}
                    className={styles.sider}
                    breakpoint="lg"
                    collapsedWidth="0"
                >
                    <div className={styles.sidebarSection}>
                        <Title level={4} className={styles.sidebarTitle}>
                            Текущие уроки
                        </Title>
                        <List
                            itemLayout="horizontal"
                            dataSource={lessons["ongoing"]}
                            renderItem={(lesson) => (
                                <List.Item
                                    className={[
                                        selectedLesson?.id === lesson.id
                                            ? styles.selectedLesson
                                            : styles.lessonItem,
                                            styles.ongoingLesson
                                    ].join(" ")}
                                    actions={[
                                        <Tooltip
                                            key="join"
                                            title="Присоединиться к уроку"
                                        >
                                            <Button
                                                shape="circle"
                                                icon={<LoginOutlined />}
                                                onClick={() => handleLessonJoin(lesson)}
                                                style={{ padding: '0px', width: '32px', height: '32px' }}
                                            />
                                        </Tooltip>,
                                    ]}
                                    onClick={() => handleLessonJoin(lesson)}
                                >
                                    <List.Item.Meta
                                        title={lesson.title}
                                        description={lesson.description}
                                    />
                                </List.Item>
                            )}
                            locale={{ emptyText: "Нет текущих уроков" }}
                        />
                    </div>
                    {/* <div className={styles.sidebarSection}>
                        <Title level={4} className={styles.sidebarTitle}>
                            Предстоящие уроки
                        </Title>
                        <List
                            itemLayout="horizontal"
                            dataSource={lessons["upcoming"]}
                            renderItem={(lesson) => (
                                <List.Item
                                    className={[
                                        selectedLesson?.id === lesson.id
                                            ? styles.selectedLesson
                                            : styles.lessonItem,
                                    ].join(" ")}
                                    onClick={() => handleLessonClick(lesson)}
                                >
                                    <List.Item.Meta
                                        title={lesson.title}
                                        description={lesson.description}
                                    />
                                </List.Item>
                            )}
                            locale={{ emptyText: "Нет предстоящих уроков" }}
                        />
                    </div> */}
                    <div className={styles.sidebarSection}>
                        <Title level={4} className={styles.sidebarTitle}>
                            Предыдущие уроки
                        </Title>
                        <List
                            itemLayout="horizontal"
                            dataSource={lessons["completed"]}
                            renderItem={(lesson) => (
                                <List.Item
                                    className={[
                                        selectedLesson?.id === lesson.id
                                            ? styles.selectedLesson
                                            : styles.lessonItem,
                                    ].join(" ")}
                                    actions={[
                                        <Tooltip
                                            key="board"
                                            title="Открыть доску на весь экран"
                                        >
                                            <Button
                                                shape="circle"
                                                icon={<DesktopOutlined />}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedLesson(lesson);
                                                    setIsWhiteboardOpen(true);
                                                }}
                                            />
                                        </Tooltip>,
                                    ]}
                                    onClick={() => handleLessonClick(lesson)}
                                >
                                    <List.Item.Meta
                                        title={lesson.title}
                                        description={lesson.description}
                                    />
                                </List.Item>
                            )}
                            locale={{ emptyText: "Пока нет уроков" }}
                        />
                    </div>
                </Sider>

                {/* Main content: notes & editor */}
                <Content
                    className={classNames(
                    styles.content,
                    loading ? styles.loading : styles.loaded
                    )}
                >
                    {loading ? (
                        <div className={styles.loadingContainer}>
                            <Spin size="large" tip="Загрузка урока..." />
                        </div>
                    ) : selectedLesson ? (
                        <>
                            <Title level={3} style={{marginBottom:'30px'}}>{selectedLesson.title}</Title>
                            <Notebook selectedLesson={selectedLesson} />
                        </>
                    ) : (
                        <div className={styles.emptyState}>
                            Выберите урок слева, чтобы просмотреть конспект
                        </div>
                    )}
                </Content>

                {/* Whiteboard modal */}
                <Modal
                    title="Доска урока"
                    open={isWhiteboardOpen}
                    footer={null}
                    onCancel={() => setIsWhiteboardOpen(false)}
                    width="90vw"
                    style={{ top: 20 }}
                    bodyStyle={{ height: "80vh", padding: 0 }}
                    centered
                >
                    {/* {selectedLesson && (
                        <iframe
                            src={selectedLesson.whiteboardUrl}
                            className={styles.whiteboardIframe}
                            title="Whiteboard"
                        />
                    )} */}
                </Modal>
            </Layout>
        </>
    );
}
