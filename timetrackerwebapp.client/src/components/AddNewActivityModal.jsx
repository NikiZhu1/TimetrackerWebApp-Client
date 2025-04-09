import React, { act, useEffect, useState } from 'react';
import { Button, message, Form, Input, Select, Modal, Flex } from 'antd';
import Icon, { PlusOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import '@ant-design/v5-patch-for-react-19';

const { confirm } = Modal;

//Методы
import { useActivities } from '../useActivities.jsx';
import { GetJWT, GetUserIdFromJWT } from '../methods/UsersMethods.jsx';

export const showAddNewActivity = () => {
    confirm({
        title: `Создать новую активность`,
        icon: null,
        content: <AddNewActivityForm/>,
        centered: true,
        closable: true,
        maskClosable: true,
        footer: null,
    });
};

function AddNewActivityForm() {

    const { loading, stopActivity, addActivity, countStatus1, countStatus2, countStatus3 } = useActivities();
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

            await addActivity(token, userId, values.name);
            Modal.destroyAll();
            message.success(`${values.name}: Добавлена новая активность`);
            console.log("Добавлена новая активность: ", values);
        }
        catch (error) {
            if (error.response?.status === 409) {
                // Устанавливаем ошибку для конкретного поля
                form.setFields([{
                    name: 'name',
                    errors: ['Уже есть активность с таким названием'],
                }]);
            } else {
                message.error('Произошла ошибка при создании активности');
            }
        }
    };

    return (
        <Form
            form={form} // Подключаем форму
            name="addNewActivityForm"
            layout="vertical"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            style={{marginRight: '-12px'}}>

            <Form.Item
                name="name"
                label="Название"
                rules={[
                    { required: true, message: 'У активности должно быть название' },
                    // Добавляем кастомное правило для проверки уникальности
                    () => ({
                        validator(_, value) {
                            return Promise.resolve();
                        },
                    }),
                ]}>
                <Input
                    maxLength={50}
                    placeholder="Что будем отслеживать?"
                />
            </Form.Item>

            <Form.Item
                name="project"
                label="Проект (не обязательно)">
                <Select
                    options={projects }
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