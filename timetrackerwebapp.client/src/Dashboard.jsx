import React, { useEffect, useState } from 'react';
import { Button, message, Layout, Collapse, ConfigProvider, Flex, Typography, Skeleton, Image } from 'antd';
import Icon from '@ant-design/icons';
import '@ant-design/v5-patch-for-react-19';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { subscribe } from './event.jsx';

//Стили
import './Collapse.css';

//Методы
import { GetJWT, GetUserIdFromJWT } from './methods/UsersMethods.jsx';
import { useActivities } from './useActivities.jsx';

//Компоненты
import MyMenu from './components/Menu.jsx';

import Activities from './pages/ActivitiesTab.jsx';

const { Header, Footer, Sider, Content } = Layout;

//Тест своих иконок
const HistorySvg = () => (
    <svg width="24" height="23" viewBox="0 0 24 23" fill="none" xmlns="http://www.w3.org/2000/svg">
        <title>history icon</title>
        <path d="M12 5.5V11.5L16 13.5M22 11.5C22 17.0228 17.5228 21.5 12 21.5C6.47715 21.5 2 17.0228 2 11.5C2 5.97715 6.47715 1.5 12 1.5C17.5228 1.5 22 5.97715 22 11.5Z" stroke="#B4B4B4" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
);
const HistoryIcon = props => <Icon component={HistorySvg} {...props} />;

const HeaderStyle = {
    background: '#fff',
    position: 'sticky',
    top: 0,
    zIndex: 1,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    height: '48px',
    padding: '24px'
};

function Dashboard() {
    const { activities, periods, loading, loadData, actCard_Click, getActivityStartTime, countStatus1 } = useActivities();
    const navigate = useNavigate();

    // Состояние для активной вкладки
    const [activeTab, setActiveTab] = useState('menu1'); 

    // Обработчик изменения вкладки
    const handleMenuClick = (key) => {
        setActiveTab(key);
    };

    useEffect(() => {

        const token = GetJWT();
        const userId = GetUserIdFromJWT(token);

        if (!token || !userId) {
            if (!token) message.warning('Сначала войдите в систему');
            if (!userId) Cookies.remove('token');
            navigate('/');
            return;
        }

        console.log("Используемый userId:", userId);

        const fetchAll = async () => {

            console.log("Событие");
            try {
                await loadData(token, userId);
            } catch (error) {
                console.error('Ошибка загрузки данных:', error);
                message.error('Не удалось загрузить данные');
            }
        };

        fetchAll();
        subscribe('activityChanged', fetchAll); // Подписка

    }, []);

    // Рендер контента в зависимости от вкладки
    const renderContent = () => {
        switch (activeTab) {
            case 'menu1': // Активности
                return (<Activities />);

            case 'menu2': // Статистика
                return <div>Контент статистики</div>;

            case 'menu3': // История
                return <div>Контент истории</div>;

            case 'menu4': // Проекты
                return <div>Контент проектов</div>;

            default:
                return (<Activities />);
        }
    };

    return (
        <div>
            <Layout>
                <MyMenu onMenuClick={handleMenuClick} />
                <Layout>
                    <Header style={HeaderStyle}>Headerrr</Header>
                    <Content style={{ padding: '24px', paddingTop: '0px' }} >
                        {renderContent()}
                    </Content>
                    <Footer>Footer</Footer>
                </Layout>
            </Layout>
        </div>
    );
}

export default Dashboard;
