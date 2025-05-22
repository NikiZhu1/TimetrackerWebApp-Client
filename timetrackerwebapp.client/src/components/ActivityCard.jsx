import React, { act, useEffect, useState } from 'react';
import { Button, message, Dropdown, Flex, Card, Modal, Typography, Input } from 'antd';
import Icon, { EditOutlined, EllipsisOutlined, CaretRightOutlined, PauseOutlined, FolderOpenOutlined, ExclamationCircleFilled, PlusOutlined, PieChartOutlined, ClockCircleOutlined, FolderOutlined, TeamOutlined, DeleteOutlined, CloseOutlined } from '@ant-design/icons';
import '@ant-design/v5-patch-for-react-19';

const { confirm } = Modal;
const { Text } = Typography;

//Компоненты
import ActivityTimer from './ActivityTimer.jsx';

//Методы
import { useActivities } from '../hooks/useActivities.jsx';
import { useProjects } from '../hooks/useProjects.jsx';

function ActivityCard({
    token,
    activityId,
    title,
    isCreator,
    project,
    dayStats,
    onProjectPage,
    cardOnClick,
    startTime,
    color,
    status
}) {

    const { startActivity, stopActivity, editActivityName, archiveActivity, unarchiveActivity, deleteActivity } = useActivities();
    const { removeActivityFromProject } = useProjects();
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [newTitle, setNewTitle] = useState(title);

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
                setNewTitle(title);
                setEditModalOpen(true);
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
            case 'deleteFromProject':
                await removeActivityFromProject(token, project.projectId, activityId);
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

    const handleEditTitle = async () => {
        try {
            console.log(newTitle, title);
            // if (newTitle.ToString() === title.ToString()) {
            //     Modal.destroyAll();
            //     return;
            // }
            await editActivityName(token, activityId, newTitle);
            message.success('Название успешно обновлено');
            setEditModalOpen(false);
        } catch (err) {
            if(err.status === 400)
                message.warning('У вас уже есть активность с этим названием');
            else
                message.error('Не удалось изменить название');
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
            label: 'Изменить',
        },
        // {
        //     key: 'getStats',
        //     icon: <PieChartOutlined />,
        //     label: 'Получить статистику',
        // },
        // {
        //     key: 'checkHistory',
        //     icon: <ClockCircleOutlined />,
        //     label: 'Посмотреть в истории',
        // },
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
            label: 'Поместить в архив',
        },
        {
            key: 'deleteFromProjectDivider',
            type: 'divider',
        },
        {
            key: 'deleteFromProject',
            icon: <CloseOutlined />,
            danger: true,
            label: 'Убрать из проекта',
        },
        {
            key: 'deleteDivider',
            type: 'divider',
        },
        {
            key: 'delete',
            icon: <DeleteOutlined />,
            danger: true,
            label: 'Удалить',
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
                            items: dropMenuItems.filter(item =>
                                !(item.key === 'toArchive' && status === 3) &&
                                !(item.key === 'delete' && status === 3) &&
                                !(item.key === 'deleteDivider' && status === 3) &&
                                !(item.key === 'addToProject' && status === 3) &&
                                !(item.key === 'delete' && !isCreator) &&
                                !(item.key === 'deleteDivider' && !isCreator) &&
                                !(item.key === 'deleteFromProject' && !project) &&
                                !(item.key === 'deleteFromProjectDivider' && !project) &&
                                !(item.key === 'addToProject') &&
                                !(item.key === 'edit' && !isCreator)),
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
                width: '220px',
                minWidth: '215px',
                flex: '1 1 220px',
                background: color,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
            }}>
            <Card.Meta
                title={title}
                description={
                    <>
                        {status === 2 && startTime && (
                            <p><ActivityTimer startTime={startTime} /></p>
                        )}
                        {status === 1 && dayStats !== '0м 0с' && (
                            <p>За сегодня: {dayStats}</p>
                        )}
                        {status === 1 && dayStats === '0м 0с' && (
                            <p>За сегодня нет записей</p>
                        )}
                        {project && !onProjectPage && 
                        (<p style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0}}>
                            Проект: {project.projectName}</p>)}
                        {!project && !onProjectPage && 
                        (<p>Без проекта</p>)}
                    </>
                }
            />

            {/* Модальное окно редактирования */}
            <Modal
                title="Изменить название активности"
                open={isEditModalOpen}
                async onOk={handleEditTitle}
                onCancel={() => setEditModalOpen(false)}
                okText="Изменить"
                cancelText="Отмена"
                destroyOnHidden 
            >
                <Flex vertical gap="middle">
                        <div>
                            <p>Активность:</p>
                            <p style={{fontSize: '16px', fontWeight: 'bold'}}>{title}</p>
                        </div>
                        <div>
                            <p>Новое название:</p>
                             <Input
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                placeholder="Новое название"
                                maxLength={100}
                            />
                        </div>
                    </Flex>
            </Modal>
        </Card>
    );
}

export default ActivityCard;
