import React, { useEffect, useState, useCallback, useRef } from 'react';
import * as api from './methods/ProjectsMethods.jsx';
import { emit, subscribe } from './event.jsx';

export const useProjects = () => {
    const [singleProject, setSingleProject] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const projectsRef = useRef(projects);
    const singleProjectRef = useRef(singleProject);

    // Синхронизируем ref с состоянием
    useEffect(() => {
        projectsRef.current = projects;
    }, [projects]);

    // Синхронизируем ref с состоянием
    useEffect(() => {
        singleProjectRef.current = singleProject;
    }, [singleProject]);
    
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

    //Проверяет, состоит ли пользователь в указанном проекте
    const checkUserInProject = async (token, userId, projectId) => {
        if (!token || !userId || !projectId) {
          throw new Error('Необходимы токен, ID пользователя и ID проекта');
        }
        
        setLoading(true);
        setError(null);
        try {
          // 1. Получаем все проекты пользователя
          const userProjects = await api.getUserProjectInfo(token, userId);
          
          // 2. Ищем нужный проект
          const projectRelation = userProjects.find(p => p.projectId === Number(projectId));
          
          return {
            isMember: !!projectRelation,
            isCreator: projectRelation ? projectRelation.isCreator : false
          };
        } catch (error) {
            setError(error);
            console.error('Ошибка при проверке участия пользователя в проекте:', error);
            throw error;
        } finally {
            setLoading(false);
        }
      };

    //Получение информации по одному проекту
    const getSingleProjectInfo = async (token, projectId) => {
        setLoading(true);
        setError(null);
        try {
            // 1. Получаем основную информацию о проекте
            const projectDetails = await api.getProjectDetails(token, projectId);
            
            // 2. Параллельно получаем участников и активности
            const [members, activities] = await Promise.all([
            api.getProjectMembers(token, projectId),
            api.getProjectActivities(token, projectId)
            ]);

            // 3. Формируем итоговый объект
            const fullProjectInfo = {
            ...projectDetails,
            members,
            activities
            };

            console.log('Полная информация о проекте:', fullProjectInfo);
            setSingleProject(fullProjectInfo);
            return fullProjectInfo;
        }
        catch (err) {
            console.error(`Ошибка при получении информации о проекте ${projectId}:`, error);
            setError(error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Созданние проекта
    const createProject = async (token, name) => {
        setLoading(true);
        setError(null);
        try {
            await api.CreateProject(token, name);
            emit('projectChanged'); // Обновляем данные
            console.log('Добавлен проект ', name);
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Присоединение в проект
    const joinToProject = async (token, projectKey) => {
        setLoading(true);
        setError(null);
        try {
            await api.AddUserToProject(token, projectKey);
            emit('projectChanged'); // Обновляем данные
            console.log('Присоединение к проекту', projectKey);
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Добавление активности в проект
    const addActivityToProject = async (token, projectId, activityId) => {
        setLoading(true);
        setError(null);
        try {
            await api.AddActivityToProject(token, projectId, activityId);
            emit('activityChanged'); // Обновляем данные
            console.log('Добавление активности ', activityId, ' в проект ', projectId);
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    //Архивация проекта
    const archiveProject = async (token, projectId) => {
        try {
            await api.ManageArchiveProject(token, projectId, true);
            emit('projectChanged'); // Обновляем данные
            console.log('Архивирование проекта с ID:', projectId);
        } catch (err) {
            throw err;
        }
    };

    //Изменение названия проекта
    const updateProjectName = async (token, projectId, newProjectName) => {
        try {
            await api.UpdateProjectName(token, projectId, newProjectName);
            // emit('projectChanged'); // Обновляем данные
            console.log('Обновление названия проекта с ID:', projectId, 'на новое: ', newProjectName);
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

    //Удаление проекта
    const deleteProject = async (token, projectId) => {
        setLoading(true);
        setError(null);
        try {
            await api.DeleteProject(token, projectId);
            emit('projectChanged'); // Обновляем данные
            console.log('Удален проект с ID:', projectId);
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    //Удаление участника из проекта
    const deleteUserFromProject = async (token, projectId, userId) => {
        setLoading(true);
        setError(null);
        try {
            await api.DeleteUserFromProject(token, projectId, userId);
            emit('projectChanged'); // Обновляем данные
            console.log('Удален пользователь ', userId, ' из проекта ', projectId);
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        projects,
        singleProject,
        loading,
        error,
        loadData,
        checkUserInProject,
        getSingleProjectInfo,
        createProject,
        updateProjectName,
        joinToProject,
        addActivityToProject,
        archiveProject,
        deleteProject,
        deleteUserFromProject
    };
};