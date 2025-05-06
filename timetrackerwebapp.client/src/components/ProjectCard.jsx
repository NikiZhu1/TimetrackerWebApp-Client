import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parse } from 'date-fns';
import { Button, message, Dropdown, Flex, Card, Modal, Typography, Tag, Avatar, Tooltip } from 'antd';
import Icon, { EditOutlined, EllipsisOutlined, LinkOutlined, CalendarOutlined, CarryOutOutlined, CheckCircleFilled, ExclamationCircleFilled, UserDeleteOutlined, PieChartOutlined, ClockCircleOutlined, FolderOutlined, FolderOpenOutlined, TeamOutlined, DeleteOutlined, PauseCircleFilled, FrownOutlined } from '@ant-design/icons';
import '@ant-design/v5-patch-for-react-19';

const { confirm } = Modal;
const { Text } = Typography;

//Стили
import '../App.css';

//Компоненты
import ActivityTimer from './ActivityTimer.jsx';

//Методы
import { useProjects } from '../useProjects.jsx';
import { useActivities } from '../useActivities.jsx'
// import { UserAvatar } from '../methods/UsersMethods.jsx';

function ProjectCard({
    token,
    projectId,
    title,
    ascessKey,
    isUserProjet,
    dateCreate,
    dateFinish,
    members,
    acts
}) {

    const { deleteProject, archiveProject } = useProjects();
    const navigate = useNavigate();

    const cardOnClick = () => {
        navigate(`/dashboard/projects/${projectId}`);
    };

    // Определяем иконку и текст в зависимости от статуса
    const liveActs = acts.filter(act => act.statusId === 2);
    let status;

    if (dateFinish !== null)
        status = 3 // Архив
    else if (acts.length === 0) {
        status = 0; // Нет активностей в проекте
    } else if (liveActs.length === 0) {
        status = 1; // Есть активности, но нет отслеживаемых
    } else {
        status = 2; // Активности в процессе
    }
    
    const activityInfoConfig = {
        3: { icon: FolderOutlined, color: '#282828', text: 'Проект в архиве,\n отслеживание активностей невозможно'},
        2: { icon: CheckCircleFilled, color: '#4DCF5C', text: 'Активности в процессе:' },
        1: { icon: PauseCircleFilled, color: '#F6DD4E', text: 'Нет отслеживаемых активностей,\n откройте проект для управления' },
        0: { icon: FrownOutlined, color: '#282828', text: 'В проекте нет активностей,\n откройте проект для добавления' }
    };
    const currentConfig = activityInfoConfig[status];
    const StatusIcon = currentConfig.icon;

    //Конвертируем даты в нормальный вид
    dateCreate = format(parse(dateCreate, 'yyyy-MM-dd HH:mm:ss', new Date()), 'dd.MM.yyyy');
    if (dateFinish !== null)
        dateFinish = format(parse(dateFinish, 'yyyy-MM-dd HH:mm:ss', new Date()), 'dd.MM.yyyy');

    //Нажатие пункта меню
    const handleMenuClick = async e => {
        e.domEvent.stopPropagation();
        console.log('Клик меню карточки', e);

        switch (e.key) {
            case 'edit':
                //
                break;
            case 'getStats':
                // 
                break;
            case 'checkHistory':
                //
                break;
            case 'toArchive':
                await archiveProject(token, projectId);
                message.success(`${title}: проект закрыт`)
                break;
            case 'delete':
                showDeleteConfirm(() => deleteProject(token, projectId));
                break;
            default:
                message.info(`Выбран пункт: ${e.key}`);
        }
    };

    const showDeleteConfirm = (onOkClick) => {
        confirm({
            title: `Удаление "${title}" без возможности восстановления`,
            icon: <ExclamationCircleFilled />,
            content: 'Вы удаляете лишь проект. Все активности, которые были в проекте останутся у их создателей, периоды отслеживания также сохранятся.',
            okText: 'Удалить',
            okType: 'danger',
            cancelText: 'Отмена',
            centered: true,
            closable: true,
            maskClosable: true,
            async onOk() {
                try {
                    await onOkClick();
                } catch (error) {
                    console.error('Ошибка при удалении:', error);
                    Modal.destroyAll();
                    message.error(`Не получилось удалить проект ${title}`);
                }
            },
            onCancel() {},
        });
    };

    //Элементы выпадающего меню
    const dropMenuItems = [
        {
            key: 'title',
            type: 'group',
            label: title
        },
        {
            key: 'edit',
            icon: <EditOutlined />,
            label: (
                <a >
                    Изменить
                </a>
            ),
        },
        {
            key: 'getKey',
            icon: <LinkOutlined />,
            label: (
                <a >
                    Получить код приглашения
                </a>
            ),
        },
        {
            key: 'unArchive',
            icon: <FolderOpenOutlined />,
            label: (
                <a >
                    Восстановить
                </a>
            ),
        },
        {
            type: 'divider',
        },
        {
            key: 'leave',
            icon: <UserDeleteOutlined />,
            danger: true,
            label: (
                <a >
                    Покинуть проект
                </a>
            ),
        },
        {
            key: 'toArchive',
            icon: <FolderOutlined />,
            danger: true,
            label: (
                <a >
                    Завершить проект
                </a>
            ),
        },
        {
            key: 'delete',
            icon: <DeleteOutlined />,
            danger: true,
            label: (
                <a >
                    Удалить
                </a>
            ),
        },
    ];

    return (
        <Card
            hoverable
            onClick={cardOnClick}
            style={{
                width: '430px',
                minWidth: '300px',
                maxWidth: '500px',
                flex: 'none',
                order: 2,
                flexGrow: 1,
            }}>
            <Card.Meta
                title={
                    <Flex justify='space-between'>
                        {title}
                        <Dropdown
                            menu={{
                                items: dropMenuItems.filter(item => 
                                    !(item.key === 'toArchive' && status === 3) && 
                                    !(item.key === 'edit' && status === 3) && 
                                    !(item.key === 'getKey' && status === 3) && 
                                    !(item.key === 'unArchive' && status !== 3) && 
                                    !(item.key === 'delete' && status !== 3) && 
                                    !(item.key === 'edit' && isUserProjet === false) && 
                                    !(item.key === 'toArchive' && isUserProjet === false) && 
                                    !(item.key === 'leave' && isUserProjet === true)),
                                onClick: handleMenuClick
                            }}
                            placement="bottomLeft"
                            trigger={["hover"]}>
                            <Button
                                color="default"
                                type="text"
                                onClick={(e) => {
                                    e.stopPropagation();
                                }}
                                icon={<EllipsisOutlined style={{
                                    fontSize: '16px',
                                    color: '#282828'
                                }} />}>
                            </Button>
                        </Dropdown>
                    </Flex>
                }
            />
            <Flex vertical gap='8px' style ={{paddingTop: '8px'}}>
                <Flex align='flex-start' gap='10px'>

                    <StatusIcon style ={{color: currentConfig.color, fontSize: '16px', paddingTop: '2px'}}/>

                    <Flex vertical gap='4px' style={{height: '48px'}}>
                        <Text style={{ whiteSpace: 'pre-line' }}>{currentConfig.text}</Text>
                        <Flex wrap gap='8px'>
                            {acts.filter(act => act.statusId === 2).slice(0, 3).map(act => (
                                <Tag key={`liveActTag${act.id}`} style={{margin: 0}} color='purple'>{act.name}</Tag>
                            ))}

                            {acts.length > 3 && (
                                <Text>+ ещё {liveActs.length - 3}</Text>
                            )}
                        </Flex>
                    </Flex>
                </Flex>

                <Flex align='flex-start' gap='10px'>
                
                    <TeamOutlined style ={{fontSize: '16px', paddingTop: '2px'}}/>
                    
                    <Flex vertical gap='4px'>
                        <Text>Участники: {members.length}</Text>
                        <Flex wrap gap='8px' align="center">
                            {members.slice(0, 3).map(member => (
                                <Tag key={`userTag${member.id}`} style={{margin: 0}}>@{member.name}</Tag>
                            ))}

                            {members.length > 3 && (
                                <Text>+ ещё {members.length - 3}</Text>
                            )}
                        </Flex>
                        {/* <Flex gap='4px'>
                            {members.map( member => (
                                <UserAvatar key={`userAvatar${member.id}`} name={`${member.name}`} id={member.id}/>
                            ))}
                        </Flex> */}
                    </Flex>
                </Flex>

                <Flex justify='space-between'>
                    <Flex align='flex-start' gap='10px'>
                        <CalendarOutlined style ={{fontSize: '16px', paddingTop: '2px'}}/>
                        
                        <Flex vertical gap='4px'>
                            <Text>Старт: {dateCreate}</Text>
                        </Flex>
                    </Flex>

                    {dateFinish && (
                        <Flex align='flex-start' gap='10px'>
                            <CarryOutOutlined style ={{fontSize: '16px', paddingTop: '2px'}}/>
                            
                            <Flex vertical gap='4px'>
                                <Text>Финиш: {dateFinish}</Text>
                            </Flex>
                        </Flex>
                    )}
                </Flex>
                
            </Flex>
        </Card>
    );
}

export default ProjectCard;
