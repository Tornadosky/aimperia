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
import Link from "next/link";
import styles from "./styles.module.css";

const { Header, Content, Sider } = Layout;
const { Title, Paragraph } = Typography;

import { usePathname } from 'next/navigation'

const fakeLessons = [
    {
        id: "1",
        title: "Математика: Уравнения",
        summary: "Обсудили основные методы решения линейных уравнений.",
    },
    {
        id: "2",
        title: "Физика: Законы Ньютона",
        summary: "Разобрали примеры применения второго закона Ньютона.",
    },
];
import HeaderLogo from '../HeaderLogo/HeaderLogo';

const AppHeader = () => {
    
    const pathname = usePathname()
    
    return (
        <Header className={styles.header} id="app-header">
            <div className={styles.headerContainer}>
                <HeaderLogo />
                <div className={styles.buttons}>
                    <div className={styles.scrollToLinks}>
                        <div className={styles.scrollToLink}
                            onClick={() => {
                                document
                                    .getElementById("aboutSection")
                                    ?.scrollIntoView({
                                        behavior: "smooth",
                                    });
                                }
                            }
                        >
                            О нас
                        </div>
                        <div className={styles.scrollToLink}
                            onClick={() => {
                                document
                                    .getElementById("teachersSection")
                                    ?.scrollIntoView({
                                        behavior: "smooth",
                                    });
                                }
                            }
                        >
                            Преподаватели
                        </div>
                        <div className={styles.scrollToLink}
                            onClick={() => {
                                document
                                    .getElementById("faqSection")
                                    ?.scrollIntoView({
                                        behavior: "smooth",
                                    });
                                }
                            }
                        >
                            Вопросы
                        </div>
                    </div>
                    <div className={styles.registrationButtons}>
                        <Link href="/signin">
                            <Button
                                type="default"
                                style={{ marginRight: "8px" }}
                                className={styles.button}
                            >
                                Вход
                            </Button>
                        </Link>
                        <Link href="/signup">
                            <Button
                                type="primary"
                                className={styles.button}
                            >
                                Регистрация
                            </Button>
                        </Link>
                    </div>
                </div>
                
            </div>
        </Header>
    );
};

export default AppHeader;
