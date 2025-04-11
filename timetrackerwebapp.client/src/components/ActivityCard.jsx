import React, { act, useEffect, useState } from 'react';
import { Button, message, Dropdown, Flex, Card, Modal } from 'antd';
import Icon, { EditOutlined, EllipsisOutlined, CaretRightOutlined, PauseOutlined, FolderOpenOutlined, ExclamationCircleFilled, PlusOutlined, PieChartOutlined, ClockCircleOutlined, FolderOutlined, TeamOutlined, DeleteOutlined } from '@ant-design/icons';
import '@ant-design/v5-patch-for-react-19';

const { confirm } = Modal;

//Компоненты
import ActivityTimer from './ActivityTimer.jsx';

//Методы
import { useActivities } from '../useActivities.jsx';

function ActivityCard({
    token,
    activityId,
    title,
    cardOnClick,
    buttonOnClick,
    startTime,
    color,
    status
}) {

    const { startActivity, stopActivity, archiveActivity, unarchiveActivity, deleteActivity } = useActivities();

    //Действие кнопки
    const handleAction = async () => {

        try {
            switch (status) {
                case 1: //Старт
                    await startActivity(token, activityId);
                    message.success(`${title}: Отслеживание началось`);
                    break;
                case 2: //Стоп
                    await stopActivity(token, activityId);
                    message.success(`${title}: Отслеживание закончено`);
                    break;
                case 3: //Восстановить
                    await unarchiveActivity(token, activityId);
                    message.success(`${title}: Восстановленно из архива`);
                    break;
                default:
                    message.warning(`Неизвестное действие`);
            }

        } catch (error) {
            message.error(`Ошибка: ${error.message}`);
        }
    };

    // Определяем иконку и текст в зависимости от статуса
    const buttonConfig = {
        1: { icon: <CaretRightOutlined />, text: 'Старт' },
        2: { icon: <PauseOutlined />, text: 'Стоп' },
        3: { icon: <FolderOpenOutlined />, text: 'Восстановить' }
    };
    const currentConfig = buttonConfig[status];

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
                if (status === 3)
                    break;
                if (status === 2)
                    await stopActivity(token, activityId);
                await archiveActivity(token, activityId);
                message.success(`${title}: Отпавлено в архив`);
                break;
            case 'delete':
                showDeleteConfirm(() => deleteActivity(token, activityId));
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
            actions={[
                <Flex
                    key="actions"
                    justify='space-between'
                    style={{
                        paddingLeft: '16px',
                        paddingRight: '16px',
                    }}>

                    <Button
                        icon={currentConfig.icon}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleAction?.();
                        }}
                        style={{
                            minWidth: '100px',
                            color: '#282828'
                        }}>
                        {currentConfig.text}
                    </Button>

                    <Dropdown
                        menu={{
                            items: dropMenuItems.filter(item =>!(item.key === 'toArchive' && status === 3)),
                            onClick: handleMenuClick }}
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
            ]}
            style={{
                width: '215px',
                background: color
            }}>
            <Card.Meta
                title={title}
                description={
                    <>
                        
                        {status === 2 && startTime && (
                            <p><ActivityTimer startTime={startTime} /></p>
                        )}
                        {status === 1 && (
                            <p>За сегодня: {}</p>
                        )}
                    </>
                }
            />
        </Card>
    );
}

export default ActivityCard;
