import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, message, Dropdown, Flex, Modal, Typography, Avatar, Tooltip } from 'antd';
import Icon, { UserOutlined, QuestionCircleOutlined, LinkOutlined, CalendarOutlined, CarryOutOutlined, CheckCircleFilled, ExclamationCircleFilled, UserDeleteOutlined, PieChartOutlined, ClockCircleOutlined, FolderOutlined, FolderOpenOutlined, TeamOutlined, DeleteOutlined, PauseCircleFilled, FrownOutlined } from '@ant-design/icons';
import '@ant-design/v5-patch-for-react-19';
import Cookies from 'js-cookie';

const { confirm } = Modal;

//Методы
import { useUsers } from '../useUsers.jsx';

function UserInfo( {
    userId,
    userName
}) {

    const { UserAvatar } = useUsers();
    const navigate = useNavigate();

    //Тест своих иконок
    const LogoutSvg = () => (
        <svg viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M6 14.5H3.33333C2.97971 14.5 2.64057 14.3595 2.39052 14.1095C2.14048 13.8594 2 13.5203 2 13.1667V3.83333C2 3.47971 2.14048 3.14057 2.39052 2.89052C2.64057 2.64048 2.97971 2.5 3.33333 2.5H6M10.6667 11.8333L14 8.5M14 8.5L10.6667 5.16667M14 8.5H6"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
    const LogOutIcon = props => <Icon component={LogoutSvg} {...props} />;

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
            case 'logout':
                Cookies.remove('token'); // Удаляем токен
                message.info('Вы вышли из системы');
                navigate('/');
                break;
            default:
                message.info(`Выбран пункт: ${e.key}`);
        }
    };

    //Элементы выпадающего меню
    const dropMenuItems = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: (
                <a >
                    Профиль
                </a>
            ),
        },
        {
            key: 'qa',
            icon: <QuestionCircleOutlined />,
            label: (
                <a >
                    Справка
                </a>
            ),
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            icon: <LogOutIcon />,
            danger: true,
            label: (
                <a>
                    Выйти
                </a>
            ),
        },
    ];

    return (
        <Dropdown
            menu={{
                items: dropMenuItems,
                onClick: handleMenuClick
            }}
            placement="bottomRight"
            trigger={["click", "hover"]}>
            <Button type="text" size='large'>
                <Flex align='center' gap='8px'>
                    {userName && <UserAvatar name={userName} id={userId} size={30} fontSize='14px'/>}
                    {userName && `@${userName}`}
                </Flex>
            </Button>
        </Dropdown>
    );
}

export default UserInfo;
