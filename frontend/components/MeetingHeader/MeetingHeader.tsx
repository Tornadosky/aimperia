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

import { logout } from "@/app/lib/auth";

const { Header, Content, Sider } = Layout;
const { Title, Paragraph } = Typography;

import { usePathname } from 'next/navigation';
import HeaderLogo from '../HeaderLogo/HeaderLogo';

import { useAuth } from '@/app/context/AuthContext';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

const MeetingHeader = () => {
    const { setUser, user } = useAuth();
    const router = useRouter();
    const t = useTranslations('Header');
    
    return (
        <Header className={styles.header} id="app-header">
            <div className={styles.headerContainer}>
                <HeaderLogo />
                <div className={styles.buttons}>
                    <Space>
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
                                        <b>{t('name')}:</b> {user?.firstName ? user?.firstName + ' ' + user?.lastName : t('guest')}
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
                            <Button icon={<TeamOutlined />} className={styles.button}>
                                {t('account')}
                            </Button>
                        </Popover>
                    </Space>
                </div>
            </div>
        </Header>
    );
};

export default MeetingHeader;