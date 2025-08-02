"use client";

import { Button, Layout, Row, Col, Typography, Divider, Card, Input, Form, Table, Collapse } from "antd";
import { useState } from "react";
import { LineChartOutlined, DesktopOutlined, CheckCircleOutlined, CloseCircleOutlined, MailOutlined } from "@ant-design/icons";
import { BsStars, BsSliders } from "react-icons/bs";
import Link from "next/link";
import styles from "./page.module.css";
import { useTranslations } from 'next-intl';

const { Title } = Typography;
const { Content } = Layout;

export default function LandingPage() {
    const t = useTranslations('Landing');
    const [collapseActiveKey, setCollapseActiveKey] = useState<string | string[]>(['1']);

    return (
        <Layout className={styles.layout}>
            <Content className={styles.content}>
                {/* Hero Section */}
                <section className={styles.hero}>
                    <div>
                        <Title level={1} style={{ marginBottom: "50px !important" }}>
                            {
                                // Split the heroTitle into words, show all except the last word
                                (() => {
                                    const heroTitle = t('heroTitle');
                                    const words = heroTitle.split(' ');
                                    const allExceptLast = words.slice(0, -1).join(' ');
                                    const lastWord = words[words.length - 1];
                                    return (
                                        <>
                                            {allExceptLast} <span style={{ textWrap: 'nowrap' }}>{lastWord}<LineChartOutlined style={{ color: '#3d8eff', marginLeft:'10px' }} /></span>
                                        </>
                                    );
                                })()
                            }
                        </Title>
                        <div className={styles.heroButtons}>
                            <Link href="/signup">
                                <Button
                                    type="primary"
                                    size="large"
                                    style={{ marginRight: "10px", width: "200px", height: "50px", fontSize: "20px", borderRadius: "50px" }}
                                    className={styles.landingButton}
                                >
                                    {t('heroStartButton')}
                                </Button>
                            </Link>
                            <Link href="/signin">
                                <Button size="large" style={{ width: "250px", height: "50px", fontSize: "20px", borderRadius: "50px" }}
                                    className={styles.landingButton}
                                >{t('heroWatchVideoButton')}</Button>
                            </Link>
                        </div>
                    </div>
                    <div className={styles.heroImageContainer}>
                        <img src='/landing/hero.png' alt="Hero" className={styles.heroImage} />
                        <div className={styles.heroImageOverlay}>
                            {t('heroOverlay')}
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className={styles.section}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'start', justifyContent: 'center', gap: '50px' }}>
                        <div className={styles.info1Item}>
                            <div className={styles.info1ItemTitle}>
                                <DesktopOutlined className={styles.info1ItemIcon} /> {t('features.videoBoardTitle')}
                            </div>
                            <Divider style={{ margin: '20px 0' }} />
                            <div className={styles.info1ItemDescription}>
                                {t('features.videoBoardDesc')}
                            </div>
                        </div>
                        <div className={styles.info1Item}>
                            <div className={styles.info1ItemTitle}>
                                <BsStars className={styles.info1ItemIcon} /> {t('features.aiNotesTitle')}
                            </div>
                            <Divider style={{ margin: '20px 0' }} />
                            <div className={styles.info1ItemDescription}>
                                {t('features.aiNotesDesc')}
                            </div>
                        </div>
                        <div className={styles.info1Item}>
                            <div className={styles.info1ItemTitle}>
                                <BsSliders className={styles.info1ItemIcon} /> {t('features.easyInterfaceTitle')}
                            </div>
                            <Divider style={{ margin: '20px 0' }} />
                            <div className={styles.info1ItemDescription}>
                                {t('features.easyInterfaceDesc')}
                            </div>
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section className={styles.section}>
                    <div className={styles.sectionTitle}>{t('easyStartTitle')}</div>
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
                                                <div className={styles.imageInfoTitle}>{t('easyStart.createLessonTitle')}</div>
                                                <div className={styles.imageInfoDescription}>
                                                    {t('easyStart.createLessonDesc')}
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
                                                <div className={styles.imageInfoTitle}>{t('easyStart.joinLessonTitle')}</div>
                                                <div className={styles.imageInfoDescription}>
                                                    {t('easyStart.joinLessonDesc')}
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
                                                <div className={styles.imageInfoTitle}>{t('easyStart.videoBoardTitle')}</div>
                                                <div className={styles.imageInfoDescription}>
                                                    {t('easyStart.videoBoardDesc')}
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
                                                <div className={styles.imageInfoTitle}>{t('easyStart.autoNotesTitle')}</div>
                                                <div className={styles.imageInfoDescription}>
                                                    {t('easyStart.autoNotesDesc')}
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
                                        <div className={styles.imageInfoTitle}>{t('easyStart.startLearningTitle')}</div>
                                        <div className={styles.imageInfoDescription}>
                                            {t('easyStart.startLearningDesc')}
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
                                {t('statistics.usersTitle')}
                            </div>
                            <div className={styles.sectionUsersDescription}>
                                {t('statistics.usersDesc')}
                            </div>
                        </div>
                        <div className={styles.sectionUsersVertDivider}/>
                        <div className={styles.sectionUsersItem}>
                            <div className={styles.sectionUsersTitle}>
                                {t('statistics.lessonsTitle')}
                            </div>
                            <div className={styles.sectionUsersDescription}>
                                {t('statistics.lessonsDesc')}
                            </div>
                        </div>
                        <div className={styles.sectionUsersVertDivider}/>
                        <div className={styles.sectionUsersItem}>
                            <div className={styles.sectionUsersTitle}>
                                {t('statistics.countriesTitle')}
                            </div>
                            <div className={styles.sectionUsersDescription}>
                                {t('statistics.countriesDesc')}
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
                        }}>{t('contact.title')}</div>
                        <div style={{ color: '#fff', textAlign: 'center', marginBottom: '50px', fontSize: '18px' }}>
                            {t('contact.subtitle')}
                        </div>
                        <div className={styles.sectionFormContainer}>
                            <Input placeholder={t('contact.namePlaceholder')} className={styles.sectionFormInput} />
                            <Input type="email" placeholder={t('contact.emailPlaceholder')} className={styles.sectionFormInput} />
                            <Input placeholder={t('contact.phonePlaceholder')} className={styles.sectionFormInput} />
                            <Button color="purple" variant="solid" style={{ width: '100%' }}
                                className={styles.sectionFormInput}
                                onClick={() => alert(t('contact.successMessage'))}>
                                {t('contact.askButton')}
                            </Button>
                        </div>
                    </div>
                </section>

                {/* About Section */}
                <section className={styles.section} id="aboutSection">
                    <div className={styles.sectionAbout}>
                        <div className={styles.sectionTitle}>
                            {t('about.title')}
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
                                    {t('about.bestPlatformTitle')}
                                </div>
                                <ul className={styles.sectionAboutItemDescription}>
                                    {t.raw('about.bestPlatformList').map((item: string, idx: number) => (
                                        <li key={idx}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                            <div className={styles.sectionAboutItem}>
                                <div className={styles.sectionAboutItemTitle}>
                                    {t('about.simplicityTitle')}
                                </div>
                                <ul className={styles.sectionAboutItemDescription}>
                                    {t.raw('about.simplicityList').map((item: string, idx: number) => (
                                        <li key={idx}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                            <div className={styles.sectionAboutItem}>
                                <div className={styles.sectionAboutItemTitle}>
                                    {t('about.startTodayTitle')}
                                </div>
                                <ul className={styles.sectionAboutItemDescription}>
                                    {t.raw('about.startTodayList').map((item: string, idx: number) => (
                                        <li key={idx}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                {/* <section className={styles.section}>
                    <div className={styles.sectionPrice}>
                        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css"></link>
                        <div className={styles.sectionTitle}>
                            {t('pricing.title')}
                        </div>
                        <Divider style={{ marginBottom: '40px' }} />
                        <div className={styles.priceCardsContainer}>
                            <Card className={styles.priceCard}>
                                <div className={styles.priceCardTitle}>
                                    {t('pricing.basicTitle')}
                                </div>
                                <div className={styles.priceCardPrice}>
                                    {t('pricing.basicPrice')}
                                </div>
                                <ul className={styles.priceCardFeatures}>
                                    {t.raw('pricing.features').map((feature: string, idx: number) => (
                                        <li key={idx} className={idx >= 4 ? styles.priceCardNotFeature : undefined}>{feature}</li>
                                    ))}
                                </ul>
                            </Card>
                            <Card className={styles.priceCard}>
                                <div className={styles.priceCardTitle}>
                                    {t('pricing.plusTitle')}
                                </div>
                                <div className={styles.priceCardPrice}>
                                    {t('pricing.plusPrice')}
                                </div>
                                <ul className={styles.priceCardFeatures}>
                                    {t.raw('pricing.features').map((feature: string, idx: number) => (
                                        <li key={idx} className={idx >= 7 ? styles.priceCardNotFeature : undefined}>{feature}</li>
                                    ))}
                                </ul>
                            </Card>
                            <Card className={styles.priceCardAnimated}>
                                <div className={styles.priceCardTitle}>
                                    {t('pricing.premiumTitle')}
                                </div>
                                <div className={styles.priceCardPrice}>
                                    {t('pricing.premiumPrice')}
                                </div>
                                <ul className={styles.priceCardFeatures}>
                                    {t.raw('pricing.features').map((feature: string, idx: number) => (
                                        <li key={idx}>{feature}</li>
                                    ))}
                                </ul>
                            </Card>
                        </div>
                    </div>
                </section> */}

                {/* For Who Section */}
                <section className={styles.section}>
                    <div className={styles.sectionForWho}>
                        <div className={styles.sectionTitle}>
                            {t('forWho.title')}
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
                                <div className={styles.sectionForWhoItemTitle}>
                                    {t('forWho.students')}
                                </div>
                            </div>
                            <div className={styles.sectionForWhoItem}>
                                <div className={styles.sectionForWhoItemIcon}>
                                    &#129488;
                                </div>
                                <div className={styles.sectionForWhoItemTitle}>
                                    {t('forWho.teachers')}
                                </div>
                            </div>
                            <div className={styles.sectionForWhoItem}>
                                <div className={styles.sectionForWhoItemIcon}>
                                    &#128640;
                                </div>
                                <div className={styles.sectionForWhoItemTitle}>
                                    {t('forWho.fastLearners')}
                                </div>
                            </div>
                            <div className={styles.sectionForWhoItem}>
                                <div className={styles.sectionForWhoItemIcon}>
                                    &#129302;
                                </div>
                                <div className={styles.sectionForWhoItemTitle}>
                                    {t('forWho.aiLearners')}
                                </div>
                            </div>
                            <div className={styles.sectionForWhoItem}>
                                <div className={styles.sectionForWhoItemIcon}>
                                    &#128187;
                                </div>
                                <div className={styles.sectionForWhoItemTitle}>
                                    {t('forWho.innovativeTeachers')}
                                </div>
                            </div>
                            <div className={styles.sectionForWhoItem}>
                                <div className={styles.sectionForWhoItemIcon}>
                                    &#128106;
                                </div>
                                <div className={styles.sectionForWhoItemTitle}>
                                    {t('forWho.parents')}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section className={styles.section}>
                    <div className={styles.sectionTitle}>
                        {t('howToStart.title')}
                    </div>
                    <Divider style={{ marginBottom: '40px' }} />
                    <div className={styles.sectionHowToStartContainer}>
                        <div className={styles.sectionHowToStartTopText}>
                            {t('howToStart.topText')}
                        </div>
                        <div className={styles.sectionHowToStartItem}>
                            <div className={styles.sectionHowToStartItemTitle}>
                                01
                            </div>
                            <div className={styles.sectionHowToStartItemDescription}>
                                {t('howToStart.step1')}
                            </div>
                        </div>
                        <img src="/landing/arrow.png" alt="Arrow" className={styles.sectionHowToStartArrow} />
                        <div className={styles.sectionHowToStartItem}>
                            <div className={styles.sectionHowToStartItemTitle}>
                                02
                            </div>
                            <div className={styles.sectionHowToStartItemDescription}>
                                {t('howToStart.step2')}
                            </div>
                        </div>
                        <img src="/landing/arrow.png" alt="Arrow" className={styles.sectionHowToStartArrow} />
                        <div className={styles.sectionHowToStartItem}>
                            <div className={styles.sectionHowToStartItemTitle}>
                                03
                            </div>
                            <div className={styles.sectionHowToStartItemDescription}>
                                {t('howToStart.step3')}
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
                        {t('howToStart.startNowButton')}
                    </Button>
                </section>

                {/* Statistics Section */}
                <section className={styles.section}>
                    <div className={styles.sectionTitle}>
                        {t('advantages.title')}
                    </div>
                    <Divider style={{ marginBottom: '40px' }} />
                    <div className={styles.sectionAdvantagesItems}>
                        <div className={styles.sectionAdvantagesItem}>
                            <div className={styles.sectionAdvantagesItemTitle}>
                                {t('advantages.faster')}
                            </div>
                            <div className={styles.sectionAdvantagesItemDescription}>
                                {t('advantages.fasterDesc')}
                            </div>
                        </div>
                        <div className={styles.sectionAdvantagesVertDivider}/>
                        <div className={styles.sectionAdvantagesItem}>
                            <div className={styles.sectionAdvantagesItemTitle}>
                                {t('advantages.higherGrades')}
                            </div>
                            <div className={styles.sectionAdvantagesItemDescription}>
                                {t('advantages.higherGradesDesc')}
                            </div>
                        </div>
                        <div className={styles.sectionAdvantagesVertDivider}/>
                        <div className={styles.sectionAdvantagesItem}>
                            <div className={styles.sectionAdvantagesItemTitle}>
                                {t('advantages.averageScore')}
                            </div>
                            <div className={styles.sectionAdvantagesItemDescription}>
                                {t('advantages.averageScoreDesc')}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Comparison Section */}
                <section className={styles.section}>
                    <div className={styles.sectionTitle}>
                        {t('featuresComparison.title')}
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
                                title: t('featuresComparison.title'),
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
                                feature: t('featuresComparison.videoCall'),
                                AImperia: <CheckCircleOutlined className={styles.featuresCheckmark} />,
                                other: <CheckCircleOutlined className={styles.featuresCheckmark} />,
                                zoom: <CheckCircleOutlined className={styles.featuresCheckmark} />
                            },
                            {
                                key: '2',
                                feature: t('featuresComparison.interactiveBoard'),
                                AImperia: <CheckCircleOutlined className={styles.featuresCheckmark} />,
                                other: <CheckCircleOutlined className={styles.featuresCheckmark} />,
                                zoom: <CheckCircleOutlined className={styles.featuresCheckmark} />
                            },
                            {
                                key: '8',
                                feature: t('featuresComparison.experiencedTeacher'),
                                AImperia: <CheckCircleOutlined className={styles.featuresCheckmark} />,
                                other: <CheckCircleOutlined className={styles.featuresCheckmark} />,
                                zoom: <CloseCircleOutlined className={styles.featuresCross} />
                            },
                            {
                                key: '4',
                                feature: t('featuresComparison.chatSupport'),
                                AImperia: <CheckCircleOutlined className={styles.featuresCheckmark} />,
                                other: <CheckCircleOutlined className={styles.featuresCheckmark} />,
                                zoom: <CloseCircleOutlined className={styles.featuresCross} />
                            },
                            {
                                key: '3',
                                feature: t('featuresComparison.autoNotes'),
                                AImperia: <CheckCircleOutlined className={styles.featuresCheckmark} />,
                                other: <CloseCircleOutlined className={styles.featuresCross} />,
                                zoom: <CloseCircleOutlined className={styles.featuresCross} />
                            },
                            {
                                key: '5',
                                feature: t('featuresComparison.lessonRecording'),
                                AImperia: <CheckCircleOutlined className={styles.featuresCheckmark} />,
                                other: <CloseCircleOutlined className={styles.featuresCross} />,
                                zoom: <CloseCircleOutlined className={styles.featuresCross} />
                            },
                            {
                                key: '6',
                                feature: t('featuresComparison.aiQuestions'),
                                AImperia: <CheckCircleOutlined className={styles.featuresCheckmark} />,
                                other: <CloseCircleOutlined className={styles.featuresCross} />,
                                zoom: <CloseCircleOutlined className={styles.featuresCross} />
                            },
                            {
                                key: '7',
                                feature: t('featuresComparison.pdfNotes'),
                                AImperia: <CheckCircleOutlined className={styles.featuresCheckmark} />,
                                other: <CloseCircleOutlined className={styles.featuresCross} />,
                                zoom: <CloseCircleOutlined className={styles.featuresCross} />
                            },
                        ]}
                    />
                </section>

                {/* Teachers Section */}
                {/* <section className={styles.section} id="teachersSection">
                    <div className={styles.sectionTitle}>
                        {t('teachers.title')}
                    </div>
                    <Divider style={{ marginBottom: '40px' }} />
                    <div className={styles.sectionTeachers}>
                        <div className={styles.sectionTeachersItem}>
                            <img src="/landing/teacher1.png" alt="Teacher 1" className={styles.sectionTeachersItemImage} />
                            <div className={styles.sectionTeachersItemName}>
                                {t('teachers.teacher1.name')}
                            </div>
                            <div className={styles.sectionTeachersItemSubject}>
                                {t('teachers.math')}
                            </div>
                            <div className={styles.sectionTeachersItemDescription}>
                                {t('teachers.teacher1.desc')}
                            </div>
                        </div>
                        <div className={styles.sectionTeachersItem}>
                            <img src="/landing/teacher2.png" alt="Teacher 2" className={styles.sectionTeachersItemImage} />
                            <div className={styles.sectionTeachersItemName}>
                                {t('teachers.teacher2.name')}
                            </div>
                            <div className={styles.sectionTeachersItemSubject}>
                                {t('teachers.physics')}
                            </div>
                            <div className={styles.sectionTeachersItemDescription}>
                                {t('teachers.teacher2.desc')}
                            </div>
                        </div>
                        <div className={styles.sectionTeachersItem}>
                            <img src="/landing/teacher3.png" alt="Teacher 3" className={styles.sectionTeachersItemImage} />
                            <div className={styles.sectionTeachersItemName}>
                                {t('teachers.teacher3.name')}
                            </div>
                            <div className={styles.sectionTeachersItemSubject}>
                                {t('teachers.chemistry')}
                            </div>
                            <div className={styles.sectionTeachersItemDescription}>
                                {t('teachers.teacher3.desc')}
                            </div>
                        </div>
                        <div className={styles.sectionTeachersItem}>
                            <img src="/landing/teacher4.png" alt="Teacher 4" className={styles.sectionTeachersItemImage} />
                            <div className={styles.sectionTeachersItemName}>
                                {t('teachers.teacher4.name')}
                            </div>
                            <div className={styles.sectionTeachersItemSubject}>
                                {t('teachers.informatics')}
                            </div>
                            <div className={styles.sectionTeachersItemDescription}>
                                {t('teachers.teacher4.desc')}
                            </div>
                        </div>
                        <div className={styles.sectionTeachersItem}>
                            <img src="/landing/teacher5.png" alt="Teacher 5" className={styles.sectionTeachersItemImage} />
                            <div className={styles.sectionTeachersItemName}>
                                {t('teachers.teacher5.name')}
                            </div>
                            <div className={styles.sectionTeachersItemSubject}>
                                {t('teachers.biology')}
                            </div>
                            <div className={styles.sectionTeachersItemDescription}>
                                {t('teachers.teacher5.desc')}
                            </div>
                        </div>
                    </div>
                </section> */}

                {/* Reviews Section */}
                {/* <section className={styles.sectionReviews}
                    style={{
                        backgroundImage: 'url(/landing/reviewsBackground.png)',
                        backgroundRepeat: 'repeat',
                        backgroundSize: '800px auto',
                    }}
                >
                    <div className={styles.sectionReviewsTitle}>
                        {t('reviews.title')}
                    </div>
                    <div className={styles.sectionReviewsItems}>
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div className={styles.sectionReviewItem} key={i}>
                                <div className={styles.sectionReviewText}>
                                    {t(`reviews.review${i}.text`)}
                                </div>
                                <div className={styles.sectionReviewAuthor}>
                                    {t(`reviews.review${i}.author`)}
                                </div>
                            </div>
                        ))}
                    </div>
                </section> */}

                {/* FAQ */}
                <section className={styles.section} id="faqSection">
                    <div className={styles.sectionTitle}>
                        {t('faq.title')}
                    </div>
                    <Divider style={{ marginBottom: '40px' }} />
                    <Collapse
                        activeKey={collapseActiveKey}
                        onChange={(key) => {
                            if (key.length > 0)
                                setCollapseActiveKey([key[key.length - 1]]);
                        }}
                        expandIconPosition="end"
                        className={styles.faqCollapse}
                        items={Array.from({ length: 8 }, (_, i) => ({
                            key: `${i + 1}`,
                            label: t(`faq.q${i + 1}.question`),
                            children: <span>{t(`faq.q${i + 1}.answer`)}</span>,
                        }))}
                    />
                </section>

                {/* News Section */}
                {/* <section className={styles.section}>
                    <div className={styles.sectionTitle}>
                        {t('news.title')}
                    </div>
                    <div className={styles.sectionNews}>
                        {[1, 2, 3, 4].map((i) => (
                            <div className={styles.sectionNewsItem} key={i}>
                                <img src={`/landing/news${i}.png`} alt={`News ${i}`} className={styles.sectionNewsItemImage} />
                                <div className={styles.sectionNewsItemTitle}>
                                    {t(`news.news${i}.title`)}
                                </div>
                                <div className={styles.sectionNewsItemDate}>
                                    {t(`news.news${i}.date`)}
                                </div>
                                <div className={styles.sectionNewsItemDescription}>
                                    {t(`news.news${i}.desc`)}
                                </div>
                            </div>
                        ))}
                    </div>
                </section> */}

                {/* Newsletter */}
                <section className={styles.section}>
                    <div className={styles.sectionNewsletterTitle}>
                        {t('newsletter.title')}
                    </div>
                    <Divider />
                    <div className={styles.sectionNewsletterSubTitle}>
                        {t('newsletter.subtitle')}
                    </div>
                    <Form layout="inline" className={styles.newsletterForm}>
                        <Form.Item>
                            <Input placeholder={t('newsletter.emailPlaceholder')}
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
                                {t('newsletter.subscribeButton')}
                            </Button>
                        </Form.Item>
                    </Form>
                </section>
            </Content>
        </Layout>
    );
}
