import {
  LocalUser, // Plays the microphone audio track and the camera video track
  RemoteUser, // Plays the remote user audio and video tracks
  useIsConnected, // Returns whether the SDK is connected to Agora's server
  useJoin, // Automatically join and leave a channel on mount and unmount
  useLocalMicrophoneTrack, // Create a local microphone audio track
  useLocalCameraTrack, // Create a local camera video track
  usePublish, // Publish the local tracks
  useRemoteUsers, // Retrieve the list of remote users
} from "agora-rtc-react";
import AgoraRTC, { AgoraRTCProvider, useRTCClient } from "agora-rtc-react";
import { use, useEffect, useState, useRef } from "react";

import { generateAgoraToken, closeLesson } from "@/app/lib/lessons";

import styles from './agora.module.css';

import { FiCamera, FiCameraOff } from "react-icons/fi";
import { BiMicrophone, BiMicrophoneOff } from "react-icons/bi";
import { MdOutlineCallEnd } from "react-icons/md";

import { Button, Modal, message } from "antd";
import classNames from 'classnames';

import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useTranslations } from 'next-intl';
import { InfoCircleFilled } from "@ant-design/icons";

interface AgoraPageParams {
    lessonId: string;
    user: any;
    router: AppRouterInstance;
    channelName: string;
}

interface AgoraViewParams {
    lessonId: string;
    user: any;
    token: string;
    router: AppRouterInstance;
    channelName: string;
}

interface AgoraPageProps {
    params: AgoraPageParams;
}

const AgoraView = ({ params }: {params:AgoraViewParams}) => {
    const t = useTranslations('Meeting');
    
    const [appId, setAppId] = useState<string>(process.env.NEXT_PUBLIC_AGORA_APP_ID || "<-- Insert App ID -->");
    const [channel, setChannel] = useState<string>(params.channelName);
    const [token, setToken] = useState<string>(params.token || '');
    const [calling, setCalling] = useState<boolean>(false);
    
    const [teacherDisconnectModal, setTeacherDisconnectModal] = useState<boolean>(false);
    const [ endLessonLoading, setEndLessonLoading ] = useState<boolean>(false);
    
    useEffect(()=> {
        console.log(appId, ' chn ',params.channelName, ' tk ', token, params.lessonId)
        setCalling(true);
    }, [params])
    
    
    const [micOn, setMic] = useState<boolean>(true);
    const [cameraOn, setCamera] = useState<boolean>(false);
    const { localMicrophoneTrack } = useLocalMicrophoneTrack(micOn);
    const { localCameraTrack } = useLocalCameraTrack(cameraOn);
    
    useJoin({ appid: appId, channel: channel, token: token ? token : null, uid: params?.user?.id ? params.user.id : null }, calling);
    usePublish([localMicrophoneTrack, localCameraTrack]);
    
    const remoteUsers = useRemoteUsers();
    
    const [userSpeaking, setUserSpeaking] = useState<boolean>(false);
    
    useEffect(() => {
        let interval: any;

        if (localMicrophoneTrack) {
            interval = setInterval(() => {
                let volume = 0;
                if (micOn)
                    volume = localMicrophoneTrack.getVolumeLevel(); // value between 0 and 1
                if (volume > 0.3) {
                    setUserSpeaking(true);
                } else {
                    setUserSpeaking(false);
                }
            }, 100); // Poll every 100ms
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [localMicrophoneTrack, micOn]);
    
    const [remoteSpeakingUsers, setRemoteSpeakingUsers] = useState<Record<string, boolean>>({});
    useEffect(() => {
        console.log("Remote users:", remoteUsers);
        const interval = setInterval(() => {
            const speakingMap: Record<string, boolean> = {};

            remoteUsers.forEach(user => {
                const audioTrack = user.audioTrack;
                if (audioTrack && audioTrack.getVolumeLevel) {
                    const volume = audioTrack.getVolumeLevel(); // 0.0 to 1.0
                    const isSpeaking = volume > 0.3;
                    speakingMap[user.uid] = isSpeaking;
                }
            });

            setRemoteSpeakingUsers(speakingMap);
        }, 100);

        return () => clearInterval(interval);
    }, [remoteUsers]);
    
    const container = useRef<HTMLDivElement>(null);
    const containerToSetHeight = useRef<HTMLDivElement>(null);
    
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollingRef = useRef<HTMLDivElement>(null);
    const controlsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const updateHeight = () => {
            if (!containerRef.current || !scrollingRef.current || !controlsRef.current) return;
            const containerHeight = containerRef.current.clientHeight;
            const controlsHeight = controlsRef.current.clientHeight;
            const availableHeight = containerHeight - controlsHeight;

            scrollingRef.current.style.height = `${availableHeight}px`;
        };

        updateHeight();
        window.addEventListener('resize', updateHeight);
        return () => window.removeEventListener('resize', updateHeight);
    }, []);
    
    
    return (
        <div className={styles.agoraContainer}>
            <div className={styles.usersContainer} ref={containerRef}>
                <div className={styles.usersContainerForScrolling} ref={scrollingRef}>
                    <LocalUser
                        audioTrack={localMicrophoneTrack}
                        playAudio={false}
                        playVideo={cameraOn}
                        cameraOn={cameraOn}
                        micOn={micOn}
                        videoTrack={localCameraTrack}
                        className={classNames(styles.localUser, userSpeaking? styles.userSpeaking : '')}
                        cover={'/user.png'}
                    >
                        <div className={styles.userName}>
                            {(params.user?.firstName+' '+params.user?.lastName)}
                        </div>
                    </LocalUser>
                    {remoteUsers.map((user: any) => (
                        <RemoteUser
                            user={user}
                            className={classNames(styles.remoteUser, remoteSpeakingUsers[user.uid] ? styles.userSpeaking : '')}
                            key={user.uid}
                            cover={'/user.png'}
                        >
                            {/* <div className={styles.userName}>
                                {user?.firstName + ' ' + user?.lastName}
                            </div> */}
                        </RemoteUser>
                    ))}
                </div>
            </div>
            <div className={styles.controls} ref={controlsRef}>
                <div className={styles.callControls}>
                    <Button
                        icon={!cameraOn?<FiCameraOff />:<FiCamera />}
                        className={classNames(styles.callButton, cameraOn? styles.activeBtn : styles.inactiveBtn)}
                        onClick={() => setCamera(!cameraOn)}
                    >
                    </Button>
                    <Button
                        icon={!micOn ? <BiMicrophoneOff /> : <BiMicrophone />}
                        className={classNames(styles.callButton, micOn? styles.activeBtn : styles.inactiveBtn)}
                        onClick={() => setMic(!micOn)}
                    >
                    </Button>
                </div>
                
                <Button
                    icon={<MdOutlineCallEnd />}
                    className={styles.button}
                    danger
                    onClick={() => {
                        if (params?.user?.role === 'teacher')
                            setTeacherDisconnectModal(true);
                        else {
                            Modal.info({
                                title: t('modals.disconnectTitle'),
                                content: (
                                    <div>
                                        <p style={{fontSize:'17px'}}>{t('modals.studentDisconnect.confirmMessage')}</p>
                                        <p style={{fontSize:'17px'}}>{t('modals.studentDisconnect.reconnectMessage')}</p>
                                    </div>
                                ),
                                footer: (_) => {
                                    return <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                                        <Button
                                            onClick={() => {
                                                Modal.destroyAll();
                                            }}
                                        >
                                            {t('buttons.cancel')}
                                        </Button>
                                        <Button
                                            type="primary"
                                            onClick={async () => {
                                                localMicrophoneTrack?.close();
                                                localCameraTrack?.close();
                                                params.router.push('/home')
                                                message.success(t('success.disconnected'));
                                                Modal.destroyAll();
                                            }}
                                        >
                                            {t('buttons.disconnect')}
                                        </Button>
                                    </div>
                                },
                                width: 500,
                            })
                        }
                    }}
                >
                    {t('buttons.disconnect')}
                </Button>
            </div>
            
            <Modal
                open={teacherDisconnectModal}
                onCancel={() => setTeacherDisconnectModal(false)}
                width={600}
                title={<div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'start',
                    gap: '10px',
                    fontSize: '20px',
                }}> <InfoCircleFilled style={{color:'#3d8eff', fontSize:'25px'}}/> { t('modals.disconnectTitle') }</div>}
                footer={(_) => {
                    return <div style={{ display: 'flex', justifyContent: 'center', width: '100%', gap: '15px' }}>
                        <Button
                            onClick={() => {
                                Modal.destroyAll();
                            }}
                        >
                            {t('buttons.cancel')}
                        </Button>
                        <Button
                            type="primary"
                            onClick={async () => {
                                localMicrophoneTrack?.close();
                                localCameraTrack?.close();
                                params.router.push('/home')
                                message.success(t('success.disconnected'));
                                Modal.destroyAll();
                            }}
                        >
                            {t('buttons.disconnect')}
                        </Button>
                        <Button
                            loading={endLessonLoading}
                            type='primary'
                            onClick={async () => {
                                setEndLessonLoading(true);
                                localMicrophoneTrack?.close();
                                localCameraTrack?.close();
                                const result = await closeLesson(params.lessonId);
                                setEndLessonLoading(false);
                                if (!result.id) {
                                    message.error(t('errors.closeLessonFailed'));
                                    return;
                                }
                                Modal.destroyAll();
                                params.router.push('/home')
                                message.success(t('success.lessonEnded'));
                            }}
                        >
                            {t('buttons.endLesson')}
                        </Button>
                    </div>
                }}
            >
                <div style={{margin:'20px 40px'}}>
                    <p style={{fontSize:'17px'}}>{t('modals.teacherDisconnect.confirmMessage')}</p>
                    <p style={{fontSize:'17px'}}>{t('modals.teacherDisconnect.optionsMessage')}</p>
                </div>
            </Modal>
            
        </div>
    );
}

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
AgoraRTC.setLogLevel(3);
export default function AgoraPage({ params }: AgoraPageProps) {
    const t = useTranslations('Meeting');

    const [token, setToken] = useState<string>('');
    
    useEffect(() => {
        if (!params.lessonId) {
            console.error(t('agora.errors.lessonIdRequired'));
            return;
        }
        const fetchToken = async () => {
            try {
                const response = await generateAgoraToken({ lessonId: params.lessonId });
                if (response?.token) {
                    console.log("Fetched Agora token:", response);
                    setToken(response.token);
                } else {
                    console.error(t('agora.errors.tokenFetchFailed'));
                }
            } catch (error) {
                console.error(t('agora.errors.tokenFetchError'), error);
            }
        };
        fetchToken();
    }, [params.lessonId, t]);
    
    
    return (
        <AgoraRTCProvider client={client}>
            {token&&params.channelName?<AgoraView params={{...params, token}} />:null}
        </AgoraRTCProvider>
    );
}