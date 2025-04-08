import React, { useEffect, useState, useCallback, useRef } from 'react';
import { getActivities, getAllActivityPeriods, manageArchiveActivity, manageActivity, DeleteActivity } from './methods/ActivitiesMethods';
import { Button, message } from 'antd';
import { emit, subscribe } from './event.jsx';

export const useActivities = () => {
    const [activities, setActivities] = useState([]);
    const [periods, setPeriods] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const activitiesRef = useRef(activities);
    const periodsRef = useRef(periods);

    // Синхронизируем ref с состоянием
    useEffect(() => {
        activitiesRef.current = activities;
    }, [activities]);

    // Синхронизируем ref с состоянием
    useEffect(() => {
        periodsRef.current = periods;
    }, [periods]);

    const loadData = useCallback(async (token, userId) => {
        setLoading(true);
        setError(null);
        try {
            // 1. Сначала загружаем активности
            const activitiesData = await getActivities(token, userId);
            setActivities(activitiesData);

            // 2. Затем загружаем периоды для полученных активностей
            const periodsData = await getAllActivityPeriods(token, userId, activitiesData);
            setPeriods(periodsData);

        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Нажатие на карточку
    const actCard_Click = (activityId) => {
        console.log('Выбрана активность с ID:', activityId);
    };

    // Получение одной активности из массива полученных
    const getActivity = (activityId) => {
        if (!activities || !Array.isArray(activities))
            return null;
        return activities.find(activity => activity.id === activityId) || null;
    };

    const startActivity = async (token, activityId) => {
        try {
            await manageActivity(token, activityId, true);
            emit('activityChanged'); // Обновляем данные
            console.log('Запуск активности с ID:', activityId);
        } catch (err) {
            throw err;
        }
    };

    const stopActivity = async (token, activityId) => {
        try {
            await manageActivity(token, activityId, false);
            emit('activityChanged'); // Обновляем данные
            console.log('Остановка активности с ID:', activityId);
        } catch (err) {
            throw err;
        }
    };

    // Получение времени старта текущего отслеживания активности
    const getActivityStartTime = (activityId) => {
        if (!activityId || !periods || !periods[activityId])
            return null;

        const activePeriod = periods[activityId].find(
            period => period.StopTime === null
        );

        return activePeriod?.StartTime || null;
    };

    //Архивация активности
    const archiveActivity = async (token, activityId) => {
        try {
            await manageArchiveActivity(token, activityId, true);
            emit('activityChanged'); // Обновляем данные
            console.log('Архивирование активности с ID:', activityId);
        } catch (err) {
            throw err;
        }
    };

    //Восстановление активности
    const unarchiveActivity = async (token, activityId) => {
        try {
            await manageArchiveActivity(token, activityId, false);
            emit('activityChanged'); // Обновляем данные
            console.log('Восстановление активности с ID:', activityId);
        } catch (err) {
            throw err;
        }
    };

    //Удаление активности
    const deleteActivity = async (token, activityId) => {
        try {
            await DeleteActivity(token, activityId);
            emit('activityChanged'); // Обновляем данные
            console.log('Удалена активность с ID:', activityId);
        } catch (err) {
            throw err;
        }
    };

    return {
        activities,
        periods,
        loading,
        error,
        loadData,
        actCard_Click,
        startActivity,
        stopActivity,
        getActivityStartTime,
        archiveActivity,
        unarchiveActivity,
        deleteActivity
    };
};