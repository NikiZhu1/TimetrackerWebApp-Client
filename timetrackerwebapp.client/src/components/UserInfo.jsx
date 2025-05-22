import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, message, Dropdown, Flex, Modal, Space, Input, Tooltip } from 'antd';
import Icon, { UserOutlined, QuestionCircleOutlined, LinkOutlined, CalendarOutlined, CarryOutOutlined, CheckCircleFilled, ExclamationCircleFilled, UserDeleteOutlined, PieChartOutlined, ClockCircleOutlined, FolderOutlined, FolderOpenOutlined, TeamOutlined, DeleteOutlined, PauseCircleFilled, FrownOutlined } from '@ant-design/icons';
import '@ant-design/v5-patch-for-react-19';
import Cookies from 'js-cookie';

//Методы
import { useUsers } from '../hooks/useUsers.jsx';

function UserInfo( {
    userId,
    userName
}) {

    const { UserAvatar, changeUsername } = useUsers();
    const navigate = useNavigate();

    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [newUsername, setNewUsername] = useState(userName);
    const [newPasword, setNewPassword] = useState('');

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
            case 'profile':
                setNewUsername(userName);
                setEditModalOpen(true);
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
            label: 'Профиль',
        },
        {
            key: 'qa',
            icon: <QuestionCircleOutlined />,
            label: 
            <a target="_blank" rel="noopener noreferrer" href="https://telegra.ph/Lovec-vremeni-Veb-prilozhenie--Spravka-05-22">
                Справка
            </a>,
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            icon: <LogOutIcon />,
            danger: true,
            label: 'Выйти',
        },
    ];

    const handleChangeUsername = async () => {
        try {
            if (newUsername === userName) {
                message.success("Это уже ваше имя");
                return;
            }   
            await changeUsername(userId, newUsername);
            message.success(`Имя изменено @${newUsername}`);
        } catch (error) {
            console.log(error);
            if (error.status === 400)
                message.warning('Это имя пользователя уже занято')
            else
                message.error('Не получилось поменять имя')
        }

    }

    return (
        <div>
        <Dropdown
            menu={{
                items: dropMenuItems,
                onClick: handleMenuClick
            }}
            placement="bottomRight"
            trigger={["click"]}>
            <Button type="text" size='large'>
                <Flex align='center' gap='8px'>
                    {userName && <UserAvatar name={userName} id={userId} size={30} fontSize='14px'/>}
                    {userName && `@${userName}`}
                </Flex>
            </Button>
        </Dropdown>

        {/* Модальное окно редактирования */}
        <Modal
            title="Профиль"
            open={isEditModalOpen}
            // onOk={handleEditSave}
            onCancel={() => setEditModalOpen(false)}
            okText="Закрыть"
            width={400}
            footer={[
            // <Button key="submit" type="default" onClick={() => setEditModalOpen(false)}>
            //     Закрыть
            // </Button>
            ]}
        >
            <Flex vertical gap="middle" >
                <Flex justify='center'>
                    <UserAvatar name={userName} id={userId} size={64} fontSize={26}/>
                </Flex>
                <div style={{width: '100%'}}>
                    <p>Ваше уникальное имя пользователя:</p>
                    <Space.Compact style={{ width: '100%' }}>
                        <Input
                            addonBefore="@"
                            value={newUsername} 
                            maxLength={50}
                            onChange={(e) => setNewUsername(e.target.value)}/>
                        <Button 
                            type="primary" 
                            disabled={newUsername?.length <= 3}
                            onClick={() => handleChangeUsername()}>
                                Изменить
                        </Button>
                    </Space.Compact>
                    {/* {(<p style={{color: 'red'}}>Это имя пользователя уже занято</p>)} */}
                </div>
                {/* <div>
                    <p>Пароль:</p>
                    <Space.Compact style={{ width: '100%' }}>
                        <Input
                            placeholder='Новый пароль'
                            value={newPasword}
                            maxLength={50}
                            onChange={(e) => setNewPassword(e.target.value)}/>
                        <Button 
                            type="primary" 
                            disabled={newUsername?.length <= 3}>
                                Изменить
                        </Button>
                    </Space.Compact>
                </div> */}
            </Flex>
        </Modal>
        </div>
    );
}

export default UserInfo;
