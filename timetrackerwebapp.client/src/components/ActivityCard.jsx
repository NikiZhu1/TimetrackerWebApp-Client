﻿import React, { useEffect, useState } from 'react';
import { Button, message, Layout, Collapse, Dropdown, Flex, Card, Avatar } from 'antd';
import Icon, { EditOutlined, EllipsisOutlined, CaretRightOutlined, PauseOutlined, FolderOpenOutlined, SettingOutlined, PlusOutlined, PieChartOutlined, ClockCircleOutlined, FolderOutlined, TeamOutlined, DeleteOutlined } from '@ant-design/icons';
import '@ant-design/v5-patch-for-react-19';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';

function ActivityCard({
    title,
    cardOnClick,
    buttonOnClick,
    color,
    dayStats,
    status
}) {

    // Определяем иконку и текст в зависимости от статуса
    const buttonConfig = {
        1: { icon: <CaretRightOutlined />, text: 'Старт' },
        2: { icon: <PauseOutlined />, text: 'Стоп' },
        3: { icon: <FolderOpenOutlined />, text: 'Восстановить' }
    };

    const currentConfig = buttonConfig[status];

    const dropMenuItems = [
        {
            key: '1',
            type: 'group',
            label: title
        },
        {
            key: '1',
            icon: <EditOutlined />,
            label: (
                <a >
                    Изменить
                </a>
            ),
        },
        {
            key: '2',
            icon: <PieChartOutlined />,
            label: (
                <a >
                    Получить статистику
                </a>
            ),
        },
        {
            key: '3',
            icon: <ClockCircleOutlined />,
            label: (
                <a >
                    Посмотреть в истории
                </a>
            ),
        },
        {
            key: '4',
            icon: <TeamOutlined />,
            label: (
                <a >
                    Добавить в проект
                </a>
            ),
            children: [
                {
                    key: 'p0',
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
            key: '5',
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
            key: '6',
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
                            buttonOnClick?.();
                        }}
                        style={{
                            minWidth: '100px',
                            color: '#282828'
                        }}>
                        {currentConfig.text}
                    </Button>

                    <Dropdown
                        menu={{ items: dropMenuItems }}
                        placement="bottom"
                        trigger={["hover"]}>
                        <Button
                            color="default"
                            type="text"
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
                boxShadow: `0px 0px 0px 0px rgba(204, 194, 255, 0.1),
                           0px 6px 13px 0px rgba(204, 194, 255, 0.1),
                           0px 23px 23px 0px rgba(204, 194, 255, 0.09),
                           0px 51px 31px 0px rgba(204, 194, 255, 0.05),
                           0px 91px 37px 0px rgba(204, 194, 255, 0.01),
                           0px 143px 40px 0px rgba(204, 194, 255, 0)`,
                background: color
            }}>
            <Card.Meta
                title={title}
                description={
                    <>
                        <p>За сегодня: {dayStats}</p>
                        <p>Статус: {status}</p>
                    </>
                }
            />
        </Card>
    );
}

export default ActivityCard;
