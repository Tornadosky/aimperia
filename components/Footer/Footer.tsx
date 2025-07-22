"use client";

import { Layout } from "antd";
import styles from "./Footer.module.css";

const { Footer } = Layout;

const AppFooter = () => {
    return (
        <Footer className={styles.footer} id="app-footer">
            <div className={styles.socialLinks}>
                <div style={{paddingTop:'4px'}}>Наши соц. сети:</div>
                <div className={styles.socialLink}>
                    Telegram
                    <img
                        src="/footer/telegramicon.svg"
                        alt="Logo"
                        className={styles.logo}
                    />
                </div>
                <div className={styles.socialLink}>
                    ВКонтакте
                    <img src="/footer/vkicon.svg" alt="Logo" className={styles.logo} />
                </div>
            </div>
            ©{" "} {new Date().getFullYear()} AImperia. All rights reserved.
        </Footer>
    );
};

export default AppFooter;
