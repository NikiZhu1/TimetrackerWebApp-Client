import React, { useEffect, useState } from 'react';
import '@ant-design/v5-patch-for-react-19';
import axios from 'axios';
import { message } from 'antd';

//Методы
import { GetJWT, GetUserIdFromJWT } from './UsersMethods.jsx';

//Компоненты
import ActivityCard from '../components/ActivityCard.jsx';

let setActivitiesRef = null;
let activitiesRef = [];

export const initActivitiesState = (setActivities, activities) => {
    setActivitiesRef = setActivities;
    activitiesRef = activities;
};

let setActivityPeriodRef = null;
let activityPeriodRef = [];

export const initActivitiyPeriodState = (setActivityPeriods, activityPeriods) => {
    setActivityPeriodRef = setActivityPeriods;
    activityPeriodRef = activityPeriods;
};

let setActivitiesPeriodsRef = null;
let activitiesPeriodsRef = [];

export const initActivitiesPeriodsState = (setActivitiesPeriods, activitiesPeriods) => {
    setActivitiesPeriodsRef = setActivitiesPeriods;
    activitiesPeriodsRef = activitiesPeriods;
};

const refreshActivityData = async () => {
    const token = GetJWT();
    const userId = GetUserIdFromJWT(token);
    const activitiesRef = await getActivities(token, userId); // Ваша существующая функция
    await getAllActivityPeriods(token, userId, activitiesRef); // Ваша существующая функция
};

// Получение одной активности из массива полученных
const getActivity = (activityId) => {
    if (!activitiesRef || !Array.isArray(activitiesRef))
        return null;
    return activitiesRef.find(activity => activity.Id === activityId) || null;
};

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
        const sortedActivities = response.data.sort((a, b) => a.Id - b.Id);

        setActivitiesRef?.(sortedActivities);
        activitiesRef = sortedActivities;
        console.log("Полученные активности: ", sortedActivities);
        return response.data;
    } catch (error) {
        console.error('Ошибка при получении активностей:', error);
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
                headers: {
                    Authorization: `Bearer ${token}`
                },
                validateStatus: function (status) {
                    // Считаем статусы 200 и 404 валидными
                    return (status >= 200 && status < 300) || status === 404;
                }
            }
        );

        // Обрабатываем 404 явно
        if (response.status === 404) {
            console.log(`Активность ${activityId} не имеет периодов отслеживания`);
            setActivityPeriodRef?.([]);
            activityPeriodRef = [];
            return [];
        }

        const periods = response.data?.ActivityPeriods || [];
        setActivityPeriodRef?.(periods);
        activityPeriodRef = periods;
        //console.log(`Полученное время активности id ${activityId}:`, periods);
        return periods;

    } catch (error) {
        console.error('Ошибка при получении периодов активности:', error);
        return [];
    }
};

// Получение всех периодов по всем активностям
export const getAllActivityPeriods = async (token, userId, activities) => {
    if (!token || !userId || !activities?.length) return {};

    try {
        const promises = activities.map(activity =>
            getActivityPeriods(token, activity.Id)
                .then(periods => ({
                    activityId: activity.Id,
                    periods
                }))
                .catch(() => ({
                    activityId: activity.Id,
                    periods: []
                }))
        );

        const allPeriods = await Promise.all(promises);
        const periodsByActivity = {};

        allPeriods.forEach(({ activityId, periods }) => {
            periodsByActivity[activityId] = periods;
        });

        setActivitiesPeriodsRef?.(periodsByActivity);
        activitiesPeriodsRef = periodsByActivity;
        console.log(`Полученные периоды активностей :`, periodsByActivity);
        return periodsByActivity;

    } catch (err) {
        console.error('Ошибка при получении всех периодов:', err);
        return {};
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

// Рендер карточек по статусу
export const renderActivityCards = (statusId) => {

    const token = GetJWT();
    if (!token) {
        message.warning('Сначала войдите в систему');
        navigate('/');
        return;
    }

    return activitiesRef
        .filter(activity => activity.StatusId === statusId)
        .map(activity => (
            <ActivityCard
                key={activity.Id}
                activityId={activity.Id}
                title={activity.Name}
                dayStats={formatActivityTime(activity.ActiveFrom)}
                color='rgb(204, 194, 255)'
                status={activity.StatusId}
                cardOnClick={() => actCard_Click(activity.Id)}
                buttonOnClick={
                    activity.StatusId === 1
                        ? () => { startActivity(token, activity.Id) }
                        : () => { stopActivity(token, activity.Id) }
                }
            />
        ));
};

// Получение времени старта текущего отслеживания активности
export const getActivityLastStats = (activityId) => {
    if (!activityId || !activitiesPeriodsRef[activityId]) return null;

    const activePeriod = activitiesPeriodsRef[activityId].find(
        period => period.StopTime === null
    );

    return activePeriod?.StartTime || null;
};

// Общая функция для управления активностью
const manageActivity = async (token, activityId, isStarted) => {
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

        refreshActivityData(); //Обновление данных
        return response.data;
    } catch (error) {
        console.error(`Ошибка при ${isStarted ? 'старте' : 'остановке'} активности:`, error);
        throw error;
    }
};

// Старт активности
export const startActivity = async (token, activityId) => {
    try {
        const result = await manageActivity(token, activityId, true);
        message.success(`${getActivity(activityId).Name}: Отслеживание началось`);
        console.log('Запуск активности с ID:', activityId);
        return result;
    }
    catch (error) {
        message.error('Не удалось начать активность');
        return null;
    }
};

// Остановка активности
export const stopActivity = async (token, activityId) => {
    try {
        const result = await manageActivity(token, activityId, false);
        message.success('Активность остановлена');
        console.log('Остановка активности с ID:', activityId);
        return result;
    } catch (error) {
        message.error('Не удалось остановить активность');
        return null;
    }
};
