import React, { useEffect, useState, useCallback, useRef } from 'react';
import { getActivities, getAllActivityPeriods, ManageArchiveActivity, ManageTrackerActivity, DeleteActivity, AddActivity, getStats } from './methods/ProjectsMethods.jsx';
import { emit, subscribe } from './event.jsx';

export const useProjects = () => {
    const [projects, setProjects] = useState([]);
    const [periods, setPeriods] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const activitiesRef = useRef(projects);
    const periodsRef = useRef(periods);

    // Синхронизируем ref с состоянием
    useEffect(() => {
        activitiesRef.current = projects;
    }, [projects]);

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
            setProjects(activitiesData);

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
        if (!projects || !Array.isArray(projects))
            return null;
        return projects.find(activity => activity.id === activityId) || null;
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
        activities: projects,
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