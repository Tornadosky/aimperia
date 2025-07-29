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
import { useTranslations } from 'next-intl';
import HeaderLogo from '../HeaderLogo/HeaderLogo';

const AppHeader = () => {
    const t = useTranslations('Header');
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
                            {t('scrollLinks.about')}
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
                            {t('scrollLinks.teachers')}
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
                            {t('scrollLinks.faq')}
                        </div>
                    </div>
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
                                className={styles.button}
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

export default AppHeader;