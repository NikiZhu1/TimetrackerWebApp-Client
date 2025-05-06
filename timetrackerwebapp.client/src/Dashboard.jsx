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

const { Header, Footer, Content } = Layout;

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
    const { user, loadData } = useUsers();

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
            try {
                await loadData(token, userId);
            } catch (error) {
                console.error('Ошибка загрузки данных:', error);
                message.error('Не удалось загрузить данные');
            }
        };

        fetchAll();

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
