import React, { useEffect, useState } from 'react';
import { Button, message, Collapse, ConfigProvider, Flex, Skeleton, Typography } from 'antd';
import Icon, { PlusOutlined, LinkOutlined } from '@ant-design/icons';
import '@ant-design/v5-patch-for-react-19';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { subscribe } from '../event.jsx';

const { Title, Text } = Typography;

//Стили
import '../Collapse.css';

//Методы
import { GetJWT, GetUserIdFromJWT } from '../methods/UsersMethods.jsx';
import { useActivities } from '../useActivities.jsx';

//Компоненты
import Empty from '../components/Empty.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import { showAddNewActivity } from '../components/AddNewActivityModal.jsx';

function ProjectsTab() {
    const { activities, periods, loading, loadData, actCard_Click, getActivityStartTime, countStatus1 } = useActivities();

    const navigate = useNavigate();

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

    // Рендер карточек по статусу
    const renderProjectsCards = (statusId) => {

        if (loading && !activities) return <Skeleton active />;

        const token = GetJWT();
        if (!token) {
            message.warning('Сначала войдите в систему');
            navigate('/');
            return;
        }

        return activities
            .filter(activity => activity.statusId === statusId)
            .map(activity => (
                <ActivityCard
                    key={`activity${activity.id}`}
                    token={token}
                    activityId={activity.id}
                    title={activity.name}
                    //dayStats={formatActivityTime(activity.activeFrom)}
                    color='rgb(204, 194, 255)'
                    startTime={getActivityStartTime(activity.id)}
                    status={activity.statusId}
                    cardOnClick={() => actCard_Click(activity.id)}
                />
            ));
    };

    const items = [
        {
            key: 'collapse1',
            label: 
                <Flex gap='12px'>
                    Мои проекты
                    {countStatus1 !== 0 && (<Button
                        color="default"
                        variant="text"
                        icon={<PlusOutlined />}
                        onClick={(e) => {
                            e.stopPropagation();
                            showAddNewActivity();
                        }}>
                        Создать
                    </Button>)}
                </Flex>,
            children:
                <Flex wrap gap='16px'>
                    <ProjectCard title='Курсовой проект'/>
                    {/*{activities && renderActivityCards(2)}*/}
                </Flex>,
        },
        {
            key: 'collapse2',
            label:
                <Flex gap='12px'>
                    Активности
                    {countStatus1 !== 0 && (<Button
                        color="default"
                        variant="text"
                        icon={<LinkOutlined />}
                        onClick={(e) => {
                            e.stopPropagation();
                            showAddNewActivity();
                        }}>
                        Присоединиться
                    </Button>)}
                </Flex>,
            children:
            <div>
                {countStatus1 === 0 ? (
                    <Empty hasActivities={activities && activities.length > 0} />)
                        : (
                    <Flex wrap gap='16px'>
                        {/*{renderActivityCards(1)}*/}
                    </Flex>
                )}
            </div>,
        },
        {
            key: 'collapse3',
            label: 'Архив',
            children:
                <Flex wrap gap='16px'>
                    {/*{activities && renderActivityCards(3)}*/}
                </Flex>,
        },
    ];

    return (
        <>
            <ConfigProvider
                theme={{
                    components: {
                        Collapse: {
                            contentPadding: '0px',
                            headerPadding: '16px 0 16px 0'
                        },
                    },
                }}>
                <Title level={3}>h3. Ant Design</Title>
                <Collapse
                    defaultActiveKey={['collapseActLive', 'collapseActArchive']} //Открытая вкладка по умолчанию
                    ghost items={items}>
                </Collapse>
            </ConfigProvider>
        </>
    );
}

export default ProjectsTab;
