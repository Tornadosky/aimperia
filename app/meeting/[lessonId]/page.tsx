"use client";

import React, { useState, useRef, useEffect } from "react";
import { Form, Input, Button, Spin, message, List, Layout, Image, ConfigProvider, Tooltip, Collapse, Popover, Drawer, FloatButton } from "antd";
import { fetchLessons, createLesson, attendLesson, fetchLessonById, uploadBoardHighlight, fetchBoardHighlights, deleteBoardHighlight } from "@/app/lib/lessons";
import { uploadBoardAsset } from "@/app/lib/tldrawAPI";
import { logout } from "@/app/lib/auth";
import { useAuth } from '@/app/context/AuthContext'
import { useTranslations } from 'next-intl'; // Add this import
import styles from './meeting.module.css'
import classNames from 'classnames'
import {
    Tldraw,
    useEditor,
    Editor,
    TLAssetStore,
    uniqueId,
    AssetRecordType,
    getHashForString,
    TLBookmarkAsset,
} from 'tldraw'
import { useSyncDemo, useSync } from '@tldraw/sync'
import 'tldraw/tldraw.css'
import ruRU from 'antd/locale/ru_RU';
import { DeleteOutlined, TeamOutlined, LogoutOutlined, MessageOutlined } from "@ant-design/icons";
const { Header, Sider, Content } = Layout;
import HeaderLogo from '@/components/HeaderLogo/HeaderLogo';

import AgoraPage from "./agora";
import { useRouter } from 'next/navigation';
import StreamChatPanel from './StreamChatPanel';

const publicLessonId = {lessonId:''}

const multiplayerAssetStore: TLAssetStore = {
    async upload(_asset, file) {
        const id = uniqueId()
        const objectName = `${id}-${file.name}`.replace(/[^a-zA-Z0-9.]/g, '-')
        
        const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
        
        const response = await uploadBoardAsset(publicLessonId.lessonId, objectName, base64);

        if (!response.url) {
            throw new Error(`Failed to upload asset: ${response}`)
        }
        return { src: response.url }
    },

    resolve(asset) {
        return asset.props.src
    },
}


const multiplayerAssets: TLAssetStore = {
	// to upload an asset, we prefix it with a unique id, POST it to our worker, and return the URL
	async upload(_asset, file) {
		const id = uniqueId()
        console.log('publicLessonId',publicLessonId.lessonId)
		const objectName = `${id}-${file.name}`
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.aimperia.org";
		const url = `${API_BASE_URL}/uploads/${encodeURIComponent(objectName)}`

		const response = await fetch(url, {
			method: 'PUT',
			body: file,
		})

		if (!response.ok) {
			throw new Error(`Failed to upload asset: ${response.statusText}`)
		}

		return { src: url }
	},
	// to retrieve an asset, we can just use the same URL. you could customize this to add extra
	// auth, or to serve optimized versions / sizes of the asset.
	resolve(asset) {
		return asset.props.src
	},
}

interface BoardHighlight {
    id: string;
    lessonId: string | undefined;
    description: string;
    url: string;
    createdAt: string;
    updatedAt: string | undefined;
}

export default function MeetingPage({ params }: { params: { lessonId: string } }) {
    const router = useRouter();
    const { user, setUser } = useAuth();
    const t = useTranslations('Meeting'); // Add translation hook
    const [loading, setLoading] = useState(false);
    const [client, setClient] = useState<any>(null);
    const [lessonInfo, setLessonInfo] = useState<any>(null);
    const [signature, setSignature] = useState<string | null>(null);
    // const [whiteBoardId, setWhiteBoardId] = useState<string | null>('unique-id-465845654654');
    // const store = useSyncDemo({ roomId: 'unique-id-465845654654' })
    
    
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.aimperia.org";
    const store = useSync({ uri: `${API_BASE_URL}/connect/${params.lessonId}`, assets: multiplayerAssetStore })
    
    // useEffect(() => {
    //     if (!store) return;
    //     console.log("Store initialized:", store);
    // }, [store.status]);
        
    
    useEffect(() => {
        if (!user?.loading && !user) {
            router.push('/signin');
            return;
        }
    }, [user]);
    
    const [addScreenshotLoading, setAddScreenshotLoading] = useState(false);
    const [screenshots, setScreenshots] = useState<BoardHighlight[]>([]);
    
    useEffect(() => {
        if (!user) return;
        publicLessonId.lessonId = params.lessonId;
        const fetchLesson = async () => {
            try {
                const lesson = await fetchLessonById(params.lessonId);
                console.log("Fetched lesson:", lesson);
                if (lesson?.id){
                    setLessonInfo(lesson);
                    if (lesson.endedAt) {
                        message.error(t('errors.meetingEnded'));
                        router.push('/home');
                        return;
                    }
                }
                else
                    message.error(t('errors.loadMeetingFailed'));
            } catch (error) {
                console.error("Error fetching lesson:", error);
                message.error(t('errors.loadMeetingFailed'));
            }
        }
        fetchLesson();
        
        const fetchBoardHighlights_ = async () => {
            try {
                const highlights = await fetchBoardHighlights(params.lessonId);
                if (Array.isArray(highlights?.highlights)) {
                    setScreenshots(highlights?.highlights as BoardHighlight[]);
                } else {
                    message.error(t('errors.loadScreenshotsFailed'));
                }
            } catch (error) {
                console.error("Error fetching board highlights:", error);
                message.error(t('errors.loadScreenshotsFailed'));
            }
        }
        if (user?.role === 'teacher')
            fetchBoardHighlights_();
        
    }, [params.lessonId, user, t]);

    const handleJoin = async (values: {
        meetingNumber: string;
        userName: string;
        meetingPassword?: string;
    }) => {
        if (!client) {
            message.error(t('errors.zoomNotReady'));
            return;
        }

        setLoading(true);
        try {

            message.success(t('success.connected'));
        } catch (err) {
            console.error(err);
            message.error(t('errors.connectionError'));
        } finally {
            setLoading(false);
        }
    };
    
    const [editor, setEditor] = useState<Editor|null>(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    
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
                theme="light"
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
                                <b>{t('accountPopover.name')}:</b> {user?.firstName ? user?.firstName + ' ' + user?.lastName : t('accountPopover.guest')}
                            </p>
                            <p>
                                <b>{t('accountPopover.email')}:</b> {user?.email || t('accountPopover.notSpecified')}
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
                                {t('buttons.logout')}
                            </Button>
                        </div>
                    }
                    placement="topRight"
                >
                    <Button icon={<TeamOutlined />} className={styles.button}>{t('buttons.account')}</Button>
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
                    <Tldraw store={store}>
                        <InsideOfContext />
                    </Tldraw>
                </div>
            </Content>
            
            {(() => {
                const v = (process.env.NEXT_PUBLIC_ENABLE_STREAM_CHAT || '').trim().toLowerCase();
                const enabled = v === 'true' || v === '1' || v === 'yes' || v === 'on';
                if (!enabled) return null;
                return (
                    <>
                        <FloatButton
                            icon={<MessageOutlined />}
                            type="primary"
                            onClick={() => setIsChatOpen(true)}
                            style={{ right: 24, bottom: 24, zIndex: 1000 }}
                        />
                        <Drawer
                            placement="right"
                            width={420}
                            title="Chat"
                            open={isChatOpen}
                            onClose={() => setIsChatOpen(false)}
                            destroyOnClose
                            maskClosable
                        >
                            <div style={{ height: 'calc(100vh - 120px)' }}>
                                <StreamChatPanel lessonId={params.lessonId} showInput />
                            </div>
                        </Drawer>
                    </>
                );
            })()}

            {user?.role==='teacher'?
                <Sider
                    width={300}
                    className={styles.sider}
                    theme="light"
                    breakpoint="lg"
                    collapsedWidth="0"
                >
                    
                    <Button
                        loading={addScreenshotLoading}
                        type="primary"
                        onClick={() => {
                            setAddScreenshotLoading(true);
                            if (!editor) {
                                message.error(t('errors.editorNotInitialized'));
                                setAddScreenshotLoading(false);
                                return;
                            }
                            const renderingShapes = editor.getCurrentPageRenderingShapesSorted()
                            editor.toImage(renderingShapes, {padding:60}).then(async (value: {blob: Blob, height: number, width: number}) => {
                                const url = URL.createObjectURL(value.blob);
                                const base64 = await new Promise<string>((resolve, reject) => {
                                    const reader = new FileReader();
                                    reader.onloadend = () => resolve(reader.result as string);
                                    reader.onerror = reject;
                                    reader.readAsDataURL(value.blob);
                                });
                                const uploadedHighlight = await uploadBoardHighlight(params.lessonId,
                                    {
                                        description: "",
                                        dataUrl: base64,
                                    }
                                );
                                if (uploadedHighlight?.id) {
                                    setScreenshots([{
                                        id: uploadedHighlight.id,
                                        lessonId: uploadedHighlight.lessonId,
                                        description: uploadedHighlight.description,
                                        url: uploadedHighlight.url,
                                        createdAt: uploadedHighlight.createdAt,
                                        updatedAt: uploadedHighlight.updatedAt
                                    }, ...screenshots]);
                                    message.success(t('success.screenshotAdded'));
                                }
                                else {
                                    message.error(t('errors.screenshotAddFailed'));
                                }
                                setAddScreenshotLoading(false);
                            })
                        }}
                    >
                        {t('buttons.addScreenshot')}
                    </Button>
                    
                    <ConfigProvider locale={ruRU}>
                        <List
                            className={styles.screenshotsList}
                            itemLayout="horizontal"
                            dataSource={screenshots}
                            renderItem={(item) => (
                                <List.Item
                                    actions={[
                                        <Tooltip title={t('buttons.deleteScreenshot')} key="delete">
                                            <Button
                                                style={{ height: '32px' }}
                                                onClick={async () => {
                                                    const result = await deleteBoardHighlight(params.lessonId, item.id);
                                                    if (result?.ok){
                                                        setScreenshots(screenshots.filter(i => i !== item));
                                                        message.success(t('success.screenshotDeleted'));
                                                    }
                                                    else {
                                                        message.error(t('errors.screenshotDeleteFailed'));
                                                    }
                                                }}
                                                icon={<DeleteOutlined />}
                                            />
                                        </Tooltip>
                                    ]}
                                >
                                    <Image src={item.url} className={styles.screenshotImage} />
                                </List.Item>
                            )}
                            locale={{ emptyText: t('screenshots.emptyText') }}
                        />
                    </ConfigProvider>
                    
                </Sider>
            :null}
        </Layout>
    );
}