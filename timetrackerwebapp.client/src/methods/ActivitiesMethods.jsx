import React, { useEffect, useState } from 'react';
import '@ant-design/v5-patch-for-react-19';
import axios from 'axios';
import Cookies from 'js-cookie';

//Методы
import { GetJWT, GetUserIdFromJWT } from './UsersMethods.jsx';

//Компоненты
import ActivityCard from '../components/ActivityCard.jsx';

let setActivitiesRef = null;
let activitiesRef = [];

export const initActivitiesState = (setActivities, getActivitiesSnapshot) => {
    setActivitiesRef = setActivities;
    activitiesRef = getActivitiesSnapshot;
};

// Получение активностей
export const getActivities = (token, userId) => {

    if (!token || !userId) return;

    axios.get(`http://localhost:8080/api/Users/${userId}/activities`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
        .then(response => {
            setActivitiesRef?.(response.data);
            activitiesRef = response.data;
            console.log("Полученные активности: ", response.data);
        })
        .catch(error => {
            console.error('Ошибка при получении активностей:', error);
        });
};

// Получение периодов активности
export const getActivityPeriods = (activityId) => {
    const token = GetJWT();

    if (!token || !activityId) return;

    axios.get(`http://localhost:8080/api/ActivityPeriods?activityId=${activityId}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
        .then(response => {
            setActivitiesRef?.(response.data);
            console.log(`Полученное время активности ${activityId}:`, response.data);
        })
        .catch(error => {
            console.error('Ошибка при получении периодов активности:', error);
        });
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
    return activitiesRef
        .filter(activity => activity.StatusId === statusId)
        .map(activity => (
            <ActivityCard
                key={activity.Id}
                title={activity.Name}
                dayStats={formatActivityTime(activity.ActiveFrom)}
                color='rgb(204, 194, 255)'
                cardOnClick={() => actCard_Click(activity.Id)}
                buttonOnClick={() => actButton_Click(activity.Id)}
                status={activity.StatusId}
            />
        ));
};

// Рендер карточек по статусу
export const renderActivityDayStats = () => {
    return activitiesRef
        .filter(activity => activity.StopTime === null)
        .map(activity => (
            <ActivityCard
                key={activity.Id}
                title={activity.Name}
                dayStats={formatActivityTime(activity.ActiveFrom)}
                color='rgb(204, 194, 255)'
                cardOnClick={() => actCard_Click(activity.Id)}
                buttonOnClick={() => actButton_Click(activity.Id)}
                status={activity.StatusId}
            />
        ));
};
