import React, { useEffect, useState } from 'react';
import { Button, message, Layout, Flex } from 'antd';
import Icon from '@ant-design/icons';
import '@ant-design/v5-patch-for-react-19';
import { useNavigate, useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import { subscribe } from './event.jsx';

//Стили
import './Collapse.css';

//Методы
import { GetJWT, GetUserIdFromJWT, getUserInfo } from './methods/UsersMethods.jsx';
import { useUsers } from './useUsers.jsx';

//Компоненты
import MyMenu from './components/Menu.jsx';
import ActivitiesTab from './pages/ActivitiesTab.jsx';
import ProjectsTab from './pages/ProjectsTab.jsx';
import ProjectDetailsTab from './pages/ProjectDetailsTab.jsx';
import UserInfo from './components/UserInfo.jsx';

const { Header, Footer, Sider, Content } = Layout;

//Тест своих иконок
const HistorySvg = () => (
    <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 14.5H3.33333C2.97971 14.5 2.64057 14.3595 2.39052 14.1095C2.14048 13.8594 2 13.5203 2 13.1667V3.83333C2 3.47971 2.14048 3.14057 2.39052 2.89052C2.64057 2.64048 2.97971 2.5 3.33333 2.5H6M10.6667 11.8333L14 8.5M14 8.5L10.6667 5.16667M14 8.5H6" stroke="#E31E1E" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
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
    const { activeTab = 'activities', projectId } = useParams(); // Получаем активную вкладку из URL
    const { user, loadData, UserAvatar } = useUsers();

    // Состояние для активной вкладки
    const [activeMenuTab, setActiveMenuTab] = useState(activeTab); 

    // Обработчик изменения вкладки
    const handleMenuClick = (key) => {
        setActiveMenuTab(key);
        navigate(`/dashboard/${key}`);
    };

    // Проверяем валидность activeTab
    useEffect(() => {
        const validTabs = ['activities', 'statistics', 'history', 'projects'];
        if (activeTab && !validTabs.includes(activeTab)) {
            navigate('/dashboard/activities', { replace: true });
        }
    }, [activeMenuTab, navigate]);

    //Выполняем сразу при открытии
    useEffect(() => {

        const token = GetJWT();
        const userId = GetUserIdFromJWT(token);
        
        if (projectId !== undefined)
            console.log("project select", projectId);

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
        if (projectId !== undefined)
            return (<ProjectDetailsTab/>); // Детали проекта

        switch (activeTab) {
            case 'activities': // Активности
                return (<ActivitiesTab />);

            case 'statistics': // Статистика
                return <div>Контент статистики</div>;

            case 'history': // История
                return <div>Контент истории</div>;

            case 'projects': // Проекты
                return (<ProjectsTab />);

            default:
                return (<ActivitiesTab />);
        }
    };

    return (
        <div>
            <Layout>
                <MyMenu onMenuClick={handleMenuClick} />
                <Layout>
                    <Header style={HeaderStyle}>
                        <Flex justify='space-between' align='center' style={{width: '100%'}}>
                            <p>adadada</p>
                            <UserInfo userId={user.id} userName={user.name}/>
                        </Flex>
                    </Header>
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
