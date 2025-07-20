"use client";

import { Button, Layout, Row, Col, Typography, Divider, Card, Input, Form} from "antd";

import { LineChartOutlined, DesktopOutlined } from "@ant-design/icons";
import { BsStars, BsSliders  } from "react-icons/bs";
import Link from "next/link";
import styles from "./page.module.css";

const { Title, Paragraph } = Typography;
const { Content } = Layout;

export default function LandingPage() {
    return (
        <Layout className={styles.layout}>
            <Content className={styles.content}>
                <section className={styles.hero}>
                    <div>
                        <Title level={1} style={{
                            marginBottom: "50px !important",
                        }}>AImperia: Первая платформа в мире, которая позволяет тебе учится в разы быстрее <LineChartOutlined style={{color:'#3d8eff'}} /></Title>
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
                                    
                                >
                                    Начать
                                </Button>
                            </Link>
                            <Link href="/signin">
                                <Button size="large" style={{width: "250px", height: "50px", fontSize: "20px", borderRadius: "50px"}}>Смотреть видео</Button>
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
                
                <section className={styles.section}>
                    <Title style={{
                        textAlign: 'center',
                        marginBottom: '40px',
                        fontSize: '36px',
                        color: '#3d8eff',
                    }}>Легко начать пользоваться</Title>
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
                            <Button color="purple" variant="solid" style={{ width: '100%' }} className={styles.sectionFormInput}>
                                Задать вопрос
                            </Button>
                        </div>
                    </div>
                </section>
                
                <section className={styles.section}>
                    <div className={styles.sectionAbout}>
                        <div className={styles.sectionAboutTitle}>
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
                
                <section className={styles.section}>
                    <div className={styles.sectionPrice}>
                        <div className={styles.sectionPriceTitle}>
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
                                    Одна лекция с преподавателем Aimperia (2 часа)
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
                
                <section className={styles.section}>
                    <div className={styles.sectionForWho}>
                        <div className={styles.sectionForWhoTitle}>
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
                
            </Content>
        </Layout>
    );
}
