import React, { useEffect, useState } from 'react';
import { Button, message, Collapse, ConfigProvider, Flex, Skeleton, Typography, Modal, Divider } from 'antd';
import Icon, { AppstoreAddOutlined, AppstoreOutlined, CalendarOutlined, CarryOutOutlined, DeleteOutlined, EditOutlined, ExclamationCircleFilled, FolderOutlined, LinkOutlined, PlusOutlined, TeamOutlined, UserDeleteOutlined } from '@ant-design/icons';
import '@ant-design/v5-patch-for-react-19';
import { format, parse } from 'date-fns';
import { useNavigate, useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import { emit, subscribe } from '../../event.jsx';

const { confirm } = Modal;
const { Title, Paragraph, Text } = Typography;

//Стили
import './Collapse.css';

//Методы
import { GetJWT, GetUserIdFromJWT } from '../../API methods/UsersMethods.jsx';
import { useActivities } from '../../hooks/useActivities.jsx';
import { useProjects } from '../../hooks/useProjects.jsx';
import { useIsPortrait } from '../../hooks/useIsPortain.jsx';

//Компоненты
import Empty from '../../components/Empty.jsx';
import ActivityCard from '../../components/ActivityCard.jsx';
import { showAddNewActivity } from '../../components/AddNewActivityModal.jsx';
import ProjectActionButton from '../../components/ProjectActionButton.jsx';
import { MembersModal } from '../../components/MembersModal.jsx';
import { showAddNewProject } from '../../components/AddNewProjectModal.jsx';

function ProjectDetailsTab() {
    const { periods, actCard_Click, getActivityStartTime, loadPeriodsActivities } = useActivities();
    const { singleProject, loading, getSingleProjectInfo, checkUserInProject, updateProjectName, deleteUserFromProject, deleteProject, archiveProject } = useProjects();
    const isPortrait = useIsPortrait();
    const navigate = useNavigate();
    const { projectId } = useParams();

    const [access, setAccess] = useState({ isMember: false, isCreator: false });
    const [editProjectName, setProjectName] = useState('');
    const [tempProjectName, setTempProjectName] = useState('');
    const [projectIsClose, setProjectIsClose] = useState(false);

    const [isMemberModalOpen, setMemberModalOpen] = useState(false);
    const [members, setMembers] = useState([]);

    //Первая загрузка
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
            
            try {
                // 2. Загружаем информацию по проекту
                const projectData = await getSingleProjectInfo(token, projectId);
                setProjectName(projectData.projectName);
                setTempProjectName(projectData.projectName);
                setMembers(projectData.members);
                if (projectData.finishDate) {
                    setProjectIsClose(true);
                }
                await loadPeriodsActivities(token, projectData.activities);
            } catch (error) {
                console.error('Ошибка загрузки данных:', error);
                message.error('Не удалось загрузить данные');
            }
        };

        fetchProject();
        subscribe('projectChanged', fetchProject); // Подписка
        subscribe('activityChanged', fetchProject); // Подписка

    }, []);

    //Эффект при измении названия
    useEffect(() => {
        const newProjectName = async () => {
            try {
                const token = GetJWT();
                const userId = GetUserIdFromJWT(token);

                if (!token || !userId) {
                    if (!token) message.warning('Сначала войдите в систему');
                    if (!userId) Cookies.remove('token');
                    navigate('/');
                    return;
                }
                
                if (access.isCreator)
                    await updateProjectName(token, projectId, tempProjectName);
                setProjectName(tempProjectName); // Обновляем основное состояние после успешного сохранения
              } catch (error) {
                message.error('Не удалось обновить название');
                console.error(error);
                setTempProjectName(editProjectName); // Восстанавливаем предыдущее значение при ошибке
              }

        }

        newProjectName();
    }, [tempProjectName])

    // Рендер карточек по статусу
    const renderActivityCards = (statusId) => {

        if (loading) return <Skeleton active />;

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
                    isCreator={access.isCreator}
                    projectId={activity.projectId}
                    onProjectPage={true}
                    //dayStats={formatActivityTime(activity.activeFrom)}
                    color='rgb(204, 194, 255)'
                    startTime={getActivityStartTime(activity.id)}
                    status={activity.statusId}
                    cardOnClick={() => actCard_Click(activity.id)}
                />
            ));
    };

    const collapseItems = [
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
            label: 'Активности',
            children:
            <div>
                {singleProject.activities && singleProject.activities.filter(activity => activity.statusId === 1).length === 0 ? (
                    <Empty 
                        hasActivities={singleProject.activities.length > 0}
                        textZeroActivities='Здесь пока пусто. Создайте первую активность в проекте и начните отслеживать продуктивность вместе!'
                        textWhenAllActivityIsBusy='Похоже, все доступные активности уже отслеживаются или перенесены в архив'
                        showButton={access.isCreator && !projectIsClose}
                        onClickAction={() => showAddNewActivity(true, projectId, singleProject.projectName)} />)
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

    //Нажатие кнопки управления
    const handleActionClick = async (key) => {

        const token = GetJWT();
        const userId = GetUserIdFromJWT(token);

        if (!token || !userId) {
            if (!token) message.warning('Сначала войдите в систему');
            if (!userId) Cookies.remove('token');
            navigate('/');
            return;
        }

        switch (key) {
            case 'members':
                setMemberModalOpen(true);
                break;
            case 'addActivity':
                showAddNewActivity(true, projectId, singleProject.projectName);
                break;
            case 'getKey':
                const projectKey = singleProject.projectKey;
                Modal.info({
                    title: `Ключ доступа ${editProjectName}`,
                    content: (
                        <div style={{ marginTop: 10 }}>
                            <Text 
                            style={{fontSize: '24px'}}
                            copyable={{
                                tooltips: ['Копировать', 'Скопировано!'],
                            }}>
                                {projectKey}
                            </Text>
                            <p style={{ marginTop: 10, color: '#B4B4B4' }}>
                                Скопируйте этот ключ и поделитесь им, чтобы добавить участников в проект.
                            </p>
                        </div>
                    ),
                    centered: true,
                    okText: 'Закрыть',
                    maskClosable: true,
                });
                break;
            case 'toArchive':
                showArchiveConfirm(() => archiveProject(token, projectId));
                break;
            case 'leave':
                await deleteUserFromProject(token, projectId, userId);
                message.success(`Вы покинули проект ${editProjectName}`);
                navigate('/dashboard/projects', { state: { activeTab: 'projects' } });
                break;
            case 'delete':
                showDeleteConfirm(() => deleteProject(token, projectId));
                break;
            default:
                message.info(`Выбран пункт: ${key}`);
        }
    };

    //Модальное окно удаления
    const showDeleteConfirm = (onOkClick) => {
        confirm({
            title: `Удалить "${editProjectName}" без возможности восстановления?`,
            icon: <ExclamationCircleFilled />,
            content: 'Вы удаляете лишь проект. Все активности, которые были в проекте останутся у их создателей, периоды отслеживания также сохранятся.',
            okText: 'Удалить',
            okType: 'danger',
            cancelText: 'Отмена',
            closable: true,
            centered: isPortrait,
            maskClosable: true,
            async onOk() {
                try {
                    await onOkClick();
                    message.success(`${editProjectName} удалён`);
                    navigate('/dashboard/projects', { state: { activeTab: 'projects' } });
                } catch (error) {
                    console.error('Ошибка при удалении:', error);
                    Modal.destroyAll();
                    message.error(`Не получилось удалить проект`);
                }
            },
            onCancel() {},
        });
    };

    //Модальное окно завершения
    const showArchiveConfirm = (onOkClick) => {
        confirm({
            title: `Завершить "${editProjectName}" навсегда?`,
            icon: <ExclamationCircleFilled />,
            content: 'При завершении проекта все активности, которые были в проекте, останутся у их создателей и перенесутся в архив.',
            okText: 'Завершить',
            okType: 'danger',
            cancelText: 'Отмена',
            closable: true,
            centered: isPortrait,
            maskClosable: true,
            async onOk() {
                try {
                    await onOkClick();
                    message.success(`${editProjectName} завершён`);
                    emit('projectChanged');
                } catch (error) {
                    console.error('Ошибка при завершении:', error);
                    Modal.destroyAll();
                    message.error(`Не получилось завершить проект`);
                }
            },
            onCancel() {},
        });
    };

    return (
        <div style={{paddingTop: '12px'}}>

        <Flex vertical gap='12px'>
            {/* {loading ? <Skeleton.Input active /> : } */}
            {access.isCreator ? 
            <Title
                level={2}
                style={{margin: '0px'}}
                editable={{
                    onChange: (val) => {
                        setTempProjectName(val);
                    },
                    tooltip: 'Изменить название',
                    maxLength: 80
                }}>
                {editProjectName}
            </Title> : 

            <Title level={2} style={{margin: '0px'}}>
                {editProjectName}
            </Title>}
            
            {/* //Кнопки управления проектом */}
            <Flex gap='12px' className='projectActions' wrap>
                <ProjectActionButton
                    icon={<TeamOutlined/>}
                    text={access.isCreator ? 'Управление участниками' : 'Посмотреть участников'}
                    showMembers
                    members={singleProject?.members?.length > 0 && singleProject.members}
                    maxMembersToShow={4}
                    onClick={() => handleActionClick('members')}
                />

                {singleProject && singleProject?.members && (<MembersModal
                    isOpen={isMemberModalOpen}
                    onClose={() => setMemberModalOpen(false)}
                    isAdmin={access.isCreator}
                    members={singleProject.members}
                    projectId={projectId}
                />)}

                {!projectIsClose && access.isCreator && (<ProjectActionButton
                    icon={<AppstoreAddOutlined/>}
                    text='Создать активность'
                    onClick={() => handleActionClick('addActivity')}
                />)}

                {!projectIsClose && (<ProjectActionButton
                    icon={<LinkOutlined/>}
                    text='Код приглашения'
                    onClick={() => handleActionClick('getKey')}
                />)}

                {!projectIsClose && access.isCreator && (<ProjectActionButton
                    danger
                    icon={<FolderOutlined/>}
                    text='Завершить проект'
                    onClick={() => handleActionClick('toArchive')}
                />)}

                {projectIsClose && access.isCreator && (<ProjectActionButton
                    danger
                    icon={<DeleteOutlined/>}
                    text='Удалить проект'
                    onClick={() => handleActionClick('delete')}
                />)}

                {!access.isCreator && access.isMember && (<ProjectActionButton
                    danger
                    icon={<UserDeleteOutlined/>}
                    text='Покинуть проект'
                    onClick={() => handleActionClick('leave')}
                />)}

            </Flex>

            {singleProject.creationDate && (<Flex align='flex-start' gap='10px'>
                <CalendarOutlined style ={{fontSize: '18px', paddingTop: '2px'}}/>
                <Text>Старт: {format(parse(singleProject.creationDate, 'yyyy-MM-dd HH:mm:ss', new Date()), 'dd.MM.yyyy')}</Text>
            </Flex>)}

            {singleProject.finishDate && (<Flex align='flex-start' gap='10px'>
                <CarryOutOutlined style ={{fontSize: '18px', paddingTop: '2px'}}/>
                <Text>Финиш: {format(parse(singleProject.finishDate, 'yyyy-MM-dd HH:mm:ss', new Date()), 'dd.MM.yyyy')}</Text>
            </Flex>)}

        </Flex>
        <Divider style={{marginTop: '24px', marginBottom: '8px'}}/>
        {projectIsClose && (<Empty 
            hasActivities={singleProject.activities.length > 0}
            textZeroActivities='Этот проект на данный момент закрыт. Активностей в проекте нет.'
            textWhenAllActivityIsBusy='Этот проект завершён. Все активности перенесены в архив.'
            showButton={false} />)}

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
                defaultActiveKey={['collapseActLive', 'collapseAct', 'collapseActArchive']} //Открытая вкладка по умолчанию
                ghost items={collapseItems.filter(item => 
                    !(item.key === 'collapseActLive' && 
                        singleProject.activities && singleProject.activities.filter(activity => activity.statusId === 2).length === 0) &&
                    !(item.key === 'collapseAct' && 
                        projectIsClose) && 
                    !(item.key === 'collapseActArchive' && 
                        singleProject.activities && singleProject.activities.filter(activity => activity.statusId === 3).length === 0))}
                collapsible='icon'>
            </Collapse>
        </ConfigProvider>
        </div>
    );
}

export default ProjectDetailsTab;
