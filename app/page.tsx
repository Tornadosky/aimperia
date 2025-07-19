'use client';

import { Button, Layout, Row, Col, Typography } from 'antd';
import Link from 'next/link';
import styles from './page.module.css';

const { Title, Paragraph } = Typography;
const { Content } = Layout;

export default function LandingPage() {
  return (
    <Layout className={styles.layout}>
      <Content className={styles.content}>
        {/* Section 1: Hero */}
        <section className={styles.hero}>
          <Title>Aimperia</Title>
          <Paragraph>
            Интерактивная платформа для онлайн-занятий с возможностью видеосвязи, доской и автоконспектами.
          </Paragraph>
          <div>
            <Link href="/signup">
              <Button type="primary" size="large" style={{ marginRight: '10px' }}>Регистрация</Button>
            </Link>
            <Link href="/signin">
              <Button size="large">Войти</Button>
            </Link>
          </div>
        </section>

        {/* Section 2: Видеосвязь */}
        <section className={styles.section}>
          <Row gutter={32} align="middle">
            <Col md={12}>
              <Title level={2}>Созвон прямо на платформе</Title>
              <Paragraph>
                Интеграция Zoom/Google Meet позволяет ученикам и преподавателям общаться в реальном времени без сторонних приложений.
              </Paragraph>
            </Col>
            <Col md={12}>
              <img src="/video-call.svg" alt="Video call" className={styles.image} />
            </Col>
          </Row>
        </section>

        {/* Section 3: Интерактивная доска */}
        <section className={styles.section}>
          <Row gutter={32} align="middle">
            <Col md={12} order={2}>
              <Title level={2}>Интерактивная доска для каждого урока</Title>
              <Paragraph>
                Новая доска создаётся для каждого урока, сохраняется и доступна для просмотра в любое время.
              </Paragraph>
            </Col>
            <Col md={12} order={1}>
              <img src="/whiteboard.svg" alt="Whiteboard" className={styles.image} />
            </Col>
          </Row>
        </section>

        {/* Section 4: Конспект с урока */}
        <section className={styles.section}>
          <Row gutter={32} align="middle">
            <Col md={12}>
              <Title level={2}>Автоматический конспект</Title>
              <Paragraph>
                Платформа автоматически создаёт конспект из сказанного и выделенного на доске. Учитель может редактировать его.
              </Paragraph>
            </Col>
            <Col md={12}>
              <img src="/notes.svg" alt="Notes" className={styles.image} />
            </Col>
          </Row>
        </section>

        {/* Section 5: Уроки по коду */}
        <section className={styles.section}>
          <Row gutter={32} align="middle">
            <Col md={12} order={2}>
              <Title level={2}>Создание и присоединение к урокам</Title>
              <Paragraph>
                Уроки можно создавать и присоединяться к ним по уникальному коду. Удобно и быстро.
              </Paragraph>
            </Col>
            <Col md={12} order={1}>
              <img src="/join-class.svg" alt="Join class" className={styles.image} />
            </Col>
          </Row>
        </section>

        {/* Section 6: Для преподавателей и учеников */}
        <section className={styles.section}>
          <Row gutter={32} align="middle">
            <Col md={12}>
              <Title level={2}>Для учеников и преподавателей</Title>
              <Paragraph>
                Простой и удобный интерфейс для обеих сторон. Преподаватель управляет процессом, ученик легко получает доступ ко всем материалам.
              </Paragraph>
            </Col>
            <Col md={12}>
              <img src="/teacher-student.svg" alt="Teacher and Student" className={styles.image} />
            </Col>
          </Row>
        </section>
      </Content>
    </Layout>
  );
}
