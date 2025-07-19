'use client';

import { useEffect, useState } from 'react';
import { Button, Layout, List, Typography, Space, Card, Modal, Popover } from 'antd';
import {
  PlusOutlined,
  LoginOutlined,
  DesktopOutlined,
  FileTextOutlined,
  TeamOutlined,
  VideoCameraOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import styles from './styles.module.css';
// import Logo from '/logo.svg';

const { Header, Content, Sider } = Layout;
const { Title, Paragraph } = Typography;


const fakeLessons = [
  {
    id: '1',
    title: 'Математика: Уравнения',
    summary: 'Обсудили основные методы решения линейных уравнений.',
  },
  {
    id: '2',
    title: 'Физика: Законы Ньютона',
    summary: 'Разобрали примеры применения второго закона Ньютона.',
  },
];

const AppHeader = ({ isAuthenticated }: { isAuthenticated: boolean }) => {
  return (
    <Header className={styles.header} id='app-header'>
      <div className={styles.logo}>
        <Link href="/">Aimperia</Link>
      </div>
      <div className={styles.buttons}>
        {isAuthenticated ? (
          <Space>
            <Button icon={<PlusOutlined />}>Создать урок</Button>
            <Button icon={<LoginOutlined />}>Присоединиться к уроку</Button>
            <Popover
              content={
                <div>
                  <p><b>Имя:</b> Иван Иванов</p>
                  <p><b>Email:</b> ivan@example.com</p>
                  <Button icon={<LogoutOutlined />} type="link" danger>
                    Выйти
                  </Button>
                </div>
              }
              placement="bottomRight"
            >
              <Button icon={<TeamOutlined />}>Аккаунт</Button>
            </Popover>
          </Space>
        ) : (
          <>
            <Link href="/signin">
              <Button type="default" style={{ marginRight: '8px' }}>Вход</Button>
            </Link>
            <Link href="/signup">
              <Button type="primary">Регистрация</Button>
            </Link>
          </>
        )}
      </div>
    </Header>
  );
};

export default AppHeader;