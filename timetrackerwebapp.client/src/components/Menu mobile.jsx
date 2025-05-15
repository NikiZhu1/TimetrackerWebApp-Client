import React, { useEffect, useState } from 'react';
import { Menu, message, ConfigProvider, Layout, Button, Flex } from 'antd';
import Icon, { AppstoreAddOutlined, AppstoreOutlined, PieChartOutlined, TeamOutlined, ClockCircleOutlined, MenuOutlined, SettingOutlined } from '@ant-design/icons';
import '@ant-design/v5-patch-for-react-19';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';

const { Footer } = Layout;

//Компоненты

const FooterStyle = {
    background: '#282828',
    height: '50px',
    position: 'sticky',
    insetInlineStart: 0,
    top: 0,
    bottom: 0,
    padding: 0
};

const items = [
    { key: 'activities', icon: <AppstoreAddOutlined />, label: 'Активности' },
    { key: 'statistics', icon: <PieChartOutlined />, label: 'Статистика' },
    { key: 'history', icon: <ClockCircleOutlined />, label: 'История' },
    { key: 'projects', icon: <TeamOutlined />, label: 'Проекты' },
];

function MyMenuMobile({ onMenuClick }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { activeTab } = useParams(); // Получаем активную вкладку из URL

    // Определяем активную вкладку на основе URL и state
    const getActiveTab = () => {
        // 1. Проверяем state из navigation
        if (location.state?.activeTab) return location.state.activeTab;
        
        // 2. Проверяем параметр из URL
        if (activeTab) return activeTab;
        
        // 3. Проверяем путь
        if (location.pathname.includes('/projects')) return 'projects';
        if (location.pathname.includes('/history')) return 'history';
        
        return 'activities'; // Значение по умолчанию
    };

    const [collapsed, setCollapsed] = useState(false);
    const [selectedKey, setSelectedKey] = useState(getActiveTab());

    //Скрытие-разворот меню
    const toggleCollapsed = () => {
        setCollapsed(!collapsed);
    };

    //Функция при выходе
    const handleLogout = () => {
        Cookies.remove('token'); // Удаляем токен
        message.info('Вы вышли из системы');
        navigate('/');
    };

    // Выбор вкладки меню
    const handleMenuClick = (e) => {
        console.log("Click menu", e.key)
        setSelectedKey(e.key); // Обновляем состояние
        if (onMenuClick) {
            onMenuClick(e.key); // Пробрасываем событие в родительский компонент
        }
    };

    useEffect(() => {
        setSelectedKey(getActiveTab());
      }, [location.pathname, activeTab, location.state]);

    const renderButton = () => {
        return items
            .map(item => (
                <Flex key={item.key} vertical align='center' justify='center'>
                    {React.cloneElement(item.icon, { style: { fontSize: '28px', color: '#fff' } })}
                    <p style={{color: '#fff'}}>{item.label}</p>
                </Flex>
            ));
    };

    return (
        <Footer style = {FooterStyle}>
            <Flex justify='space-between'>
                {renderButton()}
            </Flex>
            
        </Footer>
    );
}

export default MyMenuMobile;
