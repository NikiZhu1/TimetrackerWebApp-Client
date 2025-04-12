import React, { useEffect, useState, useCallback, useRef } from 'react';
import * as api from './methods/ProjectsMethods.jsx';
import { emit, subscribe } from './event.jsx';

export const useProjects = () => {
    const [projects, setProjects] = useState([]);
    const [projectsActivities, setProjectsActivities] = useState({});
    const [projectsMembers, setProjectsMembers] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const projectsRef = useRef(projects);
    const projectsActivitiesRef = useRef(projectsActivities);
    const projectsMembersRef = useRef(projectsMembers);

    // Синхронизируем ref с состоянием
    useEffect(() => {
        projectsRef.current = projects;
    }, [projects]);

    // Синхронизируем ref с состоянием
    useEffect(() => {
        projectsActivitiesRef.current = projectsActivities;
    }, [projectsActivities]);

    // Синхронизируем ref с состоянием
    useEffect(() => {
        projectsMembersRef.current = projectsMembers;
    }, [projectsMembers]);
    
    //Загрузка всех данных
    const loadData = useCallback(async (token, userId) => {
        setLoading(true);
        setError(null);
        try {
            // 1. Сначала загружаем активности
            const projectsData = await api.getFullUserProjectsInfo(token, userId);
            setProjects(projectsData);

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
        projects,
        projectsRef,
        loading,
        error,
        loadData
    };
};