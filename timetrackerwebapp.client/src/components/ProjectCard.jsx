import React, { act, useEffect, useState } from 'react';
import { Button, message, Dropdown, Flex, Card, Modal, Typography, Tag, Divider } from 'antd';
import Icon, { EditOutlined, EllipsisOutlined, CalendarOutlined, CarryOutOutlined, CheckCircleFilled, ExclamationCircleFilled, PlusOutlined, PieChartOutlined, ClockCircleOutlined, FolderOutlined, TeamOutlined, DeleteOutlined } from '@ant-design/icons';
import '@ant-design/v5-patch-for-react-19';

const { confirm } = Modal;
const { Text } = Typography;

//Стили
import '../App.css';

//Компоненты
import ActivityTimer from './ActivityTimer.jsx';

//Методы
import { useActivities } from '../useActivities.jsx';

function ProjectCard({
    token,
    projectId,
    title,
    cardOnClick = null,
    ascessKey,
    isUserProjet,
    dateCreate,
    dateFinish,
    paricipants,
    acts,
    status = 0
}) {

    const { startActivity, stopActivity, archiveActivity, unarchiveActivity, deleteActivity } = useActivities();

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
            case 'createNewProject':
                //
                break;
            case 'toArchive':
                //
                break;
            case 'delete':
                /*showDeleteConfirm(() => deleteActivity(token, activityId));*/
                break;
            default:
                message.info(`Выбран пункт: ${e.key}`);
        }
    };

    const showDeleteConfirm = (onOkClick) => {
        confirm({
            title: `Удаление "${title}" без возможности восстановления`,
            icon: <ExclamationCircleFilled />,
            content: 'Удаление активности приведёт к удалению всей истории отслеживания, а к удалению из проектов, в которые она была добавлена.',
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
                    message.error(`Не получилось удалить активность ${title}`);
                }
            },
            onCancel() {},
        });
    };

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
            key: 'getStats',
            icon: <PieChartOutlined />,
            label: (
                <a >
                    Получить статистику
                </a>
            ),
        },
        {
            key: 'checkHistory',
            icon: <ClockCircleOutlined />,
            label: (
                <a >
                    Посмотреть в истории
                </a>
            ),
        },
        {
            key: 'addToProject',
            icon: <TeamOutlined />,
            label: (
                <a >
                    Добавить в проект
                </a>
            ),
            children: [
                {
                    key: 'createNewProject',
                    icon: <PlusOutlined />,
                    label: 'Создать новый',
                },
                {
                    type: 'divider',
                },
                {
                    key: 'p1',
                    label: 'Крутой проект',
                },
                {
                    key: 'p2',
                    label: 'Мой проект',
                },
            ],
        },
        {
            key: 'toArchive',
            icon: <FolderOutlined />,
            label: (
                <a >
                    В архив
                </a>
            ),
        },
        {
            type: 'divider',
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
                //background: 'red'
            }}>
            <Card.Meta
                title={
                    <Flex justify='space-between'>
                        {title}
                        <Dropdown
                            menu={{
                                items: dropMenuItems.filter(item => !(item.key === 'toArchive' && status === 3)),
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

                    <CheckCircleFilled style ={{color: '#4DCF5C', fontSize: '16px', paddingTop: '2px'}}/>

                    <Flex vertical gap='4px'>
                        <Text>Активности в процессе:</Text>
                        <Flex>
                            <Tag color="purple">Бэкэнд</Tag>
                            <Tag color="purple">Фронтенд</Tag>
                        </Flex>
                    </Flex>
                </Flex>

                <Flex align='flex-start' gap='10px'>
                
                    <TeamOutlined style ={{fontSize: '16px', paddingTop: '2px'}}/>
                    
                    <Flex vertical gap='4px'>
                        <Text>Участники: 3</Text>
                        <Flex>
                            <Tag>@nikizhu</Tag>
                            <Tag>@crissier</Tag>
                            <Tag>@crissier</Tag>
                            <Tag>@crissier</Tag>
                        </Flex>
                    </Flex>
                </Flex>

                <Flex justify='space-between'>
                    <Flex align='flex-start' gap='10px'>
                        <CalendarOutlined style ={{fontSize: '16px', paddingTop: '2px'}}/>
                        
                        <Flex vertical gap='4px'>
                            <Text>Страт: 03.04.2025</Text>
                        </Flex>
                    </Flex>


                    <Flex align='flex-start' gap='10px'>
                        <CarryOutOutlined style ={{fontSize: '16px', paddingTop: '2px'}}/>
                        
                        <Flex vertical gap='4px'>
                            <Text>Финиш: 03.04.2025</Text>
                        </Flex>
                    </Flex>
                </Flex>
                
            </Flex>
        </Card>
    );
}

export default ProjectCard;
