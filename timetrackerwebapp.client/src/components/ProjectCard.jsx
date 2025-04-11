import React, { act, useEffect, useState } from 'react';
import { Button, message, Dropdown, Flex, Card, Modal, Typography } from 'antd';
import Icon, { EditOutlined, EllipsisOutlined, CaretRightOutlined, PauseOutlined, FolderOpenOutlined, ExclamationCircleFilled, PlusOutlined, PieChartOutlined, ClockCircleOutlined, FolderOutlined, TeamOutlined, DeleteOutlined } from '@ant-design/icons';
import '@ant-design/v5-patch-for-react-19';

const { confirm } = Modal;

//Компоненты
import ActivityTimer from './ActivityTimer.jsx';

//Методы
import { useActivities } from '../useActivities.jsx';

function ProjectCard({
    token,
    projectId,
    title,
    cardOnClick = null,
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
                boxxShadow: `0px 0px 0px 0px rgba(204, 194, 255, 0.1),
                           0px 6px 13px 0px rgba(204, 194, 255, 0.1),
                           0px 23px 23px 0px rgba(204, 194, 255, 0.09),
                           0px 51px 31px 0px rgba(204, 194, 255, 0.05),
                           0px 91px 37px 0px rgba(204, 194, 255, 0.01),
                           0px 143px 40px 0px rgba(204, 194, 255, 0)`,
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
                description={
                    <>
                        <Typography.Text>FFFFFF</Typography.Text>
                    </>
                }
            />
            <Typography.Text>FFFFFF</Typography.Text>
        </Card>
    );
}

export default ProjectCard;
