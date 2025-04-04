import React, { useEffect, useState } from 'react';
import { Menu, ConfigProvider, Layout, Button, Flex } from 'antd';
import Icon, { AppstoreAddOutlined, AppstoreOutlined, PieChartOutlined, TeamOutlined, ClockCircleOutlined, MenuOutlined, SettingOutlined } from '@ant-design/icons';
import '@ant-design/v5-patch-for-react-19';

const { Header, Footer, Sider, Content } = Layout;

//Компоненты
import MenuButton from './MenuButton.jsx';

//Тест своих иконок
const HistorySvg = () => (
    <svg width="24" height="23" viewBox="0 0 24 23" fill="none" xmlns="http://www.w3.org/2000/svg">
        <title>history icon</title>
        <path d="M12 5.5V11.5L16 13.5M22 11.5C22 17.0228 17.5228 21.5 12 21.5C6.47715 21.5 2 17.0228 2 11.5C2 5.97715 6.47715 1.5 12 1.5C17.5228 1.5 22 5.97715 22 11.5Z" stroke="#B4B4B4" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
);
const HistoryIcon = props => <Icon component={HistorySvg} {...props} />;


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
    { key: '1', icon: <AppstoreAddOutlined />, label: 'Активности' },
    { key: '2', icon: <PieChartOutlined />, label: 'Статистика' },
    { key: '3', icon: <ClockCircleOutlined />, label: 'История' },
    {
        key: '4', icon: <TeamOutlined />, label: 'Проекты',
        children: [
            { key: 'p1', label: 'Проект 1' },
            { key: 'p2', label: 'Проект 2' },
            { key: 'p3', label: 'Проект 3' }
        ],
    },
    {
        key: '5',
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

function MyMenu() {

    const [collapsed, setCollapsed] = useState(false);

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

    return (
        <Sider width='200px' style={SiderStyle} collapsible collapsed={collapsed} trigger={null}>
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
                            defaultSelectedKeys={['1']}
                            defaultOpenKeys={['p1']}
                            inlineIndent={12}
                            mode="inline"
                            theme="dark"
                            inlineCollapsed={collapsed}
                            items={items}
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

                    <MenuButton
                        collapsed={collapsed}
                        text='Настройки'
                        icon={<SettingOutlined />}
                        onClick={handleLogout}
                        border='none'/>
                </Flex>
            </Flex>
        </Sider>
    );
}

export default MyMenu;
