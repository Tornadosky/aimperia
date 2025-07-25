"use client";

import { Button, Layout, Row, Col, Typography, Divider, Card, Input, Form, Table, Collapse } from "antd";
import {useState, useEffect} from "react";

import { LineChartOutlined, DesktopOutlined, CheckCircleOutlined, CloseCircleOutlined, MailOutlined } from "@ant-design/icons";
import { BsStars, BsSliders  } from "react-icons/bs";
import Link from "next/link";
import styles from "./page.module.css";

const { Title, Paragraph } = Typography;
const { Content } = Layout;

export default function LandingPage() {
    
    
    const [collapseActiveKey, setCollapseActiveKey] = useState<string | string[]>(['1']);
    
    return (
        <Layout className={styles.layout}>
            <Content className={styles.content}>
                {/* Hero Section */}
                <section className={styles.hero}>
                    <div>
                        <Title level={1} style={{
                            marginBottom: "50px !important",
                        }}>AImperia: Первая платформа в мире, которая позволяет тебе учится в разы <span style={{textWrap:'nowrap'}}>быстрее <LineChartOutlined style={{color:'#3d8eff'}} /></span></Title>
                        {/* <Paragraph>
                            Интерактивная платформа для онлайн-занятий с
                            возможностью видеосвязи, доской и автоконспектами.
                        </Paragraph> */}
                        <div>
                            <Link href="/signup">
                                <Button
                                    type="primary"
                                    size="large"
                                    style={{ marginRight: "10px", width: "200px", height: "50px", fontSize: "20px", borderRadius: "50px" }}
                                    className={styles.landingButton}
                                >
                                    Начать
                                </Button>
                            </Link>
                            <Link href="/signin">
                                <Button size="large" style={{width: "250px", height: "50px", fontSize: "20px", borderRadius: "50px"}}
                                    className={styles.landingButton}
                                >Смотреть видео</Button>
                            </Link>
                        </div>
                    </div>
                    <div
                        className={styles.heroImageContainer}
                    >
                        <img src='/landing/hero.png' alt="Hero" className={styles.heroImage} />
                        <div className={styles.heroImageOverlay}>
                            Начните пользоваться уже сегодня!
                        </div>
                    </div>
                </section>
                
                {/* Features Section */}
                <section className={styles.section}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'start', justifyContent: 'center', gap:'50px' }}>
                        <div className={styles.info1Item}>
                            <div className={styles.info1ItemTitle}>
                                <DesktopOutlined className={styles.info1ItemIcon}/> Уроки с видео и доской
                            </div>
                            <Divider style={{ margin: '20px 0' }} />
                            <div className={styles.info1ItemDescription}>
                                Платформа позволяет проводить уроки с
                                видеосвязью и интерактивной доской, что делает
                                обучение более эффективным.
                            </div>
                        </div>
                        <div className={styles.info1Item}>
                            <div className={styles.info1ItemTitle}>
                                <BsStars className={styles.info1ItemIcon}/> ИИ для автоматического конспекта
                            </div>
                            <Divider style={{ margin: '20px 0' }} />
                            <div className={styles.info1ItemDescription}>
                                Искусственный интеллект автоматически
                                создаёт конспект из сказанного на уроке и
                                выделенного на доске, что позволяет ученикам
                                сосредоточиться на обучении.
                            </div>
                        </div>
                        <div className={styles.info1Item}>
                            <div className={styles.info1ItemTitle}>
                                <BsSliders className={styles.info1ItemIcon}/> Удобный интерфейс
                            </div>
                            <Divider style={{ margin: '20px 0' }} />
                            <div className={styles.info1ItemDescription}>
                                Платформа имеет простой и интуитивно понятный
                                интерфейс, что позволяет легко начать обучение
                                без лишних настроек.
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* How It Works Section */}
                <section className={styles.section}>
                    <div className={styles.sectionTitle}>Легко начать пользоваться</div>
                    <div>
                        <Row gutter={24}>
                            <Col span={18}>
                                <Row gutter={24} style={{ marginBottom: '24px' }}>
                                    <Col span={8}>
                                        <div
                                            className={styles.imageInfoItem}
                                            style={{
                                                backgroundImage: 'url(/landing/imageInfo1.png)',
                                            }}
                                        >   
                                            <div className={styles.imageInfoItemContent}>
                                                <div className={styles.imageInfoTitle}>Создание урока</div>
                                                <div  className={styles.imageInfoDescription}>
                                                    Создайте новый урок с помощью
                                                    простого интерфейса.
                                                </div>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col span={16}>
                                        <div 
                                            className={styles.imageInfoItem}
                                            style={{
                                                backgroundImage: 'url(/landing/imageInfo2.png)',
                                            }}
                                        >
                                            <div className={styles.imageInfoItemContent}>
                                                <div className={styles.imageInfoTitle}>Присоединение к уроку</div>
                                                <div className={styles.imageInfoDescription}>
                                                    Присоединяйтесь к уроку по уникальному
                                                    коду, который предоставляет
                                                    преподаватель.
                                                </div>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                                <Row gutter={24}>
                                    <Col span={16}>
                                        <div 
                                            className={styles.imageInfoItem}
                                            style={{
                                                backgroundImage: 'url(/landing/imageInfo3.png)',
                                            }}
                                        >
                                            <div className={styles.imageInfoItemContent}>
                                                <div className={styles.imageInfoTitle}>Видеозвонок и доска</div>
                                                <div className={styles.imageInfoDescription}>
                                                    Используйте встроенный видеозвонок и
                                                    интерактивную доску для проведения
                                                    уроков.
                                                </div>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col span={8}>
                                        <div 
                                            className={styles.imageInfoItem}
                                            style={{
                                                backgroundImage: 'url(/landing/imageInfo4.png)',
                                            }}
                                        >
                                            <div className={styles.imageInfoItemContent}>
                                                <div className={styles.imageInfoTitle}>Автоконспект</div>
                                                <div className={styles.imageInfoDescription}>
                                                    Платформа автоматически создаёт
                                                    конспект из сказанного на уроке и
                                                    выделенного на доске.
                                                </div>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            </Col>
                            <Col span={6}>
                                <div 
                                    className={styles.imageInfoItem}
                                    style={{
                                        backgroundImage: 'url(/landing/imageInfo5.png)',
                                        height: '100%'
                                    }}
                                >
                                    <div className={styles.imageInfoItemContent}>
                                        <div className={styles.imageInfoTitle}>Начните обучение</div>
                                        <div className={styles.imageInfoDescription}>
                                            Зарегистрируйтесь и начните обучение уже
                                            сегодня!
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </section>
                
                {/* Statistics Section */}
                <section className={styles.section}>
                    <div className={styles.sectionUsers}>
                        <div className={styles.sectionUsersItem}>
                            <div className={styles.sectionUsersTitle}>
                                1000+ пользователей
                            </div>
                            <div className={styles.sectionUsersDescription}>
                                Платформа уже используется более чем 1000
                                пользователями, которые оценили её удобство и
                                функциональность.
                            </div>
                        </div>
                        <div className={styles.sectionUsersVertDivider}></div>
                        <div className={styles.sectionUsersItem}>
                            <div className={styles.sectionUsersTitle}>
                                500+ уроков
                            </div>
                            <div className={styles.sectionUsersDescription}>
                                На платформе уже проведено более 500 уроков,
                                что подтверждает её эффективность и
                                востребованность.
                            </div>
                        </div>
                        <div className={styles.sectionUsersVertDivider}></div>
                        <div className={styles.sectionUsersItem}>
                            <div className={styles.sectionUsersTitle}>
                                40+ стран
                            </div>
                            <div className={styles.sectionUsersDescription}>
                                Платформа доступна в более чем 40 странах,
                                что позволяет пользователям из разных уголков
                                мира учиться и преподавать.
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* Contact Section */}
                <section className={styles.section}>
                    <div className={styles.sectionFormBackground}>
                        <img src="/landing/landingBooks.png" className={styles.sectionFormBooks} />
                        <div style={{
                            textAlign: 'center',
                            marginBottom: '10px',
                            fontSize: '36px',
                            color: '#fff',
                        }}>Задайте нам любой вопрос</div>
                        <div style={{ color: '#fff', textAlign: 'center', marginBottom: '50px', fontSize: '18px' }}>
                            Если у вас есть вопросы или предложения, пожалуйста, заполните форму
                            ниже. Мы обязательно свяжемся с вами!
                        </div>
                        <div className={styles.sectionFormContainer}>
                            <Input placeholder="Имя"  className={styles.sectionFormInput}/>
                            <Input type="email" placeholder="Email"  className={styles.sectionFormInput}/>
                            <Input placeholder="Телефон"  className={styles.sectionFormInput}/>
                            <Button color="purple" variant="solid" style={{ width: '100%' }}
                                className={styles.sectionFormInput}
                                onClick={() => alert('Спасибо за ваш вопрос! Мы свяжемся с вами в ближайшее время.')}>
                                Задать вопрос
                            </Button>
                        </div>
                    </div>
                </section>
                
                {/* About Section */}
                <section className={styles.section} id="aboutSection">
                    <div className={styles.sectionAbout}>
                        <div className={styles.sectionTitle}>
                            Что такое платформа AImperia?
                        </div>
                        <div style={{
                            width: '60%',
                            height: '2px',
                            backgroundColor: '#1890ff',
                            margin: '40px auto',
                            borderRadius: '1px',
                        }} />
                        <div className={styles.sectionAboutItems}>
                            <div className={styles.sectionAboutItem}>
                                <div className={styles.sectionAboutItemTitle}>
                                    Лучшая платформа для онлайн-занятий
                                </div>
                                <ul className={styles.sectionAboutItemDescription}>
                                    <li>
                                        Платформа AImperia - это первая в мире
                                        платформа, которая позволяет учиться в
                                        разы быстрее благодаря использованию
                                        искусственного интеллекта.
                                    </li>
                                    <li>
                                        Она предоставляет возможность проводить
                                        онлайн-занятия с видеосвязью и
                                        интерактивной доской.
                                    </li>
                                    <li>
                                        Искусственный интеллект автоматически
                                        создаёт конспект из сказанного на уроке
                                        и выделенного на доске.
                                    </li>
                                </ul>
                            </div>
                            <div className={styles.sectionAboutItem}>
                                <div className={styles.sectionAboutItemTitle}>
                                    Простота и удобство
                                </div>
                                <ul className={styles.sectionAboutItemDescription}>
                                    <li>
                                        Платформа имеет простой и интуитивно
                                        понятный интерфейс, что позволяет легко
                                        начать обучение без лишних настроек.
                                    </li>
                                    <li>
                                        Платформа доступна в более чем 40 странах,
                                        что позволяет пользователям из разных
                                        уголков мира учиться и преподавать.
                                    </li>
                                    <li>
                                        Платформа уже используется более чем 1000
                                        пользователями, которые оценили её
                                        удобство и функциональность.
                                    </li>
                                </ul>
                            </div>
                            <div className={styles.sectionAboutItem}>
                                <div className={styles.sectionAboutItemTitle}>
                                    Начните обучение уже сегодня!
                                </div>
                                <ul className={styles.sectionAboutItemDescription}>
                                    <li>
                                        Зарегистрируйтесь на платформе и начните
                                        обучение уже сегодня!
                                    </li>
                                    <li>
                                        Платформа предоставляет возможность
                                        создавать уроки, присоединяться к ним и
                                        использовать встроенный видеозвонок и
                                        интерактивную доску.
                                    </li>
                                    <li>
                                        Платформа автоматически создаёт конспект
                                        из сказанного на уроке и выделенного на
                                        доске, что позволяет сосредоточиться на
                                        обучении.
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* Pricing Section */}
                <section className={styles.section}>
                    <div className={styles.sectionPrice}>
                        <div className={styles.sectionTitle}>
                            Стоимость занятий
                        </div>
                        <Divider style={{ marginBottom: '40px' }} />
                        <div
                            className={styles.priceCardsContainer}
                        >
                            <Card
                                className={styles.priceCard}
                            >
                                <div className={styles.priceCardTitle}>
                                    Одна лекция со своим преподавателем (2 часа)
                                </div>
                                <div className={styles.priceCardPrice}>
                                    350 ₽
                                </div>
                                <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css"></link>
                                <ul className={styles.priceCardFeatures}>
                                    <li>Генерация конспекта с помощью ИИ</li>
                                    <li>Видеозвонок с преподавателем</li>
                                    <li>Интерактивная доска</li>
                                    <li>Поддержка в чате</li>
                                    <li className={styles.priceCardNotFeature}>Запись урока</li>
                                    <li className={styles.priceCardNotFeature}>Возможность задать вопрос ИИ</li>
                                    <li className={styles.priceCardNotFeature}>Возсожность создать pdf файл конспекта</li>
                                    <li className={styles.priceCardNotFeature}>Занятие с опытным преподавателем</li>
                                    <li className={styles.priceCardNotFeature}>Домашнее задание</li>
                                    <li className={styles.priceCardNotFeature}>Проверка домашнего задания</li>
                                    <li className={styles.priceCardNotFeature}>Индивидуальный подход</li>
                                </ul>
                            </Card>
                            <Card
                                className={styles.priceCard}
                            >
                                <div className={styles.priceCardTitle}>
                                    Одна лекция со своим преподавателем<span style={{ color: '#3d8eff', fontWeight: 'bold' }}>+</span>(2 часа)
                                </div>
                                <div className={styles.priceCardPrice}>
                                    500 ₽
                                </div>
                                <ul className={styles.priceCardFeatures}>
                                    <li>Генерация конспекта с помощью ИИ</li>
                                    <li>Видеозвонок с преподавателем</li>
                                    <li>Интерактивная доска</li>
                                    <li>Поддержка в чате</li>
                                    <li>Запись урока</li>
                                    <li>Возможность задать вопрос ИИ</li>
                                    <li>Возсожность создать pdf файл конспекта</li>
                                    <li className={styles.priceCardNotFeature}>Занятие с опытным преподавателем</li>
                                    <li className={styles.priceCardNotFeature}>Домашнее задание</li>
                                    <li className={styles.priceCardNotFeature}>Проверка домашнего задания</li>
                                    <li className={styles.priceCardNotFeature}>Индивидуальный подход</li>
                                </ul>
                            </Card>
                            <Card
                                className={styles.priceCardAnimated}
                            >
                                <div className={styles.priceCardTitle}>
                                    Одна лекция с преподавателем AImperia (2 часа)
                                </div>
                                <div className={styles.priceCardPrice}>
                                    1400 ₽
                                </div>
                                <ul className={styles.priceCardFeatures}>
                                    <li>Генерация конспекта с помощью ИИ</li>
                                    <li>Видеозвонок с преподавателем</li>
                                    <li>Интерактивная доска</li>
                                    <li>Поддержка в чате</li>
                                    <li>Запись урока</li>
                                    <li>Возможность задать вопрос ИИ</li>
                                    <li>Возсожность создать pdf файл конспекта</li>
                                    <li>Занятие с опытным преподавателем</li>
                                    <li>Домашнее задание</li>
                                    <li>Проверка домашнего задания</li>
                                    <li>Индивидуальный подход</li>
                                </ul>
                            </Card>
                        </div>
                    </div>
                </section>
                
                {/* For Who Section */}
                <section className={styles.section}>
                    <div className={styles.sectionForWho}>
                        <div className={styles.sectionTitle}>
                            Для кого подходит платформа AImperia?
                        </div>
                        <Divider style={{ marginBottom: '40px' }} />
                        <div className={styles.sectionForWhoItems}
                            style={{
                                backgroundImage: 'url(/landing/clouds.png)',
                            }}>
                            <div className={styles.sectionForWhoItem}>
                                <div className={styles.sectionForWhoItemIcon}>
                                    &#129299;
                                </div>
                                <div className={styles.sectionForWhoItemTitle}
                                >
                                    Для учеников
                                </div>
                            </div>
                            <div className={styles.sectionForWhoItem}>
                                <div className={styles.sectionForWhoItemIcon}>
                                    &#129488;
                                </div>
                                <div className={styles.sectionForWhoItemTitle}>
                                    Для преподавателей
                                </div>
                            </div>
                            <div className={styles.sectionForWhoItem}>
                                <div className={styles.sectionForWhoItemIcon}>
                                    &#128640;
                                </div>
                                <div className={styles.sectionForWhoItemTitle}>
                                    Кто хочет учится быстрее
                                </div>
                            </div>
                            <div className={styles.sectionForWhoItem}>
                                <div className={styles.sectionForWhoItemIcon}>
                                    &#129302;
                                </div>
                                <div className={styles.sectionForWhoItemTitle}>
                                    Кто хочет использовать ИИ в обучении
                                </div>
                            </div>
                            <div className={styles.sectionForWhoItem}>
                                <div className={styles.sectionForWhoItemIcon}>
                                    &#128187;
                                </div>
                                <div className={styles.sectionForWhoItemTitle}>
                                    Преподаватели, которые хотят
                                    использовать новые технологии в обучении
                                </div>
                            </div>
                            <div className={styles.sectionForWhoItem}>
                                <div className={styles.sectionForWhoItemIcon}>
                                    &#128106;
                                </div>
                                <div className={styles.sectionForWhoItemTitle}>
                                    Родители, которые хотят
                                    обеспечить своим детям качественное образование
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section className={styles.section}>
                    <div className={styles.sectionTitle}>
                        Как начать пользоваться платформой AImperia?
                    </div>
                    <Divider style={{ marginBottom: '40px' }} />
                    <div className={styles.sectionHowToStartContainer}>
                        <div className={styles.sectionHowToStartTopText}>
                            Через минуту вы уже на уроке!
                        </div>
                        <div className={styles.sectionHowToStartItem}>
                            <div className={styles.sectionHowToStartItemTitle}>
                                01
                            </div>
                            <div className={styles.sectionHowToStartItemDescription}>
                                Зарегистрируйтесь на платформе AImperia
                            </div>
                        </div>
                        <img src="/landing/arrow.png" alt="Arrow" className={styles.sectionHowToStartArrow} />
                        <div className={styles.sectionHowToStartItem}>
                            <div className={styles.sectionHowToStartItemTitle}>
                                02
                            </div>
                            <div className={styles.sectionHowToStartItemDescription}>
                                Создайте новый урок или присоединитесь к уже существующему
                            </div>
                        </div>
                        <img src="/landing/arrow.png" alt="Arrow" className={styles.sectionHowToStartArrow} />
                        <div className={styles.sectionHowToStartItem}>
                            <div className={styles.sectionHowToStartItemTitle}>
                                03
                            </div>
                            <div className={styles.sectionHowToStartItemDescription}>
                                Вы пользуетесь платформой :)
                            </div>
                        </div>
                    </div>
                    <Button
                        type="primary"
                        size="large"
                        style={{ marginTop: "50px", width: "300px", height: "70px", fontSize: "30px", borderRadius: "50px", backgroundColor: "#3d98ff" }}
                        className={styles.landingButton}
                        onClick={() => window.location.href = '/signup'}
                    >
                        Начать сейчас
                    </Button>
                </section>
                
                {/* Statistics Section */}
                <section className={styles.section}>
                    <div className={styles.sectionTitle}>
                        Лучшая платформа для онлайн-занятий
                    </div>
                    <Divider style={{ marginBottom: '40px' }} />
                    <div className={styles.sectionAdvantagesItems}>
                        <div className={styles.sectionAdvantagesItem}>
                            <div className={styles.sectionAdvantagesItemTitle}>
                                +200%
                            </div>
                            <div className={styles.sectionAdvantagesItemDescription}>
                                Пользователи AImperia учатся на 200% быстрее, чем на традиционных платформах.
                            </div>
                        </div>
                        <div className={styles.sectionAdvantagesVertDivider}></div>
                        <div className={styles.sectionAdvantagesItem}>
                            <div className={styles.sectionAdvantagesItemTitle}>
                                40%
                            </div>
                            <div className={styles.sectionAdvantagesItemDescription}>
                                Пользователи AImperia в среднем имеют оценки на 40% выше, чем на традиционных платформах.
                            </div>
                        </div>
                        <div className={styles.sectionAdvantagesVertDivider}></div>
                        <div className={styles.sectionAdvantagesItem}>
                            <div className={styles.sectionAdvantagesItemTitle}>
                                89
                            </div>
                            <div className={styles.sectionAdvantagesItemDescription}>
                                Средний балл по ЕГЭ у пользователей AImperia составляет 89 баллов.
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* Features Comparison Section */}
                <section className={styles.section}>
                    <div className={styles.sectionTitle}>
                        Особенности платформы AImperia
                    </div>
                    <Divider style={{ marginBottom: '40px' }} />
                    <Table
                        className={styles.featuresTable}
                        pagination={false}
                        columns={[
                            {
                                title: '',
                                dataIndex: 'feature',
                                key: 'feature',
                                render: (text) => <div style={{ marginLeft: '50px' }}>{text}</div>,
                            },
                            {
                                title: 'AImperia',
                                dataIndex: 'AImperia',
                                key: 'AImperia',
                                render: (text) => <div style={{ textAlign: 'center' }}>{text}</div>,
                            },
                            {
                                title: 'Другие школы',
                                dataIndex: 'other',
                                key: 'other',
                                render: (text) => <div style={{ textAlign: 'center' }}>{text}</div>,
                            },
                            {
                                title: 'Zoom',
                                dataIndex: 'zoom',
                                key: 'zoom',
                                render: (text) => <div style={{ textAlign: 'center' }}>{text}</div>,
                            }
                        ]}
                        dataSource={[
                            {
                                key: '1',
                                feature: 'Видеозвонок',
                                AImperia: <CheckCircleOutlined className={styles.featuresCheckmark} />,
                                other: <CheckCircleOutlined className={styles.featuresCheckmark} />,
                                zoom: <CheckCircleOutlined className={styles.featuresCheckmark} />
                            },
                            {
                                key: '2',
                                feature: 'Интерактивная доска',
                                AImperia: <CheckCircleOutlined className={styles.featuresCheckmark} />,
                                other: <CheckCircleOutlined className={styles.featuresCheckmark} />,
                                zoom: <CheckCircleOutlined className={styles.featuresCheckmark} />
                            },
                            {
                                key: '8',
                                feature:
                                    'Занятие с опытным преподавателем',
                                AImperia: <CheckCircleOutlined className={styles.featuresCheckmark} />,
                                other: <CheckCircleOutlined className={styles.featuresCheckmark} />,
                                zoom: <CloseCircleOutlined className={styles.featuresCross} />
                            },
                            {
                                key: '4',
                                feature: 'Поддержка в чате',
                                AImperia: <CheckCircleOutlined className={styles.featuresCheckmark} />,
                                other: <CheckCircleOutlined className={styles.featuresCheckmark} />,
                                zoom: <CloseCircleOutlined className={styles.featuresCross} />
                            },
                            {
                                key: '3',
                                feature: 'Автоконспект',
                                AImperia: <CheckCircleOutlined className={styles.featuresCheckmark} />,
                                other: <CloseCircleOutlined className={styles.featuresCross} />,
                                zoom: <CloseCircleOutlined className={styles.featuresCross} />
                            },
                            {
                                key: '5',
                                feature: 'Запись урока',
                                AImperia: <CheckCircleOutlined className={styles.featuresCheckmark} />,
                                other: <CloseCircleOutlined className={styles.featuresCross} />,
                                zoom: <CloseCircleOutlined className={styles.featuresCross} />
                            },
                            {
                                key: '6',
                                feature: 'Возможность задать вопрос ИИ',
                                AImperia: <CheckCircleOutlined className={styles.featuresCheckmark} />,
                                other: <CloseCircleOutlined className={styles.featuresCross} />,
                                zoom: <CloseCircleOutlined className={styles.featuresCross} />
                            },
                            {
                                key: '7',
                                feature: 'Создание pdf файла конспекта',
                                AImperia: <CheckCircleOutlined className={styles.featuresCheckmark} />,
                                other: <CloseCircleOutlined className={styles.featuresCross} />,
                                zoom: <CloseCircleOutlined className={styles.featuresCross} />
                            },
                        ]}
                    />
                </section>
                
                {/* Teachers Section */}
                <section className={styles.section} id="teachersSection">
                    <div className={styles.sectionTitle}>
                        Преподаватели AImperia
                    </div>
                    <Divider style={{ marginBottom: '40px' }} />
                    <div className={styles.sectionTeachers}>
                        <div className={styles.sectionTeachersItem}>
                            <img src="/landing/teacher1.png" alt="Teacher 1" className={styles.sectionTeachersItemImage} />
                            <div className={styles.sectionTeachersItemName}>
                                Иван Иванов
                            </div>
                            <div className={styles.sectionTeachersItemSubject}>
                                Математика
                            </div>
                            <div className={styles.sectionTeachersItemDescription}>
                                Преподаватель математики с 10-летним опытом работы. Помог
                                более 1000 ученикам подготовиться к ЕГЭ и ОГЭ.
                            </div>
                        </div>
                        <div className={styles.sectionTeachersItem}>
                            <img src="/landing/teacher2.png" alt="Teacher 2" className={styles.sectionTeachersItemImage} />
                            <div className={styles.sectionTeachersItemName}>
                                Анна Петрова
                            </div>
                            <div className={styles.sectionTeachersItemSubject}>
                                Физика
                            </div>
                            <div className={styles.sectionTeachersItemDescription}>
                                Преподаватель физики с 8-летним опытом работы. Помогла
                                более 800 ученикам подготовиться к ЕГЭ и ОГЭ.
                            </div> 
                        </div>
                        <div className={styles.sectionTeachersItem}>
                            <img src="/landing/teacher3.png" alt="Teacher 3" className={styles.sectionTeachersItemImage} />
                            <div className={styles.sectionTeachersItemName}>
                                Мария Смирнова
                            </div>
                            <div className={styles.sectionTeachersItemSubject}>
                                Химия
                            </div>
                            <div className={styles.sectionTeachersItemDescription}>
                                Преподаватель химии с 5-летним опытом работы. Помогла
                                более 500 ученикам подготовиться к ЕГЭ и ОГЭ.
                            </div>
                        </div>
                        <div className={styles.sectionTeachersItem}>
                            <img src="/landing/teacher4.png" alt="Teacher 4" className={styles.sectionTeachersItemImage} />
                            <div className={styles.sectionTeachersItemName}>
                                Алексей Кузнецов
                            </div>
                            <div className={styles.sectionTeachersItemSubject}>
                                Информатика
                            </div>
                            <div className={styles.sectionTeachersItemDescription}>
                                Преподаватель информатики с 7-летним опытом работы. Помог
                                более 600 ученикам подготовиться к ЕГЭ и ОГЭ.
                            </div>
                        </div>
                        <div className={styles.sectionTeachersItem}>
                            <img src="/landing/teacher5.png" alt="Teacher 5" className={styles.sectionTeachersItemImage} />
                            <div className={styles.sectionTeachersItemName}>
                                Дмитрий Сидоров
                            </div>
                            <div className={styles.sectionTeachersItemSubject}>
                                Биология
                            </div>
                            <div className={styles.sectionTeachersItemDescription}>
                                Преподаватель биологии с 6-летним опытом работы. Помог
                                более 700 ученикам подготовиться к ЕГЭ и ОГЭ.
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* Reviews Section */}
                <section className={styles.sectionReviews}
                    style={{
                        backgroundImage: 'url(/landing/reviewsBackground.png)',
                        backgroundRepeat: 'repeat',
                        backgroundSize: '800px auto',
                 }}
                >
                    <div className={styles.sectionReviewsTitle}>
                        Отзывы пользователей
                    </div>
                    <div className={styles.sectionReviewsItems}
                    >
                        <div className={styles.sectionReviewItem}>
                            <div className={styles.sectionReviewText}>
                                &quot;Платформа AImperia - это просто находка! Я
                                учусь на ней уже несколько месяцев и заметил,
                                что стал учиться гораздо быстрее. Очень
                                рекомендую!&quot;
                            </div>
                            <div className={styles.sectionReviewAuthor}>
                                Алексей, ученик
                            </div>
                        </div>
                        <div className={styles.sectionReviewItem}>
                            <div className={styles.sectionReviewText}>
                                &quot;Я использую платформу AImperia для своих
                                уроков и очень доволен. Интерактивная доска и
                                автоконспект - это просто супер!&quot;
                            </div>
                            <div className={styles.sectionReviewAuthor}>
                                Мария, преподаватель
                            </div>
                        </div>
                        <div className={styles.sectionReviewItem}>
                            <div className={styles.sectionReviewText}>
                                &quot;Платформа AImperia - это лучший способ
                                учиться! Я уже подготовился к ЕГЭ на 90 баллов
                                благодаря этой платформе.&quot;
                            </div>
                            <div className={styles.sectionReviewAuthor}>
                                Иван, ученик
                            </div>
                        </div>
                        <div className={styles.sectionReviewItem}>
                            <div className={styles.sectionReviewText}>
                                &quot;Я использую платформу AImperia для своих
                                уроков и очень доволен. Интерактивная доска и
                                автоконспект - это просто супер!&quot;
                            </div>
                            <div className={styles.sectionReviewAuthor}>
                                Анна, преподаватель
                            </div>
                        </div>
                        <div className={styles.sectionReviewItem}>
                            <div className={styles.sectionReviewText}>
                                &quot;Платформа AImperia - это просто находка! Я
                                учусь на ней уже несколько месяцев и заметил,
                                что стал учиться гораздо быстрее. Очень
                                рекомендую!&quot;
                            </div>
                            <div className={styles.sectionReviewAuthor}>
                                Дмитрий, ученик
                            </div>
                        </div>
                        <div className={styles.sectionReviewItem}>
                            <div className={styles.sectionReviewText}>
                                &quot;Я использую платформу AImperia для своих
                                уроков и очень доволен. Интерактивная доска и
                                автоконспект - это просто супер!&quot;
                            </div>
                            <div className={styles.sectionReviewAuthor}>
                                Алексей, преподаватель
                            </div>
                        </div>
                        
                    </div>
                </section>
                
                {/* FAQ */}
                <section className={styles.section} id="faqSection">
                    <div className={styles.sectionTitle}>
                        Часто задаваемые вопросы
                    </div>
                    <Divider style={{ marginBottom: '40px' }} />
                    <Collapse
                        activeKey={collapseActiveKey}
                        onChange={(key) => {
                            if (key.length>0)
                                setCollapseActiveKey([key[key.length - 1]])
                            
                        }}
                        expandIconPosition="end"
                        className={styles.faqCollapse}
                        items={[
                            {
                                key: '1',
                                label: 'Чем отличается AImperia от таких платформ как Zoom, Microsoft Teams или Google Meets?',
                                children: <span>AImperia - это специализированная платформа для онлайн-занятий, которая включает в себя все необходимые инструменты для обучения: 
                                видеозвонок, интерактивную доску, автоконспект и многое другое. В отличие от Zoom,
                                Microsoft Teams или Google Meets, AImperia предоставляет готовое решение для образовательных учреждений и преподавателей.
                                В дополнение, AImperia автоматически создаёт конспект из сказанного на уроке и выделенного на доске, что позволяет сосредоточиться на обучении,
                                а не на написании конспекта и попытках успеть понять преподавателя и суммаризировать информацию.</span>,
                            },
                            {
                                key: '2',
                                label: 'Насколько качественно проводятся занятия и насколько сильно ИИ помогает при обучении?',
                                children: <span>
                                    AImperia предоставляет возможность проводить занятия с опытными преподавателями, которые имеют большой опыт работы в сфере образования.
                                    ИИ помогает в создании автоконспекта, который автоматически записывает все, что говорится на уроке, и выделяет важные моменты на интерактивной доске.
                                    После урока вы сможете просмотреть, повторить или скачать конспект в формате PDF.
                                    Также, ИИ позволяет задавать вопросы во время урока и получать ответы на них, что делает обучение более интерактивным и эффективным.
                                </span>,
                            },
                            {
                                key: '3',
                                label: 'Как записаться на занятие и как выбрать преподавателя?',
                                children: <span>
                                    Чтобы записаться на занятие, вам нужно зарегистрироваться на платформе AImperia и написать нам, какой предмет и уровень обучения вас интересует.
                                    Мы поможем вам выбрать подходящего преподавателя и договориться о времени занятия.
                                </span>,
                            },
                            {
                                key: '4',
                                label: 'Как проходит занятие и какие инструменты используются?',
                                children: <span>
                                    Занятие проходит в формате видеозвонка с использованием интерактивной доски, на которой преподаватель может рисовать, писать и выделять важные моменты.
                                    Также используется автоконспект, который автоматически записывает все, что говорится на уроке, и выделяет важные моменты на интерактивной доске.
                                    После урока вы сможете просмотреть, повторить или скачать конспект в формате PDF.
                                </span>,
                            },
                            {
                                key: '5',
                                label: 'Могу ли я заниматься на этой платформе, если у меня есть свой преподаватель?',
                                children: <span>
                                    Да, вы можете использовать платформу AImperia для проведения занятий со своим преподавателем.
                                    Для этого вам и преподавателю нужно зарегистрироваться на платформе и договориться о времени занятия.
                                    Вы сможете использовать все инструменты платформы, включая видеозвонок, интерактивную доску и автоконспект.
                                </span>,
                            },
                            {
                                key: '6',
                                label: 'Предоставляет ли AImperia поддержку, если я занимаюсь со своим преподавателем?',
                                children: <span>
                                    Да, AImperia предоставляет поддержку всем пользователям, независимо от того, занимаются ли они со своим преподавателем или с преподавателями платформы.
                                    Вы можете обратиться в службу поддержки по любым вопросам, связанным с использованием платформы, и мы постараемся помочь вам как можно быстрее.
                                </span>,
                            },
                            {
                                key: '7',
                                label: 'Какие предметы я могу изучать на платформе AImperia?',
                                children: <span>
                                    На платформе AImperia вы можете изучать различные предметы, включая математику, физику, химию, информатику и другие.
                                    Если вас интересует какой-то конкретный предмет, напишите нам, и мы постараемся найти подходящего преподавателя для вас.
                                </span>,
                            },
                            {
                                key: '8',
                                label: 'Как я могу связаться с поддержкой AImperia?',
                                children: <span>
                                    Вы можете связаться с поддержкой AImperia через форму обратной связи на сайте, по электронной почте или в чате на платформе.
                                    Мы постараемся ответить на ваш вопрос как можно быстрее.
                                </span>,
                            },
                         ]}
                    >
                    </Collapse>
                </section>
                
                {/* News Section */}
                <section className={styles.section}>
                    <div className={styles.sectionTitle}>
                        Последние новости AImperia
                    </div>
                    <div className={styles.sectionNews}>
                        <div className={styles.sectionNewsItem}>
                            <img src="/landing/news1.png" alt="News 1" className={styles.sectionNewsItemImage} />
                            <div className={styles.sectionNewsItemTitle}>
                                Новая версия AImperia
                            </div>
                            <div className={styles.sectionNewsItemDate}>
                                01.10.2023
                            </div>
                            <div className={styles.sectionNewsItemDescription}>
                                Мы выпустили новую версию платформы AImperia с улучшенным интерфейсом и новыми функциями.
                            </div>
                        </div>
                        <div className={styles.sectionNewsItem}>
                            <img src="/landing/news2.png" alt="News 1" className={styles.sectionNewsItemImage} />
                            <div className={styles.sectionNewsItemTitle}>
                                Новый курс по математике
                            </div>
                            <div className={styles.sectionNewsItemDate}>
                                15.09.2023
                            </div>
                            <div className={styles.sectionNewsItemDescription}>
                                Мы запустили новый курс по математике для учеников 9-11 классов.
                            </div>
                        </div>
                        <div className={styles.sectionNewsItem}>
                            <img src="/landing/news3.png" alt="News 1" className={styles.sectionNewsItemImage} />
                            <div className={styles.sectionNewsItemTitle}>
                                Новый преподаватель
                            </div>
                            <div className={styles.sectionNewsItemDate}>
                                01.09.2023
                            </div>
                            <div className={styles.sectionNewsItemDescription}>
                                Мы пригласили нового преподавателя по физике, который будет проводить занятия на платформе AImperia.
                            </div>
                        </div>
                        <div className={styles.sectionNewsItem}>
                            <img src="/landing/news4.png" alt="News 1" className={styles.sectionNewsItemImage} />
                            <div className={styles.sectionNewsItemTitle}>
                                Новый курс по информатике
                            </div>
                            <div className={styles.sectionNewsItemDate}>
                                20.08.2023
                            </div>
                            <div className={styles.sectionNewsItemDescription}>
                                Мы запустили новый курс по информатике для учеников 9-11 классов.
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* Newsletter */}
                <section className={styles.section}>
                    <div className={styles.sectionNewsletterTitle}>
                        Подпишитесь на нашу рассылку
                    </div>
                    <Divider />
                    <div className={styles.sectionNewsletterSubTitle}>
                        Будьте в курсе последних новостей и обновлений AImperia
                    </div>
                    <Form layout="inline" className={styles.newsletterForm}>
                        <Form.Item>
                            <Input placeholder="Введите ваш email"
                                style={{ width: '300px', height: '60px', fontSize: '16px', borderRadius: '30px', textAlign: 'center' }} 
                                className={styles.landingInput}
                            />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit"
                                icon={<MailOutlined />}
                                style={{ width: '300px', height: '60px', fontSize: '16px', borderRadius: '30px' }}
                                className={styles.landingButton}
                            >
                                Подписаться
                            </Button>
                        </Form.Item>
                    </Form>
                </section>
                
            </Content>
        </Layout>
    );
}
