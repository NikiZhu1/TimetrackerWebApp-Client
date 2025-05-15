import React, { useState } from 'react';
import { Button, Typography, Input, Divider, Form } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone, UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title } = Typography;

/** Компонент формы авторизации/регистрации
 * @param {string} title Заголовок формы.
 * @param {Function} onFinish Функция, вызываемая при отправке формы.
 * @param {string} buttonText Текст кнопки.
 * @param {string} linkText Текст ссылки.
 * @param {string} linkTo Путь ссылки.
 */
function AuthForm({ 
    title, 
    onFinish, 
    buttonText, 
    linkText, 
    linkTo,
    loading 
}) {

    // const [loadings, setLoadings] = useState([]);
    // const enterLoading = index => {
    //     setLoadings(prevLoadings => {
    //         const newLoadings = [...prevLoadings];
    //         newLoadings[index] = true;
    //         return newLoadings;
    //     });
    //     setTimeout(() => {
    //         setLoadings(prevLoadings => {
    //             const newLoadings = [...prevLoadings];
    //             newLoadings[index] = false;
    //             return newLoadings;
    //         });
    //     }, 3000);
    // };

    return (
        <Form
            name="auth-form"
            initialValues={{ remember: true }}
            onFinish={onFinish}>

            <Title style={{ textAlign: 'center' }} level={3}>{title}</Title>

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

            <Form.Item>
                <Button block type="primary" htmlType="submit" loading={loading}>
                    {buttonText}
                </Button>
            </Form.Item>

            <Link to={linkTo}>{linkText}</Link>

            <Divider plain>или</Divider>

            <Form.Item style={{ margin: '0' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <Button block disabled>
                        Продолжить c Telegram
                    </Button>
                    <span className="telegram-description">(Скоро) Больше возможностей, продолжив с помощью Telegram</span>
                </div>
            </Form.Item>

        </Form>
    );
}

export default AuthForm;
