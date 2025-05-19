import React, { useEffect, useState } from 'react';
import { Menu, message, ConfigProvider, Layout, Button, Flex } from 'antd';
import Icon, { AppstoreAddOutlined, AppstoreOutlined, PieChartOutlined, TeamOutlined, ClockCircleOutlined, MenuOutlined, SettingOutlined } from '@ant-design/icons';
import '@ant-design/v5-patch-for-react-19';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

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

const menuItems = [
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

    const [selectedKey, setSelectedKey] = useState(getActiveTab());

    // Выбор вкладки меню
    const handleMenuClick = (itemMenuKey) => {
        console.log("Click menu", itemMenuKey)
        setSelectedKey(itemMenuKey); // Обновляем состояние
        if (onMenuClick) {
            onMenuClick(itemMenuKey); // Пробрасываем событие в родительский компонент
        }
    };

    useEffect(() => {
        setSelectedKey(getActiveTab());
      }, [location.pathname, activeTab, location.state]);

    return (
        <Footer style={FooterStyle}>
            <Flex justify="space-between" align="center" style={{ height: '100%' }}>
                {menuItems.map((item) => (
                <Flex 
                    key={item.key}
                    vertical 
                    align="center" 
                    justify="center"
                    onClick={() => handleMenuClick(item.key)}
                    style={{
                        height: '100%',
                        flex: 1,
                        opacity: activeTab === item.key ? 1 : 0.6,
                        transition: 'opacity 0.2s',
                    }}
                >
                    {React.cloneElement(item.icon, { 
                    style: { 
                        fontSize: '20px', 
                        color: '#fff',
                    } 
                    })}
                    <span style={{
                        color: '#fff',
                        fontSize: '12px',
                        textAlign: 'center'
                    }}>
                    {item.label}
                    </span>
                </Flex>
                ))}
            </Flex>
    </Footer>
    );
}

export default MyMenuMobile;
