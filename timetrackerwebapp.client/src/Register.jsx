import { message } from 'antd';
import '@ant-design/v5-patch-for-react-19';
import React from 'react';
import { useNavigate } from 'react-router-dom';

//Свои методы
import { AuthenticateUser } from './methods/Auth.jsx';

//Компоненты
import AuthForm from './components/AuthForm.jsx';

function Register() {
    const navigate = useNavigate(); // Хук для навигации между страницами

    //Регистрация
    const onFinish = async (values) => {
        AuthenticateUser(values, true, navigate);
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
