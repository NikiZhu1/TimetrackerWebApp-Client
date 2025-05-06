import React, { useEffect, useState } from 'react';
import { Menu, message, ConfigProvider, Layout, Button, Flex } from 'antd';
import Icon, { AppstoreAddOutlined, AppstoreOutlined, PieChartOutlined, TeamOutlined, ClockCircleOutlined, MenuOutlined, SettingOutlined } from '@ant-design/icons';
import '@ant-design/v5-patch-for-react-19';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';

const { Sider } = Layout;

//Компоненты
import MenuButton from './MenuButton.jsx';

const SiderStyle = {
    background: '#282828',
    overflow: 'auto',
    height: '100vh',
    position: 'sticky',
    insetInlineStart: 0,
    top: 0,
    bottom: 0,
    scrollbarWidth: 'thin',
    scrollbarGutter: 'auto',
};

const items = [
    { key: 'activities', icon: <AppstoreAddOutlined />, label: 'Активности' },
    { key: 'statistics', icon: <PieChartOutlined />, label: 'Статистика' },
    { key: 'history', icon: <ClockCircleOutlined />, label: 'История' },
    { key: 'projects', icon: <TeamOutlined />, label: 'Проекты' },
    {
        key: 'menu5',
        label: 'Navigation Two',
        icon: <AppstoreOutlined />,
        children: [
            { key: '9', label: 'Option 9' },
            { key: '10', label: 'Option 10' },
            {
                key: 'sub3',
                label: 'Submenu',
                children: [
                    { key: '11', label: 'Option 11' },
                    { key: '12', label: 'Option 12' },
                ],
            },
        ],
    },
];

function MyMenu({ onMenuClick }) {
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

    return (
        <Sider width='225px' style={SiderStyle} collapsible collapsed={collapsed} trigger={null}>
            <Flex vertical justify='space-between' style={{ height: '100%' }}>
                {/* Верхний блок (меню и кнопка сворачивания) */}
                <div>
                    <Flex justify='flex-end' style={{ margin: '4px' }}>
                        <Button
                            color="default"
                            variant="text"
                            size="large"
                            icon={<MenuOutlined style={{ color: '#fff' }} />}
                            onClick={toggleCollapsed}
                        />
                    </Flex>
                    <ConfigProvider
                        theme={{
                            components: {
                                Menu: {
                                    darkItemBg: 'none',
                                    darkSubMenuItemBg: 'none',
                                    darkPopupBg: '#282828',
                                    darkItemSelectedBg: '#fff',
                                    darkItemSelectedColor: '#185de4',
                                    darkItemHoverColor: '#fff',
                                    darkItemColor: '#B4B4B4',
                                    iconSize: 16
                                },
                            },
                        }}>
                        <Menu
                            selectedKeys={[selectedKey || 'activities']} //по умолчанию открытая вкладка
                            defaultOpenKeys={['p1']} //по умолчанию открытое под-меню
                            inlineIndent={12}
                            mode="inline"
                            theme="dark"
                            inlineCollapsed={collapsed}
                            items={items}
                            onClick={handleMenuClick}
                        />
                    </ConfigProvider>
                </div>

                {/* Нижний блок (кнопка настроек) */}
                <Flex vertical gap="small" style={{ padding: '8px' }}>
                    <MenuButton
                        collapsed={collapsed}
                        text='Бот в Telegram'
                        icon={<SettingOutlined />}
                        href="https://t.me/timetracking_hse_bot"
                        onClick={null}/>

                    {/* <MenuButton
                        collapsed={collapsed}
                        text='Настройки'
                        icon={<SettingOutlined />}
                        onClick={handleLogout}
                        border='none'/> */}
                </Flex>
            </Flex>
        </Sider>
    );
}

export default MyMenu;
