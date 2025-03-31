import { Input, Form } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone, UserOutlined, LockOutlined } from '@ant-design/icons';
import React from 'react';

function LoginPasswordInput() {

    return (
        <div>
            <Form.Item
                name="username"
                rules={[{ required: true, message: 'Поле логина должно быть заполнено' }]}>
                <Input
                    maxLength={50}
                    placeholder="Логин"
                    prefix={<UserOutlined />}
                />
            </Form.Item>

            <Form.Item
                name="password"
                rules={[{ required: true, message: 'Поле пароля должно быть заполнено' }]}>
                <Input.Password
                    placeholder="Пароль"
                    iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                    prefix={<LockOutlined />}
                />
            </Form.Item>
        </div>
    );

}

export default LoginPasswordInput;