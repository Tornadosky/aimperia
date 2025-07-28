
import React, { useContext } from 'react';
import { Modal, Form, Input, Button, Select } from 'antd';
import { useAuth } from '../../../context/AuthContext';
import styles from './UpdateUserModal.module.css';
import { useState, useEffect } from 'react';


export default function UpdateUserModal() {
    const updateForm = Form.useFormInstance();
    const { user, setUser } = useAuth();
    const [roleSelectModal, setRoleSelectModal] = useState(false);
    
    useEffect(() => {
        if (user?.role==='pending' && user?.id) {
            setRoleSelectModal(true);
            return;
        }
        
    }, [user]);
    
    return (
        <Modal
                title="Подтвердите свои данные"
                open={roleSelectModal}
                footer={null}
                closable={false}
                onCancel={() => { }}
            >
                <Form
                    form={updateForm}
                >
                    <Form.Item
                        label="Имя"
                        name="firstName"
                        rules={[{ required: true, message: 'Пожалуйста, введите имя' }]}
                    >
                        <Input placeholder="Иван" className={styles.input} />
                    </Form.Item>
                    <Form.Item
                        label="Фамилия"
                        name="lastName"
                        rules={[{ required: true, message: 'Пожалуйста, введите фамилию' }]}
                    >
                        <Input placeholder="Иванов" className={styles.input} />
                    </Form.Item>
                    <Form.Item
                        label="Выберите роль"
                        name="role"
                        rules={[{ required: true, message: 'Пожалуйста, выберите роль' }]}
                    >
                        <Select
                            placeholder="Выберите роль"
                        >
                            <Select.Option value="teacher">Учитель</Select.Option>
                            <Select.Option value="student">Ученик</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Button
                            type="primary"
                            onClick={() => {
                                
                                setRoleSelectModal(false)
                            }}
                            style={{ width: '100%' }}
                        >
                            Подтвердить
                        </Button>
                    </Form.Item>
                </Form>
        </Modal>
    );
}