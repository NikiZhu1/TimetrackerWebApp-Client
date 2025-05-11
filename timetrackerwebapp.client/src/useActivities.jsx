import React, { useEffect, useState, useCallback, useRef } from 'react';
import * as api from './methods/ActivitiesMethods';
import { emit, subscribe } from './event.jsx';

export const useActivities = () => {
    const [activities, setActivities] = useState([]);
    const [periods, setPeriods] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [countStatus1, setCountStatus1] = useState(0);
    const [countStatus2, setCountStatus2] = useState(0);
    const [countStatus3, setCountStatus3] = useState(0);

    const activitiesRef = useRef(activities);
    const periodsRef = useRef(periods);

    // Синхронизируем ref с состоянием
    useEffect(() => {
        activitiesRef.current = activities;
        const activitiesWithStatus1 = activities.filter(activity => activity.statusId === 1);
        setCountStatus1(activitiesWithStatus1 ? activitiesWithStatus1.length : 0);

        const activitiesWithStatus2 = activities.filter(activity => activity.statusId === 2);
        setCountStatus2(activitiesWithStatus2 ? activitiesWithStatus2.length : 0);

        const activitiesWithStatus3 = activities.filter(activity => activity.statusId === 3);
        setCountStatus3(activitiesWithStatus3 ? activitiesWithStatus3.length : 0);
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
            const activitiesData = await api.getAllActivities(token, userId);
            setActivities(activitiesData);

            // 2. Затем загружаем периоды для полученных активностей
            const periodsData = await api.getAllActivityPeriods(token, activitiesData);
            setPeriods(periodsData);

            
            return activitiesData;
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadPeriodsActivities = async (token, activities) => {
        setLoading(true);
        setError(null);
        try {
            // Загружаем периоды для полученных активностей
            const periodsData = await api.getAllActivityPeriods(token, activities);
            setPeriods(periodsData);

        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

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

    // Получение статистики всех активностей пользователя
    const getUserStats = async (token, userId, date1 = null, date2 = null) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.getUserStats(token, userId, date1, date2)
            return response;
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }

    // Добавление новой активности
    const addActivity = async (token, userId, name) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.AddActivity(token, userId, name);
            emit('activityChanged'); // Обновляем данные
            console.log('Добавлена активность ', name);
            return response;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Старт отслеживания активности
    const startActivity = async (token, activityId) => {
        try {
            await api.ManageTrackerActivity(token, activityId, true);
            emit('activityChanged'); // Обновляем данные
            console.log('Запуск активности с ID:', activityId);
        } catch (err) {
            throw err;
        }
    };

    // Остановка отслеживания активности
    const stopActivity = async (token, activityId) => {
        try {
            await api.ManageTrackerActivity(token, activityId, false);
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
            period => period.stopTime === null
        );

        return activePeriod?.startTime || null;
    };

    //Архивация активности
    const archiveActivity = async (token, activityId) => {
        try {
            await api.ManageArchiveActivity(token, activityId, true);
            emit('activityChanged'); // Обновляем данные
            console.log('Архивирование активности с ID:', activityId);
        } catch (err) {
            throw err;
        }
    };

    //Восстановление активности
    const unarchiveActivity = async (token, activityId) => {
        try {
            await api.ManageArchiveActivity(token, activityId, false);
            emit('activityChanged'); // Обновляем данные
            console.log('Восстановление активности с ID:', activityId);
        } catch (err) {
            throw err;
        }
    };

    //Удаление активности
    const deleteActivity = async (token, activityId) => {
        try {
            await api.DeleteActivity(token, activityId);
            emit('activityChanged'); // Обновляем данные
            console.log('Удалена активность с ID:', activityId);
        } catch (err) {
            throw err;
        }
    };

    return {
        activities,
        countStatus1,
        countStatus2,
        countStatus3,
        periods,
        loading,
        error,
        loadData,
        loadPeriodsActivities,
        addActivity,
        actCard_Click,
        startActivity,
        stopActivity,
        getActivityStartTime,
        getUserStats,
        archiveActivity,
        unarchiveActivity,
        deleteActivity
    };
};