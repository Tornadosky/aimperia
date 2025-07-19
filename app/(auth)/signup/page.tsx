'use client';

import { useState } from 'react';
import {
  Button,
  Form,
  Input,
  Radio,
  Typography,
  Divider,
  Space,
} from 'antd';
import { GoogleOutlined, UserAddOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';

const { Title } = Typography;

export default function SignUp() {
  const [role, setRole] = useState<'student' | 'teacher' | null>(null);

  const handleFinish = (values: any) => {
    console.log('Форма отправлена:', values);
    // Here you would send values to your backend
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto', padding: '40px 20px' }}>
      <Title level={2} style={{ textAlign: 'center' }}>Регистрация</Title>

      <Form layout="vertical" onFinish={handleFinish}>
        <Form.Item
          label="Имя"
          name="firstName"
          rules={[{ required: true, message: 'Пожалуйста, введите имя' }]}
        >
          <Input placeholder="Иван" />
        </Form.Item>

        <Form.Item
          label="Фамилия"
          name="lastName"
          rules={[{ required: true, message: 'Пожалуйста, введите фамилию' }]}
        >
          <Input placeholder="Иванов" />
        </Form.Item>

        <Form.Item
          label="Электронная почта"
          name="email"
          rules={[{ required: true, message: 'Введите корректный email', type: 'email' }]}
        >
          <Input prefix={<MailOutlined />} placeholder="you@example.com" />
        </Form.Item>

        <Form.Item
          label="Пароль"
          name="password"
          rules={[{ required: true, message: 'Введите пароль' }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="••••••••" />
        </Form.Item>

        <Form.Item
          label="Вы —"
          name="role"
          rules={[{ required: true, message: 'Пожалуйста, выберите роль' }]}
        >
          <Radio.Group onChange={e => setRole(e.target.value)} style={{ width: '100%' }}>
            <Radio.Button value="student" style={{width:'50%'}}>Ученик</Radio.Button>
            <Radio.Button value="teacher" style={{width:'50%'}}>Преподаватель</Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            icon={<UserAddOutlined />}
            block
          >
            Зарегистрироваться
          </Button>
        </Form.Item>
      </Form>

      <Divider plain>или</Divider>

      <Space direction="vertical" style={{ width: '100%' }}>
        <Button
          icon={<GoogleOutlined />}
          href="/signup/google"
          type="default"
          block
        >
          Зарегистрироваться через Google
        </Button>
      </Space>
    </div>
  );
}
