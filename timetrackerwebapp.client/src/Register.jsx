import { message } from 'antd';
import '@ant-design/v5-patch-for-react-19';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../node_modules/axios/index';
import Cookies from 'js-cookie';

//Компоненты
import AuthForm from './components/AuthForm.jsx';

function Register() {
    const navigate = useNavigate(); // Хук для навигации между страницами

    //Пост-запрос, регистрация
    const onFinish = async (values) => {
        try {
            console.log('Регистрация:', values);

            const response = await axios.post('http://localhost:8080/api/Users', {
                IsNewUser: true,
                Name: values.username,
                Password: values.password,
                ChatId: 0
            });

            // Сохраняем токен в cookies
            const token = response.data.Token;
            Cookies.set('token', token, { expires: 1, secure: true, sameSite: 'Strict' });

            message.success('Успешная регистрация!');
            navigate('/dashboard'); // Перенаправляем на страницу пользователя
        } catch (error) {
            message.error(error.response.data);
            console.error('Ошибка регистрации:', error);
        }
    };

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
                    title="Регистрация" 
                    onFinish={onFinish}
                    buttonText="Зарегестрироваться" 
                    linkText="Уже есть аккаунь? Войти" 
                    linkTo="/" /> 
            </div> 
        </div>
    );
}

export default Register;
