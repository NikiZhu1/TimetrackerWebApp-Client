import React, { act, useEffect, useState } from 'react';
import { Button, message, Form, Input, Select, Modal, Flex, Image } from 'antd';
import Icon, { PlusOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import '@ant-design/v5-patch-for-react-19';

const { confirm } = Modal;

//Методы
import { useProjects } from '../useProjects.jsx';
import { GetJWT, GetUserIdFromJWT } from '../methods/UsersMethods.jsx';

export const showAddNewProject = () => {
    confirm({
        title: `Создать новый проект`,
        icon: null,
        content: <AddNewProjectForm/>,
        centered: true,
        closable: true,
        maskClosable: true,
        footer: null,
    });
};

function AddNewProjectForm() {

    const { loading, stopActivity, createProject, countStatus1, countStatus2, countStatus3 } = useProjects();
    const [form] = Form.useForm(); // Добавляем хук формы

    const projects = [
        {

        }
    ]

    // Добавление активности
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

            await createProject(token, values.name);
            Modal.destroyAll();
            message.success(`${values.name}: Добавлен новый проект`);
            console.log("Добавлен новый проект: ", values);
        }
        catch (error) {
            if (error.response?.status === 409) {
                // Устанавливаем ошибку для конкретного поля
                form.setFields([{
                    name: 'name',
                    errors: ['Уже есть активность с таким названием'],
                }]);
            } else {
                message.error('Произошла ошибка при создании проекта');
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
                name="name"
                label="Название"
                rules={[
                    { required: true, message: 'У проекта должно быть название' },
                    // Добавляем кастомное правило для проверки уникальности
                    () => ({
                        validator(_, value) {
                            return Promise.resolve();
                        },
                    }),
                ]}>
                <Input
                    maxLength={50}
                    placeholder="Как назовём проект?"
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
                    icon={<PlusOutlined />}
                    loading={loading}
                    onClick={() => onFinish}>
                    Добавить
                </Button>
            </Flex>
            
        </Form>
    );
}