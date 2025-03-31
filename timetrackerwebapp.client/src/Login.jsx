import { Button, Input, Typography, Divider, Form, message } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone, UserOutlined, LockOutlined } from '@ant-design/icons';
import '@ant-design/v5-patch-for-react-19';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../node_modules/axios/index';
import InputLogin from './components/card.jsx';
import Cookies from 'js-cookie';

const { Title } = Typography;

function Login() {
    const navigate = useNavigate(); // Хук для навигации между страницами

    //Пост-запрос, авторизация
    const onFinish = async (values) => {
        try {
            const response = await axios.post('http://localhost:8080/api/Users', {
                IsNewUser: false,
                Name: values.username,
                Password: values.password,
                ChatId: 0
            });

            // Сохраняем токен в cookies
            const token = response.data.Token;
            Cookies.set('token', token, { expires: 1, secure: true, sameSite: 'Strict' });

            message.success('Успешный вход!');
            navigate('/dashboard'); // Перенаправляем на страницу пользователя
        } catch (error) {
            message.error('Ошибка авторизации');
            console.error('Ошибка входа:', error);
        }
    };

    const getUsers = () => {
        axios.get('http://localhost:8080/api/Users').then(r => {
            console.log('r', r)
        })
    }

    //Выполнение код при загрузке страницы
    useEffect(() => {
        getUsers()
    }, []);

    const [passwordVisible, setPasswordVisible] = React.useState(false);
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            flexDirection: 'column'
        }}>
            <Form
                name="login"
                initialValues={{ remember: true }}
                onFinish={onFinish}
                style={{
                    width: 340,
                    border: '1px solid rgb(50 50 50 / 20%)',
                    padding: 24,
                    borderRadius: 16,
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <Title style={{ textAlign: 'center' }} level={3}>Авторизация</Title>

                <Form.Item
                    name="username"
                    rules={[{ required: true, message: 'Поле логина должно быть заполнено' }]}
                >
                    <Input
                        maxLength={50}
                        placeholder="Логин"
                        prefix={<UserOutlined />}
                    />
                </Form.Item>

                <Form.Item
                    name="password"
                    rules={[{ required: true, message: 'Поле пароля должно быть заполнено' }]}
                >
                    <Input.Password
                        placeholder="Пароль"
                        iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                        prefix={<LockOutlined />}
                    />
                </Form.Item>

                <Form.Item>
                    <Button block type="primary" htmlType="submit">
                        Войти
                    </Button>
                </Form.Item>

                <Divider plain style={{ margin: '0' }}>или</Divider>

            </Form>
        </div>
    );
}

export default Login;