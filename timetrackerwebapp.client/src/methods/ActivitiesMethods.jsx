import React, { useEffect, useState } from 'react';
import '@ant-design/v5-patch-for-react-19';
import axios from 'axios';
import { message } from 'antd';
import { emit } from '../event.jsx';

// Получение активностей
export const getActivities = async (token, userId) => {
    if (!token || !userId) return [];

    try {
        const response = await axios.get(`http://localhost:8080/api/Users/${userId}/activities`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        // Сортируем активности по ID (по возрастанию)
        const sortedActivities = response.data.sort((a, b) => a.id - b.id);

        console.log("Полученные активности: ", sortedActivities);
        return response.data;
    } catch (error) {
        console.error('Ошибка при получении активностей:', error);
        throw error;
        return [];
    }
};

// Получение периодов активности
export const getActivityPeriods = async (token, activityId) => {

    if (!token || !activityId) return;

    try {
        const response = await axios.get(
            `http://localhost:8080/api/ActivityPeriods?activityId=${activityId}`,
            {
                headers: { Authorization: `Bearer ${token}` },
                validateStatus: status => (status >= 200 && status < 300) || status === 404
            }
        );

        // Обрабатываем 404 явно
        if (response.status === 404) {
            console.log(`Активность ${activityId} не имеет периодов отслеживания`);
            return [];
        }

        const periods = response.data?.ActivityPeriods || [];
        //console.log(`Полученное время активности id ${activityId}:`, periods);
        return periods;

    } catch (error) {
        console.error('Ошибка при получении периодов активности:', error);
        throw error;
        return [];
    }
};

// Получение всех периодов по всем активностям
export const getAllActivityPeriods = async (token, userId, activities) => {
    if (!token || !userId || !activities?.length) return {};

    try {
        const promises = activities.map(activity =>
            getActivityPeriods(token, activity.id)
                .then(periods => ({
                    activityId: activity.id,
                    periods
                }))
                .catch(() => ({
                    activityId: activity.id,
                    periods: []
                }))
        );

        const allPeriods = await Promise.all(promises);
        const periodsByActivity = {};

        allPeriods.forEach(({ activityId, periods }) => {
            periodsByActivity[activityId] = periods;
        });

        console.log(`Полученные периоды активностей :`, periodsByActivity);
        return periodsByActivity;

    } catch (error) {
        console.error('Ошибка при получении всех периодов:', error);
        throw error;
        return [];
    }
};


// Форматирование времени
export const formatActivityTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Нажатие на карточку
export const actCard_Click = (activityId) => {
    console.log('Выбрана активность с ID:', activityId);
};

// Нажатие на кнопку
export const actButton_Click = (activityId) => {
    console.log('Запуск активности с ID:', activityId);
};

// Общая функция для управления трекером активности
export const manageActivity = async (token, activityId, isStarted) => {
    try {
        const response = await axios.post('http://localhost:8080/api/ActivityPeriods',
            {
                ActivityId: activityId,
                IsStarted: isStarted
            },
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        //emit('activityChanged'); //Обновление данных
        return response.data;
    } catch (error) {
        console.error(`Ошибка при ${isStarted ? 'старте' : 'остановке'} активности:`, error);
        throw error;
    }
};


// Общая функция для изменения архивации активности
export const manageArchiveActivity = async (token, activityId, isArchived) => {
    try {
        const response = await axios.put(`http://localhost:8080/api/Activities/${activityId}`,
            {
                updateName: false,
                archived: isArchived
            },
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        return response.data;
    } catch (error) {
        console.error(`Ошибка при ${isArchived ? 'архивации' : 'восстановлении'} активности:`, error);
        throw error;
    }
};

// Общая функция для изменения названия активности
export const updateActivityName = async (token, activityId, newActivityName) => {
    try {
        const response = await axios.put(`http://localhost:8080/api/Activities/${activityId}`,
            {
                updateName: true,
                archived: false,
                newName: newActivityName
            },
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        return response.data;
    } catch (error) {
        console.error(`Ошибка при изменении названия активности:`, error);
        throw error;
    }
};

// Общая функция для изменения названия активности
export const DeleteActivity = async (token, activityId) => {
    try {
        const response = await axios.delete(`http://localhost:8080/api/Activities/${activityId}`,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        return response.data;
    } catch (error) {
        console.error(`Ошибка при удаении активности:`, error);
        throw error;
    }
};
