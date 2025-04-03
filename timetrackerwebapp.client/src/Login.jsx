import { message } from 'antd';
import '@ant-design/v5-patch-for-react-19';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../node_modules/axios/index';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

//Компоненты
import AuthForm from './components/AuthForm.jsx';

function Login() {
    const navigate = useNavigate(); // Хук для навигации между страницами

    //Авторизация
    const onFinish = async (values) => {
        try {
            console.log('Вход:', values);

            //Пост-запрос
            const response = await axios.post('http://localhost:8080/api/Users', {
                IsNewUser: false,
                Name: values.username,
                Password: values.password
            });

            // Сохраняем токен в cookies
            const token = response.data.Token;
            if (!token) {
                throw new Error('Токен отсутствует в ответе сервера');
            }

            let userId;
            try {
                const decoded = jwtDecode(token);
                userId = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];

                if (!userId) {
                    throw new Error('Не удалось извлечь userId из токена');
                }
            } catch (decodeError) {
                console.error('Ошибка при декодировании токена:', decodeError);
                message.error('Ошибка аутентификации. Попробуйте снова.');
                return;
            }

            Cookies.set('token', token, { expires: 1, secure: true, sameSite: 'Strict' });

            message.success('Успешный вход!');
            console.log('Авторизованный userId:', userId);

            navigate('/dashboard'); // Перенаправляем на страницу пользователя
        } catch (error) {
            console.error('Ошибка входа:', error);
            message.error(error.response?.data || 'Ошибка авторизации');
        }
    };


    //Тест получения пользователей с бэка
    //const getUsers = () => {
    //    axios.get('http://localhost:8080/api/Users').then(r => {
    //        console.log('r', r)
    //    })
    //}

    //Выполнение код при загрузке страницы
    //useEffect(() => {
    //    getUsers()
    //}, []);

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            flexDirection: 'column'
        }}>
            <div style=
            {{
                width: 340,
                border: '1px solid rgb(50 50 50 / 20%)',
                padding: 24,
                borderRadius: 16,
                display: 'flex',
                flexDirection: 'column'
            }}>
                <AuthForm
                    title="Авторизация"
                    onFinish={onFinish}
                    buttonText="Войти"
                    linkText="Нет аккаунта? Зарегистрироваться"
                    linkTo="/register"/>
            </div>
        </div>
    );
}

export default Login;