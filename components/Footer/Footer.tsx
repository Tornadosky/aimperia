
'use client';

import { Layout } from 'antd';
import styles from './Footer.module.css';

const { Footer } = Layout;

const AppFooter = () => {
  return (
    <Footer className={styles.footer}  id='app-footer'>
      © {new Date().getFullYear()} Aimperia. All rights reserved.
    </Footer>
  );
};

export default AppFooter;
