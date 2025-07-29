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
    message,
    Form,
    Select,
    Input
} from "antd";
import {
    PlusOutlined,
    LoginOutlined,
    DesktopOutlined,
    FileTextOutlined,
    TeamOutlined,
    VideoCameraOutlined,
    LogoutOutlined,
    CloseCircleOutlined,
    CopyOutlined,
} from "@ant-design/icons";
import Notebook from "./notebook";
import styles from "./Home.module.css";

import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { fetchLessons, createLesson, attendLesson, closeLesson, getLessonSummary, updateLessonSummary } from "@/app/lib/lessons";
import HomeHeader from "@/components/HomeHeader/HomeHeader";
import React from "react";

import { Tldraw, useEditor, Editor } from 'tldraw'
import 'tldraw/tldraw.css'

import UpdateUserModal from "./components/UpdateUserModal/UpdateUserModal";
import { useTranslations } from 'next-intl';

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
    const t = useTranslations('Home');
    
    const router = useRouter();
    const { user, setUser } = useAuth();
    const [roleSelectModal, setRoleSelectModal] = useState(false);
    useEffect(() => {
        if (!user?.loading && !user) {
            router.push("/signin");
            return;
        }
        
        const loadLessons = async (setLoading_ = false) => {
            if (setLoading_) {
                setLoading(true);
            }
            try {
                const completedLessons = await fetchLessons({ status: 'completed', limit: 10 });
                const ongoingLessons = await fetchLessons({ status: 'ongoing', limit: 10 });
                const upcomingLessons = await fetchLessons({ status: 'upcoming', limit: 10 });
                // console.log("Fetched lessons:", {
                //     completed: completedLessons.lessons,
                //     ongoing: ongoingLessons.lessons,
                //     upcoming: upcomingLessons.lessons,
                // });
                setLessons({
                    completed: completedLessons.lessons,
                    ongoing: ongoingLessons.lessons,
                    upcoming: upcomingLessons.lessons,
                });
                
                
            } catch (err) {
                console.error("Failed to fetch lessons", err);
            } finally {
                if (setLoading_) {
                    setLoading(false);
                }
            }
        };

        loadLessons(true);
        
        // const interval = setInterval(() => {
        //     loadLessons();
        // }, 1000); // Refresh lessons every 30 seconds
        // return () => clearInterval(interval);
        
    }, [user]);
    
    const [lessons, setLessons] = useState<Lessons>({} as Lessons);

    
    useEffect(() => {
        console.log(lessons);
    }, [lessons]);
    
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [lessonContent, setLessonContent] = useState<string>("");
    const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);

    // Assume user is teacher or student
    const isTeacher = true; // You can set dynamically from auth

    const handleLessonClick = async (lesson: Lesson) => {
        setLoading(true);

        setSelectedLesson(lesson);
        
        try {
            const result = await getLessonSummary(lesson.id);
            if (result.summary) {
                setLessonContent(result.summary.content);
            }
            else {
                setLessonContent("");
            }
        } catch (err) {
            console.error("Error fetching lesson summary:", err);
        }
        setLoading(false);
    };
    
    const handleLessonJoin = async (lesson: Lesson) => {
        if (!user) return;
        router.push(`/meeting/${lesson.id}`);
    }
    
    const handleLessonEnd = async (lesson: Lesson) => {
        if (!user) return;
        Modal.info({
            title: t('endLessonModal.title'),
            content: (
                <div>
                    <p>{t('endLessonModal.content.confirmation')}</p>
                    <p>{t('endLessonModal.content.warning')}</p>
                </div>
            ),
            onOk: async () => {
                 try {
                    const result = await closeLesson(lesson.id);
                    if (result?.id){
                        setLessons((prev) => ({
                            ...prev,
                            ongoing: prev.ongoing.filter((l) => l.id !== lesson.id),
                            completed: [result, ...prev.completed],
                        }));
                        setSelectedLesson(null);
                        message.success(t('endLessonModal.success'));
                    }
                    else {
                        message.error(t('endLessonModal.error'));
                    }
                } catch (error) {
                    console.error("Error ending lesson:", error);
                    message.error(t('endLessonModal.error'));
                }
            },
            cancelText: t('endLessonModal.buttons.cancel'),
            okText: t('endLessonModal.buttons.end'),
            footer: (_, { OkBtn, CancelBtn }) => (
                <>
                  <Button onClick={()=>{Modal.destroyAll()}}>{t('endLessonModal.buttons.cancel')}</Button>
                  <OkBtn />
                </>
            ),
        })
       
        
    };

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
                            {t('sidebar.currentLessons')}
                        </Title>
                        <List
                            itemLayout="horizontal"
                            dataSource={lessons["ongoing"]}
                            renderItem={(lesson) => {
                                
                                if (user?.role === "student" && lesson.teacherId !== user.id)
                                    return <List.Item
                                        className={[
                                            selectedLesson?.id === lesson.id
                                                ? styles.selectedLesson
                                                : styles.lessonItem,
                                                styles.ongoingLesson
                                        ].join(" ")}
                                        actions={[
                                            <Tooltip
                                                key="join"
                                                title={t('lessonActions.join')}
                                            >
                                                <Button
                                                    shape="circle"
                                                    icon={<LoginOutlined />}
                                                    onClick={() => handleLessonJoin(lesson)}
                                                    style={{ padding: '0px', width: '32px', height: '32px' }}
                                                />
                                            </Tooltip>,
                                        ]}
                                    >
                                        <List.Item.Meta
                                            title={lesson.title}
                                            description={lesson.description}
                                        />
                                    </List.Item>
                                
                                return <List.Item
                                    className={[
                                        selectedLesson?.id === lesson.id
                                            ? styles.selectedLesson
                                            : styles.lessonItem,
                                            styles.ongoingLesson
                                    ].join(" ")}
                                    actions={[
                                        <Tooltip
                                            key="end"
                                            title={t('lessonActions.end')}
                                        >
                                            <Button
                                                shape="circle"
                                                icon={<CloseCircleOutlined />}
                                                onClick={() => handleLessonEnd(lesson)}
                                                style={{ padding: '0px', width: '32px', height: '32px' }}
                                            />
                                        </Tooltip>,
                                        <Tooltip
                                            key="copy"
                                            title={t('lessonActions.copyCode')}
                                        >
                                            <Button
                                                shape="circle"
                                                icon={<CopyOutlined />}
                                                onClick={() => {
                                                    navigator.clipboard.writeText(lesson.inviteCode);
                                                    message.success(t('messages.codeCopied'));
                                                }}
                                                style={{ padding: '0px', width: '32px', height: '32px' }}
                                            />
                                        </Tooltip>,
                                        
                                        <Tooltip
                                            key="join"
                                            title={t('lessonActions.join')}
                                        >
                                            <Button
                                                shape="circle"
                                                icon={<LoginOutlined />}
                                                onClick={() => handleLessonJoin(lesson)}
                                                style={{ padding: '0px', width: '32px', height: '32px' }}
                                            />
                                        </Tooltip>,
                                    ]}
                                >
                                    <List.Item.Meta
                                        title={lesson.title}
                                        description={lesson.description}
                                    />
                                </List.Item>
                            }}
                            locale={{ emptyText: t('sidebar.noCurrentLessons') }}
                        />
                    </div>
                    {/* <div className={styles.sidebarSection}>
                        <Title level={4} className={styles.sidebarTitle}>
                            {t('sidebar.upcomingLessons')}
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
                            locale={{ emptyText: t('sidebar.noUpcomingLessons') }}
                        />
                    </div> */}
                    <div className={styles.sidebarSection}>
                        <Title level={4} className={styles.sidebarTitle}>
                            {t('sidebar.previousLessons')}
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
                                            title={t('lessonActions.openBoard')}
                                        >
                                            <Button
                                                style={{ padding: '0px', width: '32px', height: '32px' }}
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
                            locale={{ emptyText: t('sidebar.noPreviousLessons') }}
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
                            <Spin size="large" tip={t('loading.lesson')} />
                        </div>
                    ) : selectedLesson ? (
                        <>
                            <Title level={3} style={{marginBottom:'30px'}}>{selectedLesson.title}</Title>
                            <Notebook selectedLesson={selectedLesson} user={user} lessonContent={lessonContent} />
                        </>
                    ) : (
                        <div className={styles.emptyState}>
                            {t('emptyState.selectLesson')}
                        </div>
                    )}
                </Content>

                {/* Whiteboard modal */}
                <Modal
                    title={t('whiteboardModal_title')+' ' + (selectedLesson?.title || '')}
                    open={isWhiteboardOpen}
                    footer={null}
                    onCancel={() => setIsWhiteboardOpen(false)}
                    width="90vw"
                    style={{ top: 20 }}
                    bodyStyle={{ height: "80vh", padding: 0 }}
                    centered
                >
                    <Tldraw
                        onMount={(editor) => {
                            editor.updateInstanceState({ isReadonly: true })
                        }}
                    />
                </Modal>
            </Layout>
            
            <UpdateUserModal />
            
        </>
    );
}