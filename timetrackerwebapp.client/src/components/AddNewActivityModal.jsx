import React, { act, useEffect, useState } from 'react';
import { Button, message, Form, Input, Select, Modal, Flex, Typography, Tag } from 'antd';
import Icon, { PlusOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import '@ant-design/v5-patch-for-react-19';

const { confirm } = Modal;

//Методы
import { useActivities } from '../useActivities.jsx';
import { useProjects } from '../useProjects.jsx';
import { GetJWT, GetUserIdFromJWT } from '../methods/UsersMethods.jsx';

export const showAddNewActivity = (addToProject = false, projectId = null, projectName = null) => {
    confirm({
        title: `Создать новую активность`,
        icon: null,
        content: <AddNewActivityForm addToProject={addToProject} projectId={projectId} projectName={projectName}/>,
        centered: true,
        closable: true,
        maskClosable: true,
        footer: null
    });
};

function AddNewActivityForm({
    addToProject = false,
    projectId = null,
    projectName = null}) {

    const { loading, addActivity } = useActivities();
    const { addActivityToProject } = useProjects();
    const [form] = Form.useForm(); // Добавляем хук формы

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

            const activityData = await addActivity(token, userId, values.name);
            console.warn(activityData);
            if (addToProject) {
                await addActivityToProject(token, projectId, activityData.id);
            }
            Modal.destroyAll();
            message.success(`${values.name}: Добавлена новая активность`);
            console.log("Добавлена новая активность: ", values);
        }
        catch (error) {
            if (error.response?.status === 400) {
                // Устанавливаем ошибку для конкретного поля
                form.setFields([{
                    name: 'name',
                    errors: ['У вас уже есть активность с таким названием'],
                }]);
            } else {
                console.error(error);
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
            async onFinish={onFinish}
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
            
            {addToProject && (<>
                <p>Добавление в проект:</p>
                <p style={{fontWeight: 'bold'}}>{projectName}</p>
            </>)}

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