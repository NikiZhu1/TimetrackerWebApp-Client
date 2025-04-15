import React, { useEffect, useState, useCallback, useRef } from 'react';
import { getAllActivities, getAllActivityPeriods, ManageArchiveActivity, ManageTrackerActivity, DeleteActivity, AddActivity, getStats } from './methods/ActivitiesMethods';
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
            const activitiesData = await getAllActivities(token, userId);
            setActivities(activitiesData);

            // 2. Затем загружаем периоды для полученных активностей
            const periodsData = await getAllActivityPeriods(token, activitiesData);
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

    const getActivityStats = async (token, userId, date1 = null, date2 = null) => {
        try {
            getStats(token, userId, date1, date2)
        }
        catch {

        }
    }

    // Добавление новой активности
    const addActivity = async (token, userId, name) => {
        setLoading(true);
        setError(null);
        try {
            await AddActivity(token, userId, name);
            emit('activityChanged'); // Обновляем данные
            console.log('Добавлена активность ', name);
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
            await ManageTrackerActivity(token, activityId, true);
            emit('activityChanged'); // Обновляем данные
            console.log('Запуск активности с ID:', activityId);
        } catch (err) {
            throw err;
        }
    };

    // Остановка отслеживания активности
    const stopActivity = async (token, activityId) => {
        try {
            await ManageTrackerActivity(token, activityId, false);
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
            await ManageArchiveActivity(token, activityId, true);
            emit('activityChanged'); // Обновляем данные
            console.log('Архивирование активности с ID:', activityId);
        } catch (err) {
            throw err;
        }
    };

    //Восстановление активности
    const unarchiveActivity = async (token, activityId) => {
        try {
            await ManageArchiveActivity(token, activityId, false);
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
        countStatus1,
        countStatus2,
        countStatus3,
        periods,
        loading,
        error,
        loadData,
        addActivity,
        actCard_Click,
        startActivity,
        stopActivity,
        getActivityStartTime,
        archiveActivity,
        unarchiveActivity,
        deleteActivity
    };
};