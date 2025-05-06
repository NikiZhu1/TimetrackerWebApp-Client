import React, { useEffect, useState } from 'react';
import { Button, message, Collapse, ConfigProvider, Flex, Skeleton, Typography } from 'antd';
import Icon, { PlusOutlined } from '@ant-design/icons';
import '@ant-design/v5-patch-for-react-19';
import { useNavigate, useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import { subscribe } from '../event.jsx';

const { Title } = Typography;

//Стили
import '../Collapse.css';

//Методы
import { GetJWT, GetUserIdFromJWT } from '../methods/UsersMethods.jsx';
import { useActivities } from '../useActivities.jsx';
import { useProjects } from '../useProjects.jsx';

//Компоненты
import Empty from '../components/Empty.jsx';
import ActivityCard from '../components/ActivityCard.jsx';
import { showAddNewActivity } from '../components/AddNewActivityModal.jsx';

function ProjectDetailsTab() {
    const { periods, actCard_Click, getActivityStartTime } = useActivities();
    const { singleProject, loading, loadData, getSingleProjectInfo, checkUserInProject } = useProjects();
    const navigate = useNavigate();
    const { projectId } = useParams();

    const [access, setAccess] = useState({ isMember: false, isCreator: false });

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

        const fetchProject = async () => {

            try {
                // 1. Проверяем доступ
                const accessInfo = await checkUserInProject(token, userId, projectId);
                setAccess(accessInfo);

                console.log("Права:", accessInfo);
                if (!accessInfo.isMember) {
                    throw new Error('У вас нет доступа к этому проекту');
                }
            }
            catch (error) {
                message.error(error.message);
                navigate('/dashboard/projects', { state: { activeTab: 'projects' } });
                return;
            }

            console.log("Событие");
            try {
                await getSingleProjectInfo(token, projectId);
            } catch (error) {
                console.error('Ошибка загрузки данных:', error);
                message.error('Не удалось загрузить данные');
            }
        };

        fetchProject();
        // subscribe('activityChanged', fetchAll); // Подписка

    }, []);

    // Рендер карточек по статусу
    const renderActivityCards = (statusId) => {

        if (loading && !singleProject) return <Skeleton active />;

        const token = GetJWT();
        if (!token) {
            message.warning('Сначала войдите в систему');
            navigate('/');
            return;
        }

        // Проверяем наличие singleProject и его свойств
        if (!singleProject || !singleProject.activities) {
            return null; // или <Empty description="Нет данных об активностях" />
        }


        return singleProject.activities
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
                    {renderActivityCards(2)}
                </Flex>,
        },
        {
            key: 'collapseAct',
            label:
                <Flex gap='12px'>
                    Активности
                    {(<Button
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
                {1 === 0 ? (
                    <Empty />)
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
                    {renderActivityCards(3)}
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

export default ProjectDetailsTab;
