import React, { act, useEffect, useState } from 'react';
import { Button, message, Form, Input, Select, Modal, Flex, Image } from 'antd';
import Icon, { LinkOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import '@ant-design/v5-patch-for-react-19';

const { confirm } = Modal;

//Методы
import { useProjects } from '../hooks/useProjects.jsx';
import { GetJWT, GetUserIdFromJWT } from '../API methods/UsersMethods.jsx';

export const showJoinToProject = () => {
    confirm({
        title: `Присоединться к проекту`,
        icon: null,
        content: <JoinToProjectForm/>,
        centered: true,
        closable: true,
        maskClosable: true,
        footer: null,
    });
};

function JoinToProjectForm() {

    const { loading, createProject, joinToProject } = useProjects();
    const [form] = Form.useForm(); // Добавляем хук формы

    // Присоединение к проекту
    const onFinish = async (values) => {
        try {
            const token = GetJWT();
            const userId = GetUserIdFromJWT(token);

            if (!token || !userId) {
                if (!token) message.warning('Сначала войдите в систему');
                if (!userId) Cookies.remove('token');
                navigate('/');
                return;
            }

            await joinToProject(token, values.projectKey);
            Modal.destroyAll();
            message.success(`Вы подключились к проекту`);
        }
        catch (error) {
            if (error.response?.status === 409) {
                // Устанавливаем ошибку для конкретного поля
                form.setFields([{
                    name: 'projectKey',
                    errors: ['Код приглашения недействителен либо вы уже состоите в этом проекте'],
                }]);
            } else {
                message.error('Не получилось присоединиться к проекту');
                console.error('Ошибка при создании проекта', error)
            }
        }
    };

    return (
        <Form
            form={form} // Подключаем форму
            name="addNewProjectForm"
            layout="vertical"
            initialValues={{ }}
            onFinish={onFinish}
            style={{marginRight: '-12px'}}>
            
            <Image
                src='https://i.ibb.co/mdCW4D3/4398920-2317146.png'
                preview={false}
            />

            <Form.Item
                name="projectKey"
                label="Код приглашения"
                rules={[
                    { required: true, message: 'Введите код приглашения' },
                    // Добавляем кастомное правило для проверки уникальности
                    () => ({
                        validator(_, value) {
                            return Promise.resolve();
                        },
                    }),
                ]}>
                <Input
                    maxLength={50}
                    placeholder="Пригласительный код"
                />
            </Form.Item>

            <Flex justify='flex-end' gap='12px' style={{paddingTop: '24px'} }>
                <Button
                    onClick={() => Modal.destroyAll()}>
                    Отмена
                </Button>
                <Button
                    type="primary"
                    htmlType="submit"
                    icon={<LinkOutlined />}
                    loading={loading}
                    onClick={() => onFinish}>
                    Присоединиться
                </Button>
            </Flex>
            
        </Form>
    );
}