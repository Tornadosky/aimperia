"use client";

import { Button, Layout, Row, Col, Typography, Divider, Card, Input, Form, Table, Collapse, message, Modal } from "antd";
import { useState } from "react";
import { LineChartOutlined, DesktopOutlined, CheckCircleOutlined, CloseCircleOutlined, MailOutlined } from "@ant-design/icons";
import { BsStars, BsSliders } from "react-icons/bs";
import { HiOutlinePencil, HiOutlineUserGroup, HiOutlineBookOpen, HiOutlineCursorClick, HiOutlineLockClosed, HiOutlineAdjustments } from "react-icons/hi";
import Link from "next/link";
import styles from "./page.module.css";
import { useTranslations } from 'next-intl';
import {subscribeToNewsletter, submitContactRequest} from "@/app/lib/landing";

const { Title } = Typography;
const { Content } = Layout;

export default function LandingPage() {
    const t = useTranslations('Landing');
    const [collapseActiveKey, setCollapseActiveKey] = useState<string | string[]>(['1']);
    
    const [contactForm] = Form.useForm();
    const [newsletterForm] = Form.useForm();
    
    return (
        <Layout className={styles.layout}>
            <Content className={styles.content}>
                {/* Hero Section */}
                <section className={styles.hero}>
                    <div className={styles.heroContent}>
                        <div>
                            <Title level={1} style={{ marginBottom: "50px !important", marginTop: "50px !important" }} className={styles.heroTitle}>
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
                                        style={{ width: "200px", height: "50px", fontSize: "20px", borderRadius: "50px" }}
                                        className={styles.landingButton + " " + styles.heroStartButton}
                                    >
                                        {t('heroStartButton')}
                                    </Button>
                                </Link>
                                <Button size="large" style={{ width: "250px", height: "50px", fontSize: "20px", borderRadius: "50px" }}
                                    className={styles.landingButton}
                                    onClick={() => {
                                        Modal.info({
                                            title: t('heroWatchVideoTitle'),
                                            content: (
                                                <video
                                                    src="https://aimperia-assets.s3.us-east-2.amazonaws.com/demo.mp4"
                                                    controls
                                                    style={{ width: '100%', height: 'auto' }}
                                                    className={styles.heroVideo}
                                                />
                                            ),
                                            onOk() { },
                                            width: window.innerWidth > 800 ? 800 : '100%',
                                        });
                                    }}
                                >{t('heroWatchVideoButton')}</Button>
                            </div>
                        </div>
                        <div className={styles.heroImageContainer}>
                            <img src='/landing/hero.png' alt="Hero" className={styles.heroImage} />
                            <div className={styles.heroImageOverlay}>
                                {t('heroOverlay')}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className={styles.section}>
                    <div className={styles.sectionFeatures}>
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
                <section className={styles.section+' '+styles.sectionHowItWorks}>
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
                        {/* <div className={styles.sectionFormContainer}> */}
                        <Form
                            name="contactForm"
                            className={styles.sectionFormContainer}
                            form={contactForm}
                        >   
                            <Form.Item
                                name="name"
                                className={styles.sectionFormInput}
                                rules={[{ required: true, message: t('contact.nameRequired') }]}
                            >
                                <Input placeholder={t('contact.namePlaceholder')} className={styles.sectionFormInput} />
                            </Form.Item>
                            <Form.Item
                                name="email"
                                className={styles.sectionFormInput}
                                rules={[
                                    { required: true, message: t('contact.emailRequired') },
                                    { type: 'email', message: t('contact.emailInvalid') }
                                ]}
                            >
                                <Input type="email" placeholder={t('contact.emailPlaceholder')} className={styles.sectionFormInput} />
                            </Form.Item>
                            <Form.Item name="phone"
                                className={styles.sectionFormInput}
                                rules={[
                                    { required: true, message: t('contact.phoneRequired') },
                                ]}
                            >
                                <Input placeholder={t('contact.phonePlaceholder')} className={styles.sectionFormInput} />
                            </Form.Item>
                            <Form.Item
                                className={styles.sectionFormInput}
                            >
                                <Button
                                    variant="solid"
                                    color="purple"
                                    type="primary"
                                    htmlType="submit"
                                    className={styles.sectionFormInput}
                                    onClick={async (e) => {
                                        e.preventDefault();
                                        try {
                                            const values = await contactForm.validateFields();
                                            await submitContactRequest(values);
                                            contactForm.resetFields();
                                            message.success(t('contact.successMessage'));
                                        } catch (error) {
                                            // Optionally handle validation or submission errors
                                        }
                                    }}
                                    
                                >
                                    {t('contact.askButton')}
                                </Button>
                            </Form.Item>
                        </Form>
                        {/* </div> */}
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
                <div className="relative pt-12 pb-24">
                    {/* Removed gray backgrounds */}
                    
                    <div className="relative">
                        <h2 className="text-3xl font-extrabold tracking-tight leading-8 text-center sm:text-5xl" style={{color: '#3d8eff'}}>
                            {t('whyAimperia.title')}
                        </h2>
                    </div>
                    
                    <div className="grid gap-y-8 mx-auto mt-20 max-w-7xl lg:px-8 lg:grid-cols-2">
                        {/* Tutors Section */}
                        <div className="relative px-1.5 pb-2 bg-teal-500 rounded-l rounded-tr-3xl">
                            <div className="relative pt-8 pb-12 h-full bg-white rounded-tl-xl rounded-tr-3xl border-r border-gray-200 transform translate-x-1.5 -translate-y-2">
                                <div className="absolute bottom-0 w-full h-5 bg-gray-200 rounded-tr-2xl"></div>
                                <div className="absolute top-0 left-0 w-2 h-full bg-gray-200 rounded-tl-xl"></div>
                                
                                <div className="mx-auto max-w-lg">
                                    <div className="px-12 py-6">
                                        <h3 className="pl-12 m-0 -ml-12 text-4xl font-black text-teal-500">
                                            <span className="text-gray-800">{t('whyAimperia.tutors.builtFor')}</span> {t('whyAimperia.tutors.tutors')}
                                        </h3>
                                    </div>
                                    
                                    <div>
                                        <div className="flex px-12 py-6">
                                            <div>
                                                <div className="p-2 mr-6 text-teal-600 bg-teal-100 rounded-lg">
                                                    <HiOutlinePencil className="block w-7 h-7" />
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-bold text-gray-700">{t('whyAimperia.tutors.subjectTools.title')}</h4>
                                                <p className="mt-2 mb-0 text-gray-500">
                                                    {t('whyAimperia.tutors.subjectTools.description')}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex px-12 py-6">
                                            <div>
                                                <div className="p-2 mr-6 text-teal-600 bg-teal-100 rounded-lg">
                                                    <HiOutlineUserGroup className="block w-7 h-7" />
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-bold text-gray-700">{t('whyAimperia.tutors.studentControl.title')}</h4>
                                                <p className="mt-2 mb-0 text-gray-500">
                                                    {t('whyAimperia.tutors.studentControl.description')}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex px-12 py-6">
                                            <div>
                                                <div className="p-2 mr-6 text-teal-600 bg-teal-100 rounded-lg">
                                                    <HiOutlineBookOpen className="block w-7 h-7" />
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-bold text-gray-700">{t('whyAimperia.tutors.resources.title')}</h4>
                                                <p className="mt-2 mb-0 text-gray-500">
                                                    {t('whyAimperia.tutors.resources.description')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Students Section */}
                        <div className="relative px-1.5 pb-2 bg-yellow-500 rounded-r rounded-tl-3xl">
                            <div className="relative pt-8 pb-12 h-full bg-white rounded-tl-3xl rounded-tr-xl border-l border-gray-200 transform -translate-x-1.5 -translate-y-2">
                                <div className="absolute bottom-0 w-full h-5 bg-gray-200 rounded-tl-2xl rounded-tr-xl"></div>
                                <div className="absolute top-0 right-0 w-2 h-full bg-gray-200 rounded-tr-xl"></div>
                                
                                <div className="mx-auto max-w-lg">
                                    <div className="px-12 py-6">
                                        <h3 className="pl-12 m-0 -ml-12 text-4xl font-black text-yellow-500">
                                            <span className="text-gray-800">{t('whyAimperia.students.easyFor')}</span> {t('whyAimperia.students.students')}
                                        </h3>
                                    </div>
                                    
                                    <div>
                                        <div className="flex px-12 py-6">
                                            <div>
                                                <div className="p-2 mr-6 text-yellow-600 bg-yellow-100 rounded-lg">
                                                    <HiOutlineCursorClick className="block w-7 h-7" />
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-bold text-gray-700">{t('whyAimperia.students.oneClick.title')}</h4>
                                                <p className="mt-2 mb-0 text-gray-500">
                                                    {t('whyAimperia.students.oneClick.description')}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex px-12 py-6">
                                            <div>
                                                <div className="p-2 mr-6 text-yellow-600 bg-yellow-100 rounded-lg">
                                                    <HiOutlineLockClosed className="block w-7 h-7" />
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-bold text-gray-700">{t('whyAimperia.students.leading.title')}</h4>
                                                <p className="mt-2 mb-0 text-gray-500">
                                                    {t('whyAimperia.students.leading.description')}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex px-12 py-6">
                                            <div>
                                                <div className="p-2 mr-6 text-yellow-600 bg-yellow-100 rounded-lg">
                                                    <HiOutlineAdjustments className="block w-7 h-7" />
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-bold text-gray-700">{t('whyAimperia.students.configure.title')}</h4>
                                                <p className="mt-2 mb-0 text-gray-500">
                                                    {t('whyAimperia.students.configure.description')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                

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
                <section className={styles.section + " " + styles.sectionFeaturesComparison}>
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
                                render: (text) => <div className={styles.featureText}>{text}</div>,
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
                    <Form layout="inline" className={styles.newsletterForm} form={newsletterForm}>
                        <Form.Item
                            name="email"
                            rules={[{ required: true, message: t('newsletter.emailRequired') }, { type: 'email', message: t('newsletter.emailInvalid') }]}
                        >
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
                                onClick={async (e) => {
                                    e.preventDefault();
                                    try {
                                        const values = await newsletterForm.validateFields();
                                        await subscribeToNewsletter(values.email);
                                        newsletterForm.resetFields();
                                        message.success(t('newsletter.successMessage'));
                                    } catch (error) {
                                        // Optionally handle validation or submission errors
                                    }
                                }}
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
