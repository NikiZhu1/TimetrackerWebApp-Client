import React, { useEffect, useState } from 'react';
import { Button, message, Layout, Collapse, ConfigProvider, Flex, Card, Avatar } from 'antd';
import Icon, { EditOutlined, EllipsisOutlined, CaretRightOutlined, PauseOutlined, FolderOpenOutlined, MenuOutlined, SettingOutlined } from '@ant-design/icons';
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
                    
                    <Button
                        color="default"
                        variant="text"
                        icon={<EllipsisOutlined style={{
                            fontSize: '16px',
                            color: '#282828' }} />}>
                    </Button>
                </Flex>
            ]}
            style={{
                width: '220px',
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
