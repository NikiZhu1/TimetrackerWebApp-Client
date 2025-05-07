import React, { useEffect, useState } from 'react';
import { Button, message, Collapse, ConfigProvider, Flex, Skeleton } from 'antd';
import Icon, { PlusOutlined } from '@ant-design/icons';
import '@ant-design/v5-patch-for-react-19';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { subscribe } from '../event.jsx';

//Стили
import '../Collapse.css';

//Методы
import { GetJWT, GetUserIdFromJWT } from '../methods/UsersMethods.jsx';
import { useActivities } from '../useActivities.jsx';

//Компоненты
import Empty from '../components/Empty.jsx';
import ActivityCard from '../components/ActivityCard.jsx';
import { showAddNewActivity } from '../components/AddNewActivityModal.jsx';

function ActivitiesTab() {
    const { activities, loading, loadData, actCard_Click, getActivityStartTime, countStatus1 } = useActivities();
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
    const renderActivityCards = (statusId) => {

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
            key: 'collapseActLive',
            label: 'Текущие активности',
            children:
                <Flex wrap gap='16px'>
                    {activities && renderActivityCards(2)}
                </Flex>,
        },
        {
            key: 'collapseAct',
            label:
                <Flex gap='12px'>
                    Активности
                    {countStatus1 !== 0 && (<Button
                        color="default"
                        variant="outlined"
                        icon={<PlusOutlined />}
                        onClick={(e) => {
                            e.stopPropagation();
                            showAddNewActivity();
                        }}
                        style={{background: 'transparent'}}>
                        Создать
                    </Button>)}
                </Flex>,
            children:
            <div>
                {countStatus1 === 0 ? (
                    <Empty 
                        hasActivities={activities && activities.length > 0}
                        textZeroActivities='Здесь пока пусто. Создайте свою первую активность и начните отслеживать продуктивность!'
                        textWhenAllActivityIsBusy='Похоже, вы уже отслеживаете все доступные активности или переместили их в архив'
                        onClickAction={() => showAddNewActivity()} />)
                        : (
                    <Flex wrap gap='16px'>
                        {renderActivityCards(1)}
                    </Flex>
                )}
            </div>,
        },
        {
            key: 'collapseActArchive',
            label: 'Архив',
            children:
                <Flex wrap gap='16px'>
                    {activities && renderActivityCards(3)}
                </Flex>,
        },
    ];

    return (
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
                defaultActiveKey={['collapseActLive', 'collapseAct']} //Открытая вкладка по умолчанию
                ghost items={items}
                collapsible='icon'>
            </Collapse>
        </ConfigProvider>
    );
}

export default ActivitiesTab;
