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

import HeaderLogo from '../HeaderLogo/HeaderLogo';

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

const AuthHeader = () => {
    
    const pathname = usePathname()
    
    return (
        <Header className={styles.header} id="app-header">
            <div className={styles.headerContainer}>
                <HeaderLogo />
                <div className={styles.buttons}>
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

export default AuthHeader;
