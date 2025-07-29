import React, { useContext } from 'react';
import { Modal, Form, Input, Button, Select, message } from 'antd';
import { useAuth } from '../../../context/AuthContext';
import styles from './UpdateUserModal.module.css';
import { useState, useEffect } from 'react';
import { updateProfile } from '@/app/lib/auth';
import { useTranslations } from 'next-intl';

export default function UpdateUserModal() {
    const [updateForm] = Form.useForm();
    const { user, setUser } = useAuth();
    const [roleSelectModal, setRoleSelectModal] = useState(false);
    const t = useTranslations('Home.updateUserModal');
    
    useEffect(() => {
        if (user?.role==='pending' && user?.id) {
            setRoleSelectModal(true);
            return;
        }
        
    }, [user]);
    
    return (
        <Modal
                title={t('title')}
                open={roleSelectModal}
                footer={null}
                closable={false}
                onCancel={() => { }}
            >
                <Form
                    form={updateForm}
                >
                    <Form.Item
                        label={t('firstName.label')}
                        name="firstName"
                        rules={[{ required: true, message: t('firstName.error') }]}
                    >
                        <Input placeholder={t('firstName.placeholder')} className={styles.input} />
                    </Form.Item>
                    <Form.Item
                        label={t('lastName.label')}
                        name="lastName"
                        rules={[{ required: true, message: t('lastName.error') }]}
                    >
                        <Input placeholder={t('lastName.placeholder')} className={styles.input} />
                    </Form.Item>
                    <Form.Item
                        label={t('role.label')}
                        name="role"
                        rules={[{ required: true, message: t('role.error') }]}
                    >
                        <Select
                            placeholder={t('role.placeholder')}
                        >
                            <Select.Option value="teacher">{t('role.options.teacher')}</Select.Option>
                            <Select.Option value="student">{t('role.options.student')}</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Button
                            type="primary"
                            onClick={async () => {
                                const formValidation = await updateForm.validateFields().then(() => {
                                    return { errorFields: null };
                                }).catch((error) => {
                                    return { errorFields: error.errorFields };
                                });
                                console.log('formValidation', formValidation);
                                if (formValidation.errorFields) {
                                    message.error(t('errors.fillFields'));
                                    return;
                                }
                                const result = await updateProfile(updateForm.getFieldsValue());
                                if (result?.id) {
                                    setUser({
                                        ...user,
                                        ...result
                                    });
                                    setRoleSelectModal(false)
                                }
                                else {
                                    message.error(t('errors.updateFailed'));
                                    console.error('Ошибка при обновлении профиля:', result);
                                    return;
                                }
                                
                            }}
                            style={{ width: '100%' }}
                        >
                            {t('submitButton')}
                        </Button>
                    </Form.Item>
                </Form>
        </Modal>
    );
}