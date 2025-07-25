"use client";

import React, { useState, useRef, useEffect } from "react";
import { Form, Input, Button, Spin, message } from "antd";
import { fetchLessons, createLesson, attendLesson, fetchLessonById, getZoomSignature } from "@/app/lib/lessons";
import { useAuth } from '@/app/context/AuthContext'
import styles from './meeting.module.css'

export default function MeetingPage({ params }: { params: { lessonId: string } }) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const zoomContainerRef = useRef<HTMLDivElement>(null);
    const [client, setClient] = useState<any>(null);
    const [lessonInfo, setLessonInfo] = useState<any>(null);
    const [signature, setSignature] = useState<string | null>(null);

    useEffect(() => {
        if (!zoomContainerRef.current || !user) return;
        let meetingSDKElement = document.getElementById('meetingSDKElement');
        (async () => {
            const { default: ZoomMtgEmbedded } = await import(
                "@zoom/meetingsdk/embedded"
            );
            const client = ZoomMtgEmbedded.createClient();
            client.init({
                debug: true,
                zoomAppRoot: zoomContainerRef.current as HTMLElement,
                language: "ru-RU",
            })
            
            setClient(client);
        })();
    }, [user]);
    
    useEffect(() => {
        
        const fetchLesson = async () => {
            try {
                const lesson = await fetchLessonById(params.lessonId);
                console.log("Fetched lesson:", lesson);
                if (lesson?.id){
                    setLessonInfo(lesson);
                    const signature = await getZoomSignature(lesson?.id);
                    console.log("Zoom signature:", signature);
                    if (signature?.signature){
                        setSignature(signature);
                        if (client) {
                            client.join({
                                signature: signature,
                                meetingNumber: lesson.zoomMeetingId,
                                password: lesson.zoomPassword || "",
                                userName: user.firstName + " " + user.lastName,
                                success: () => {
                                        console.log('Joined meeting successfully')
                                    },
                                error: (error:any) => {
                                        console.error('Failed to join meeting:', error)
                                    }
                            });
                        }
                    }
                }
                else
                    message.error("Не удалось загрузить информацию о встрече");
            } catch (error) {
                console.error("Error fetching lesson:", error);
                message.error("Не удалось загрузить информацию о встрече");
            }
        }
        fetchLesson();
    }, [params.lessonId]);

    const handleJoin = async (values: {
        meetingNumber: string;
        userName: string;
        meetingPassword?: string;
    }) => {
        if (!client) {
            message.error("Zoom SDK еще не готов");
            return;
        }

        setLoading(true);
        try {

            // client.join({
            //     signature: signature,
            //     meetingNumber: values.meetingNumber,
            //     password: values.meetingPassword || "",
            //     userName: values.userName,
            //     // userEmail can be added if you collect it in the form
            // }).then(() => {
            //     console.log('Joined meeting successfully')
            // }).catch((error) => {
            //     console.error('Failed to join meeting:', error)
            // })

            message.success("Подключено к встрече");
        } catch (err) {
            console.error(err);
            message.error("Ошибка при подключении к встрече");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: 24 }}>
            {/* Zoom SDK will mount here */}
            <div
                id="meetingSDKElement"
                ref={zoomContainerRef}
                style={{ width: "100%", height: "600px", marginBottom: 24 }}
            />

            <h1>Zoom Meeting</h1>
            <p>Введите данные встречи, чтобы присоединиться:</p>

            <Form
                layout="vertical"
                onFinish={handleJoin}
                style={{ maxWidth: 400 }}
            >
                <Form.Item
                    name="meetingNumber"
                    label="Номер встречи"
                    rules={[
                        { required: true, message: "Введите номер встречи" },
                    ]}
                >
                    <Input placeholder="Например: 1234567890" />
                </Form.Item>

                <Form.Item
                    name="userName"
                    label="Ваше имя"
                    rules={[{ required: true, message: "Введите ваше имя" }]}
                >
                    <Input placeholder="Например: Иван Иванов" />
                </Form.Item>

                <Form.Item name="meetingPassword" label="Пароль (если есть)">
                    <Input placeholder="Пароль встречи" />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" disabled={loading}>
                        {loading ? <Spin /> : "Присоединиться"}
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}
