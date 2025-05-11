import React, { useEffect, useState } from 'react';
import { Button, message, Table, Flex, Modal, DatePicker, TimePicker, ConfigProvider } from 'antd';
import { PlusOutlined, LinkOutlined } from '@ant-design/icons';
import '@ant-design/v5-patch-for-react-19';
import Cookies from 'js-cookie';
import { subscribe } from '../event.jsx';
import locale from 'antd/locale/ru_RU';
import 'dayjs/locale/ru'; 
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);

// Методы
import { GetJWT, GetUserIdFromJWT } from '../methods/UsersMethods.jsx';
import { useActivities } from '../useActivities.jsx';
import { useActivityPeriods } from '../useActivityPeriods.jsx';

function HistoryTab() {
    const { getUserStats, loadData } = useActivities();
    const { editActivityPeriod, deleteActivityPeriod } = useActivityPeriods();
    
    const [periods, setPeriods] = useState([]);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingPeriod, setEditingPeriod] = useState(null);
    const [editStartTime, setEditStartTime] = useState(null);
    const [editStopTime, setEditStopTime] = useState(null);

    useEffect(() => {
        const token = GetJWT();
        const userId = GetUserIdFromJWT(token);

        if (!token || !userId) {
            if (!token) message.warning('Сначала войдите в систему');
            if (!userId) Cookies.remove('token');
            navigate('/');
            return;
        }
        
        const fetchData = async () => {
            setLoading(true);
            try {
                const periodsData = await getUserStats(token, userId);
                setPeriods(periodsData);

                const activitiesData = await loadData(token, userId);
                setActivities(activitiesData);
            } catch (error) {
                message.error('Ошибка при загрузке данных');
                console.error('Ошибка:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        subscribe('activityPeriodsChanged', fetchData);

        return () => {
            // Отписываемся от события при размонтировании
            subscribe('activityPeriodsChanged', fetchData, true);
        };
    }, []);

    // Получение имени активности по ID
    const getActivityName = (activityId) => {
        const activity = activities.find(a => a.id === activityId);
        return activity ? activity.name : `Activity ${activityId}`;
    };

    // Форматирование даты и времени
    const formatDateTime = (dateString) => {
        if (!dateString) return 'Не завершено';
        return dayjs(dateString).format('DD.MM.YYYY HH:mm:ss');
    };

    // Форматирование времени
    const formatDuration = (timeString) => {
        if (!timeString) return '00:00:00';
        
        const match = timeString.match(/^(\d{2}):(\d{2}):(\d{2})/);
        if (match) {
            const [, h, m, s] = match;
            return `${h}ч ${m}м ${s}с`;
        }
        return timeString;
    };

    // Обработчик удаления периода
    const handleDelete = async (activityPeriodId) => {
        const token = GetJWT();
        try {
            await deleteActivityPeriod(token, activityPeriodId);
            message.success('Период успешно удален');
            // Обновляем данные после удаления
            const updatedPeriods = periods.filter(p => p.activityPeriodId !== activityPeriodId);
            setPeriods(updatedPeriods);
        } catch (error) {
            message.error('Ошибка при удалении периода');
            console.error('Ошибка:', error);
        }
    };

    // Обработчик начала редактирования
    const handleEditStart = (record) => {
        setEditingPeriod(record);
        setEditStartTime(dayjs(record.startTime));
        setEditStopTime(record.finishTime ? dayjs(record.finishTime) : null);
    };

    // Обработчик сохранения изменений
    const handleEditSave = async () => {
        if (!editingPeriod) return;
        
        const token = GetJWT();
        try {
            await editActivityPeriod(
                token,
                editingPeriod.key, // activityPeriodId
                editStartTime.toISOString(),
                editStopTime?.toISOString()
            );
            
            message.success('Период успешно обновлен');
            setEditingPeriod(null);
            
            // Обновляем данные после редактирования
            const updatedPeriods = periods.map(p => {
                if (p.activityPeriodId === editingPeriod.key) {
                    return {
                        ...p,
                        startTime: editStartTime.toISOString(),
                        stopTime: editStopTime?.toISOString()
                    };
                }
                return p;
            });
            setPeriods(updatedPeriods);
        } catch (error) {
            message.error('Ошибка при обновлении периода');
            console.error('Ошибка:', error);
        }
    };

    const columns = [
        {
            title: 'Название',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
        },
        {
            title: 'Время старта',
            dataIndex: 'startTime',
            key: 'startTime',
            render: (text) => formatDateTime(text),
            sorter: (a, b) => dayjs(a.startTime).unix() - dayjs(b.startTime).unix(),
        },
        {
            title: 'Время финиша',
            dataIndex: 'finishTime',
            key: 'finishTime',
            render: (text) => formatDateTime(text),
            sorter: (a, b) => dayjs(a.finishTime || 0).unix() - dayjs(b.finishTime || 0).unix(),
        },
        {
            title: 'Итоговое время',
            dataIndex: 'totalTime',
            key: 'totalTime',
            render: (text) => formatDuration(text),
        },
        {
            title: 'Действия',
            key: 'action',
            render: (_, record) => (
                <Flex gap="small">
                    <Button 
                        type="link" 
                        danger
                        onClick={() => handleDelete(record.key)}
                    >
                        Удалить
                    </Button>
                    <Button 
                        type="link" 
                        onClick={() => handleEditStart(record)}
                    >
                        Редактировать
                    </Button>
                </Flex>
            ),
        },
    ];

    // Подготовка данных для таблицы
    const tableData = periods.map(period => ({
        key: period.activityPeriodId,
        name: getActivityName(period.activityId),
        startTime: period.startTime,
        finishTime: period.stopTime,
        totalTime: period.totalTime
    }));

    return (
        <Flex vertical style={{paddingTop: '16px'}}>
            <Flex vertical style={{paddingBottom: '16px'}}>
                <p style={{fontSize: '20px', fontWeight: 500}}>История периодов отслеживания ваших активностей</p>
                <p style={{fontSize: '16px'}}>На этой странице вы можете отредактировать или удалить период активности, если например таймер активности был случайно запущен или забыли остановить.</p>
            </Flex>
            
            <Table 
                columns={columns} 
                dataSource={tableData} 
                loading={loading}
                pagination={{ pageSize: 10 }}
                scroll={{ x: true }}
                bordered
            />
            
            {/* Модальное окно редактирования */}
            <Modal
                title="Редактирование периода активности"
                visible={!!editingPeriod}
                onOk={handleEditSave}
                onCancel={() => setEditingPeriod(null)}
                okText="Сохранить"
                cancelText="Отмена"
            >
                {editingPeriod && (
                    <Flex vertical gap="middle">
                        <div>
                            <p>Активность: {editingPeriod.name}</p>
                        </div>
                        <div>
                            <p>Время старта:</p>
                            <ConfigProvider 
                                locale={locale}>
                                <DatePicker
                                    showTime
                                    format="DD.MM.YYYY HH:mm:ss"
                                    value={editStopTime}
                                    onChange={setEditStopTime}
                                    style={{ width: '100%' }}
                                />
                            </ConfigProvider>
                        </div>
                        <div>
                            <p>Время завершения:</p>
                            <ConfigProvider 
                                locale={locale}>
                                <DatePicker
                                    showTime
                                    format="DD.MM.YYYY HH:mm:ss"
                                    value={editStopTime}
                                    onChange={setEditStopTime}
                                    style={{ width: '100%' }}
                                />
                            </ConfigProvider>
                            
                        </div>
                    </Flex>
                )}
            </Modal>
        </Flex>
    );
}

export default HistoryTab;