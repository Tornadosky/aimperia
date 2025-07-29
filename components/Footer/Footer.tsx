"use client";

import { Layout } from "antd";
import styles from "./Footer.module.css";
import { useTranslations } from 'next-intl';
const { Footer } = Layout;

const AppFooter = () => {
    const t = useTranslations('Footer');
    return (
        <Footer className={styles.footer} id="app-footer">
            <div className={styles.socialLinks}>
                <div style={{paddingTop:'4px'}}>{t('socialTitle')}</div>
                <div className={styles.socialLink}>
                    {t('telegram')}
                    <img
                        src="/footer/telegramicon.svg"
                        alt="Logo"
                        className={styles.logo}
                    />
                </div>
                <div className={styles.socialLink}>
                    {t('vk')}
                    <img src="/footer/vkicon.svg" alt="Logo" className={styles.logo} />
                </div>
            </div>
            ©{" "} {new Date().getFullYear()} AImperia. {t('copyright')}
        </Footer>
    );
};

export default AppFooter;
