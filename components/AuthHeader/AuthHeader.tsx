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
import { useTranslations } from 'next-intl';

const { Header, Content, Sider } = Layout;
const { Title, Paragraph } = Typography;

import { usePathname } from 'next/navigation'

import HeaderLogo from '../HeaderLogo/HeaderLogo';


const AuthHeader = () => {
    const t = useTranslations('Header');
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
                                {t('login')}
                            </Button>
                        </Link>
                        <Link href="/signup">
                            <Button
                                type="primary"
                                className={styles.button+' '+ styles.signupButton}
                            >
                                {t('signup')}
                            </Button>
                        </Link>
                    </div>
                </div>
                
            </div>
        </Header>
    );
};

export default AuthHeader;