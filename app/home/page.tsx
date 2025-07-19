'use client';

import { useState, useRef, useEffect } from 'react';
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
} from 'antd';
import {
  PlusOutlined,
  LoginOutlined,
  DesktopOutlined,
  FileTextOutlined,
  TeamOutlined,
  VideoCameraOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import styles from './Home.module.css';

const { Header, Sider, Content } = Layout;
const { Title, Text, Paragraph } = Typography;

type Lesson = {
  id: number;
  title: string;
  description: string;
  notes: string;
  whiteboardUrl: string; // URL to saved whiteboard image or page
};

export default function HomePage() {
  // Dummy data for lessons
  const [lessons, setLessons] = useState<Lesson[]>([
    {
      id: 1,
      title: 'Математика — Алгебра',
      description: 'Основы алгебры: уравнения и неравенства',
      notes: 'Конспект урока: решали уравнения, обсуждали функции...',
      whiteboardUrl: '/whiteboard1.png',
    },
    {
      id: 2,
      title: 'Английский язык — Грамматика',
      description: 'Времена Present Simple и Present Continuous',
      notes: 'Обсудили правила, примеры, сделали упражнения...',
      whiteboardUrl: '/whiteboard2.png',
    },
  ]);

  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  // Assume user is teacher or student
  const isTeacher = true; // You can set dynamically from auth

  const handleLessonClick = (lesson: Lesson) => {
    setSelectedLesson(lesson);
  };
  
    const container = useRef<HTMLElement>(null);
    
    
    useEffect(() => {
        
        interface ContainerRef {
            current: HTMLElement | null;
        }

        const setPageHeight = (container: ContainerRef) => {
            if (container.current) {
                let footer_header_height: number = 0;
                const footer: HTMLElement | null = document.querySelector('#app-footer');
                if (footer)
                    footer_header_height += footer.clientHeight;
                const header: HTMLElement | null = document.querySelector('#app-header');
                if (header)
                    footer_header_height += header.clientHeight;
                container.current.style.height = `${window.innerHeight - footer_header_height}px`;
            }
        };
        addEventListener('resize', () => {
            setPageHeight(container);
        });
        setPageHeight(container);
        return () => {
            removeEventListener('resize', () => {
                setPageHeight(container);
            });
        }
    }, [container]);
    
    return (
        <Layout className={styles.container} ref={container}>
        {/* Left sidebar: list of lessons */}
        <Sider width={300} className={styles.sider} breakpoint="lg" collapsedWidth="0">
            <Title level={4} className={styles.sidebarTitle}>
            Предыдущие уроки
            </Title>
            <List
            itemLayout="horizontal"
            dataSource={lessons}
            renderItem={(lesson) => (
                <List.Item
                    className={[
                        selectedLesson?.id === lesson.id ? styles.selectedLesson : '',
                        styles.lessonItem
                    ].join(' ')}
                    actions={[
                        <Tooltip key="board" title="Открыть доску на весь экран">
                            <Button
                                shape="circle"
                                icon={<DesktopOutlined />}
                                onClick={() => {
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
            />
        </Sider>

        {/* Main content: notes & editor */}
        <Content className={styles.content}>
            {!selectedLesson ? (
            <Paragraph>Выберите урок слева, чтобы просмотреть конспект</Paragraph>
            ) : (
            <>
                <Title level={3}>{selectedLesson.title}</Title>
                <Paragraph><b>Конспект урока:</b></Paragraph>
                <div className={styles.notesContainer}>
                {isTeacher ? (
                    <textarea
                    className={styles.notesTextarea}
                    value={selectedLesson.notes}
                    onChange={(e) => {
                        const newNotes = e.target.value;
                        setSelectedLesson((prev) =>
                        prev ? { ...prev, notes: newNotes } : prev
                        );
                        // Optionally update lesson list as well
                        setLessons((prev) =>
                        prev.map((l) =>
                            l.id === selectedLesson.id ? { ...l, notes: newNotes } : l
                        )
                        );
                    }}
                    />
                ) : (
                    <pre className={styles.notesPre}>{selectedLesson.notes}</pre>
                )}
                </div>
            </>
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
            bodyStyle={{ height: '80vh', padding: 0 }}
            centered
        >
            {selectedLesson && (
            <iframe
                src={selectedLesson.whiteboardUrl}
                className={styles.whiteboardIframe}
                title="Whiteboard"
            />
            )}
        </Modal>
        </Layout>
    );
}
