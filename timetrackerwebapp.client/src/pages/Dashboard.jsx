import React, { useEffect, useState } from 'react';
import { Button, message, Layout, Flex, Breadcrumb } from 'antd';
import Icon, { HomeOutlined } from '@ant-design/icons';
import '@ant-design/v5-patch-for-react-19';
import { useNavigate, useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
// import { useDeviceDetect } from '../hooks/useDeviceDetect';

//Методы
import { GetJWT, GetUserIdFromJWT, getUserInfo } from '../API methods/UsersMethods.jsx';
import { getProjectDetails } from '../API methods/ProjectsMethods.jsx';
import { useUsers } from '../hooks/useUsers.jsx';
import { useIsPortrait } from '../hooks/useIsPortain.jsx';

//Компоненты
import MyMenu from '../components/Menu.jsx';
import ActivitiesTab from './Dashboard content/ActivitiesTab.jsx';
import ProjectsTab from './Dashboard content/ProjectsTab.jsx';
import ProjectDetailsTab from './Dashboard content/ProjectDetailsTab.jsx';
import UserInfo from '../components/UserInfo.jsx';
import StatsTab from './Dashboard content/StatsTab.jsx';
import HistoryTab from './Dashboard content/HistoryTab.jsx';
import MyMenuMobile from '../components/Menu mobile.jsx';

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

// Функция для преобразования ключа вкладки в читаемое название
const getTabName = (tabKey) => {
    switch (tabKey) {
        case 'activities': return 'Ваши активности';
        case 'statistics': return 'Статистика';
        case 'history': return 'История';
        case 'projects': return 'Проекты';
        default: return 'Активности';
    }
};

function Dashboard() {
    const navigate = useNavigate();
    const isPortrait = useIsPortrait();
    const { activeTab = 'activities', projectId } = useParams(); // Получаем активную вкладку из URL
    const { user, loadData } = useUsers();

    // Состояние для активной вкладки
    const [activeMenuTab, setActiveMenuTab] = useState(activeTab); 
    const [projectName, setProjectName] = useState('');

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
        
        if (projectId) {
            console.log("project select", projectId);
        }

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

                if (projectId) {
                    const project = await getProjectDetails(token, projectId);
                    setProjectName(project.projectName);
                }
            } catch (error) {
                console.error('Ошибка загрузки данных:', error);
                message.error('Не удалось загрузить данные');
            }
        };

        fetchAll();

    }, [projectId]);

    // Рендер контента в зависимости от вкладки
    const renderContent = () => {
        if (projectId)
            return (<ProjectDetailsTab/>); // Детали проекта

        switch (activeTab) {
            case 'activities':  return (<ActivitiesTab />);
            case 'statistics':  return <StatsTab/>;
            case 'history':  return <HistoryTab/>;
            case 'projects':  return (<ProjectsTab />);
            default: return (<ActivitiesTab />);
        }
    };

    // Формируем breadcrumbs
    const breadcrumbsItems = [
        {
            title: <HomeOutlined/>
        },
        {
            title: <a onClick={() => navigate(`/dashboard/${projectId ? 'projects' : activeTab}`)} style={{ cursor: 'pointer' }}>
                { projectId ? getTabName('projects') : getTabName(activeTab)}
            </a>
        }
    ];
    // Если открыт проект, добавляем его в breadcrumbs
    if (projectId && !isPortrait) {
        breadcrumbsItems.push({
            title: projectName || `Проект ${projectId}`
        });
    }

    return (
        <div>
            <Layout>
                {!isPortrait && (<MyMenu onMenuClick={handleMenuClick} />)}
                <Layout>
                    <Header style={HeaderStyle}>
                        <Flex justify='space-between' align='center' style={{width: '100%'}}>
                            <Breadcrumb items={breadcrumbsItems}/>
                            <UserInfo userId={user.id} userName={user.name}/>
                        </Flex>
                    </Header>
                    <Content style={{ 
                        padding: isPortrait ? '0px 16px 0px 16px' : '0px 24px 0px 24px', 
                        height: '100vh',
                        boxSizing: 'border-box',
                        overflowY: 'auto'}} >
                        {renderContent()}
                    </Content>
                    {isPortrait && (<MyMenuMobile onMenuClick={handleMenuClick}/>)}
                </Layout>
            </Layout>
        </div>
    );
}

export default Dashboard;
