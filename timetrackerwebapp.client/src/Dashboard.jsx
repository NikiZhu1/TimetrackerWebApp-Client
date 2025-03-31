import React, { useEffect } from 'react';
import { Button, message } from 'antd';
import '@ant-design/v5-patch-for-react-19';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

function Dashboard() {
    const navigate = useNavigate();

    useEffect(() => {
        const token = Cookies.get('token'); // Получаем токен из cookies
        if (!token) {
            message.warning('Сначала войдите в систему');
            navigate('/');
        }
    }, []);

    const handleLogout = () => {
        Cookies.remove('token'); // Удаляем токен
        message.info('Вы вышли из системы');
        navigate('/');
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '20vh' }}>
            <h1>Добро пожаловать!</h1>
            <p>Вы успешно вошли в систему.</p>
            <Button type="primary" onClick={handleLogout}>Выйти</Button>
        </div>
    );
}

export default Dashboard;
