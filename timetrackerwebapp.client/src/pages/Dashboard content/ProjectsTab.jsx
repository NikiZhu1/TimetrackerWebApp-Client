import React, { useEffect, useState } from 'react';
import { Button, message, Collapse, ConfigProvider, Flex, Skeleton } from 'antd';
import { PlusOutlined, LinkOutlined } from '@ant-design/icons';
import '@ant-design/v5-patch-for-react-19';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { subscribe } from '../../event.jsx';

//Стили
import './Collapse.css';

//Методы
import { GetJWT, GetUserIdFromJWT } from '../../API methods/UsersMethods.jsx';
import { useProjects } from '../../useProjects.jsx';

//Компоненты
import Empty from '../../components/Empty.jsx';
import ProjectCard from '../../components/ProjectCard.jsx';
import { showAddNewProject } from '../../components/AddNewProjectModal.jsx';
import { showJoinToProject } from '../../components/JoinToProjectModal.jsx';

function ProjectsTab() {
    const { projects, loading, loadUserProjectsData } = useProjects();
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
            try {
                await loadUserProjectsData(token, userId);
            } catch (error) {
                console.error('Ошибка загрузки данных:', error);
                message.error('Не удалось загрузить данные');
            }
        };

        fetchAll(); 
        subscribe('projectChanged', fetchAll); // Подписка

    }, []);

    // Рендер карточек по статусу
    const renderProjectsCards = (isCreator, isArchived) => {

        if (loading) return <Skeleton active />;

        const token = GetJWT();
        if (!token) {
            message.warning('Сначала войдите в систему');
            navigate('/');
            return;
        }

        let filterRule;
    
        if (isCreator === true && isArchived === false) {
            // Для создателя: показываем все его проекты
            filterRule = project => project.isCreator === true && project.finishDate === null;
        } else if (isCreator === false && isArchived == false) {
            // Для не-создателя: показываем только завершенные проекты
            filterRule = project => project.isCreator === false && project.finishDate === null;
        } else {
            // По умолчанию: показываем все активные проекты
            filterRule = project => project.finishDate !== null;
        }
            
        return projects
            .filter(filterRule)
            .map(project => (
                <ProjectCard
                    key={`project${project.projectId}`}
                    token={token}
                    projectId={project.projectId}
                    title={project.projectName}
                    projectKey={project.projectKey}
                    dateCreate={project.creationDate}
                    dateFinish={project.finishDate}
                    isUserProjet={project.isCreator}
                    members={project.members}
                    acts={project.activities}
                />
            ));
    };

    const items = [
        {
            key: 'collapseMyProjects',
            label: 
                <Flex gap='12px'>
                    Мои проекты
                    {1 !== 0 && (<Button
                        color="default"
                        variant="outlined"
                        icon={<PlusOutlined />}
                        onClick={(e) => {
                            e.stopPropagation();
                            showAddNewProject();
                        }}
                        style={{background: 'transparent'}}>
                        Создать
                    </Button>)}
                </Flex>,
            children:
                <Flex wrap gap='16px' style={{
                    alignSelf: 'stretch'}}>
                    {renderProjectsCards(true, false)}
                </Flex>,
        },
        {
            key: 'collapsePartisipatingProjects',
            label:
                <Flex gap='12px'>
                    Совместные проекты
                    {1 !== 0 && (<Button
                        color="default"
                        variant="dashed"
                        icon={<LinkOutlined />}
                        onClick={(e) => {
                            e.stopPropagation();
                            showJoinToProject();
                        }}
                        style={{background: 'transparent'}}>
                        Присоединиться
                    </Button>)}
                </Flex>,
            children:
            <div>
                {1 === 0 ? (
                    <Empty hasActivities={activities && activities.length > 0} />)
                        : (
                    <Flex wrap gap='16px'>
                        {renderProjectsCards(false, false)}
                    </Flex>
                )}
            </div>,
        },
        {
            key: 'collapse3',
            label: 'Завершённые',
            children:
                <Flex wrap gap='16px'>
                    {renderProjectsCards(null, true)}
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
                <Collapse
                    defaultActiveKey={['collapseMyProjects', 'collapsePartisipatingProjects']} //Открытая вкладка по умолчанию
                    ghost items={items}
                    collapsible='icon'>
                </Collapse>
            </ConfigProvider>
        </>
    );
}

export default ProjectsTab;
