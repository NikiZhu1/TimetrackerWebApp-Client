﻿import React, { useEffect, useState } from 'react';
import { Button, message, Layout, Collapse, ConfigProvider, Flex, Card, Dropdown } from 'antd';
import Icon, { EditOutlined, EllipsisOutlined, CaretRightOutlined, TeamOutlined, ClockCircleOutlined, MenuOutlined, SettingOutlined } from '@ant-design/icons';
import '@ant-design/v5-patch-for-react-19';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';

//Стили
import './Collapse.css';

//Методы
import { GetJWT, GetUserIdFromJWT } from './methods/UsersMethods.jsx';
import { getActivities, getActivityPeriods, renderActivityCards, initActivitiesState } from './methods/ActivitiesMethods';

//Компоненты
import MyMenu from './components/Menu.jsx';
import ActivityCard from './components/ActivityCard.jsx';

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
    const navigate = useNavigate();

    //Хранение и установка активностей
    const [activities, setActivities] = useState([]);

    //Сразу при открытии страницы
    useEffect(() => {
        initActivitiesState(setActivities, () => activities);

        const token = GetJWT(); // Получаем токен из cookies
        if (!token) {
            message.warning('Сначала войдите в систему');
            navigate('/');
        }
        const userId = GetUserIdFromJWT(token)
        if (!userId) {
            message.warning('Сначала войдите в систему');
            navigate('/');
        }
        else {
            console.log("Используемый userId:", userId);
            getActivities(token, userId);
        }
            
    }, []);

    const items = [
        {
            key: '1',
            label: 'Текущие активности',
            children:
                <Flex wrap gap='16px'>
                    {renderActivityCards(2)}
                </Flex>,
        },
        {
            key: '2',
            label: 'Активности',
            children:
                <Flex wrap gap='16px'>
                    {renderActivityCards(1)}
                </Flex>,
        },
        {
            key: '3',
            label: 'Архив',
            children:
                <Flex wrap gap='16px'>
                    {renderActivityCards(3)}
                </Flex>,
        },
    ];

    return (
        <div>
            <Layout>
                <MyMenu/>
                <Layout>
                    <Header style={HeaderStyle}>Headerrr</Header>
                    <Content style={{ padding: '24px', paddingTop: '0px' }} >
                        <ConfigProvider
                            theme={{
                                components: {
                                    Collapse: {
                                        contentPadding: '0px',
                                        headerPadding: '16px 0 16px 0'
                                    },
                                },
                            }}>
                            <Collapse
                                defaultActiveKey={['2']} //Открытая вкладка по умолчанию
                                ghost items={items}>
                            </Collapse>
                        </ConfigProvider>
                        
                    </Content>
                    <Footer>Footer</Footer>
                </Layout>
            </Layout>
        </div>
    );
}

export default Dashboard;
