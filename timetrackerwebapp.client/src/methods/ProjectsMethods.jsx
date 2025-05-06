import axios from 'axios';
import {getActivity} from './ActivitiesMethods';
import { getUserInfo } from './UsersMethods';

// 1 получаем инфу в каких проектах состоит пользователь http://localhost:8080/api/Users/{userID}/projects
// [
//     {
//       "id": 1,
//       "userId": 1,
//       "projectId": 1,
//       "isCreator": true
//     },
//     {
//       "id": 2,
//       "userId": 1,
//       "projectId": 2,
//       "isCreator": true
//     },
//     {
//       "id": 3,
//       "userId": 1,
//       "projectId": 3,
//       "isCreator": true
//     }
// ]
// 2 получаем циклом инфу про проект http://localhost:8080/api/Projects/{projectId}
// {
//     "projectId": 2,
//     "projectName": "test",
//     "projectKey": "GStMpeyM",
//     "creationDate": "2025-04-11 00:00:00",
//     "finishDate": null
// }
// 3 получаем id участников в проекте http://localhost:8080/api/Projects/{projectId}/users
// [
//     {
//       "id": 2,
//       "userId": 1,
//       "projectId": 2,
//       "isCreator": true
//     },
//     {
//       "id": 4,
//       "userId": 2,
//       "projectId": 2,
//       "isCreator": false
//     }
// ]
// 3.1 получаем циклом участников http://localhost:8080/api/Users/{userId}
// {
//     "id": 1,
//     "chatId": 0,
//     "name": "nikizhu"
// }
// 4 получаем id акивностей в проекте http://localhost:8080/api/Projects/{projectId}/activities
// [
//     {
//       "id": 1,
//       "activityId": 1,
//       "projectId": 2
//     }
// ]
// 4.1 получаем циклом активности http://localhost:8080/api/Activities/{activityId}
// {
//     "id": 1,
//     "name": "Работа",
//     "activeFrom": "2025-04-10 00:00:00",
//     "userId": 1,
//     "statusId": 1
// }

// Получение полной информации по всем проектам пользователя
export const getFullUserProjectsInfo = async (token, userId) => {
    if (!token || !userId) return [];
  
    try {
      // 1. Получаем проекты пользователя
      const userProjects = await getUserProjectInfo(token, userId);
  
      // 2. Для каждого проекта получаем полную информацию
      const projectsData = await Promise.all(
        userProjects.map(userProject => 
          getSingleProjectFullInfo(token, userProject)
        )
      );
  
      console.log("Полная информация по всем проектам:", projectsData);
      return projectsData;
    } catch (error) {
      console.error('Ошибка при получении информации о проектах:', error);
      throw error;
    }
  };
  
// Получение полной информации по одному проекту
export const getSingleProjectFullInfo = async (token, userProject) => {
    const [projectInfo, members, activities] = await Promise.all([
      getProjectDetails(token, userProject.projectId),
      getProjectMembers(token, userProject.projectId),
      getProjectActivities(token, userProject.projectId)
    ]);
    
    return {
      ...projectInfo,
      isCreator: userProject.isCreator,
      members,
      activities
    };
};

// Получение информации в каких проектах состоит пользователь
export const getUserProjectInfo = async (token, userId) => {
    if (!token || !userId) return [];

    try {
        const response = await axios.get(`http://localhost:8080/api/Users/${userId}/projects`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        console.log("Проекты пользователя: ", response.data);
        return response.data;
    } catch (error) {
        console.error('Ошибка при получении проектов пользователя:', error);
        throw error;
        return [];
    }
};

// Получение деталей проекта
export const getProjectDetails = async (token, projectId) => {
    try {
        const response = await axios.get(`http://localhost:8080/api/Projects/${projectId}`, 
            { 
                headers: { Authorization: `Bearer ${token}` } 
            }
        );
        return response.data;
    }
    catch (error) {
        console.error(`Ошибка при получении деталей проекта #${projectId}`, error);
        throw error;
    }
    
  };

// Получение участников проекта
export const getProjectMembers = async (token, projectId) => {
    try {
        // 1. Получаем связи пользователей с проектом
        const response = await axios.get(`http://localhost:8080/api/Projects/${projectId}/users`,
            { 
                headers: { Authorization: `Bearer ${token}` } 
            }
        );
        
        // 2. Получаем информацию о каждом участнике
        const members = await Promise.all(
        response.data.map(async (projectUser) => {
            const userInfo = await getUserInfo(token, projectUser.userId);
            return {
            ...userInfo,
            isCreator: projectUser.isCreator
            };
        })
        );
        
        return members;
    }
    catch (error) {
        console.error(`Ошибка при получении участников проекта #${projectId}`, error);
        throw error;
    }
    
  };

// Получение активностей проекта
export const getProjectActivities = async (token, projectId) => {
    try {
        // 1. Получаем связи активностей с проектом
        const response = await axios.get(`http://localhost:8080/api/Projects/${projectId}/activities`,
        { 
            headers: { Authorization: `Bearer ${token}` },
            validateStatus: status => (status >= 200 && status < 300) || status === 404
        }
    );

        // Обрабатываем 404 явно
        if (response.status === 404) {
            return [];
        }
    
        // 2. Получаем информацию о каждой активности
        const activities = await Promise.all(
        response.data.map(projectActivity => 
            getActivity(token, projectActivity.activityId)
        )
    );
    
    return activities;
    }
    catch (error) {
        console.error(`Ошибка при получении активностей проекта #${projectId}`, error);
    }
  };

// Создание проекта
export const CreateProject = async (token, name) => {
    try {
        const response = await axios.post('http://localhost:8080/api/Projects',
            {
                projectName: name
            },
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        //Возвращаем ключ доступа
        return response.data;
    } catch (error) {
        console.error(`Ошибка при создании проекта:`, error);
        throw error;
    }
};

// Добавить пользователя в проект
export const AddUserToProject = async (token, projectKey) => {
    try {
        const response = await axios.post('http://localhost:8080/api/Users/project',
            {
                accessKey: projectKey
            },
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        //Возвращаем связь пользователь-проект
        return response.data;
    } catch (error) {
        console.error(`Ошибка при присоединению к проекту:`, error);
        throw error;
    }
}

// Удалить пользователя из проекта
export const DeleteUserFromProject = async (token, projectId, userId) => {
    try {
        const response = await axios.delete(`http://localhost:8080/api/Projects/${projectId}/user/${userId}`,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        //Возвращаем связь пользователь-проект
        return response.data;
    } catch (error) {
        console.error(`Ошибка при присоединению к проекту:`, error);
        throw error;
    }
}

// Общая функция для изменения архивации проекта
export const ManageArchiveProject = async (token, projectId, isArchived) => {
    try {
        const response = await axios.patch(`http://localhost:8080/api/Projects/${projectId}`,
            {
                closeProject: isArchived
            },
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        return response.data;
    } catch (error) {
        console.error(`Ошибка при ${isArchived ? 'архивации' : 'восстановлении'} проекта:`, error);
        throw error;
    }
};

// Изменения названия активности
export const UpdateProjectName = async (token, projectId, newProjectName) => {
    try {
        const response = await axios.patch(`http://localhost:8080/api/Projects/${projectId}`,
            {
                projectName: newProjectName
            },
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        return response.data;
    } catch (error) {
        console.error(`Ошибка при изменении названия проекта:`, error);
        throw error;
    }
};

// Удаление проекта
export const DeleteProject = async (token, projectId) => {
    try {
        const response = await axios.delete(`http://localhost:8080/api/Projects/${projectId}`,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        return response.data;
    } catch (error) {
        console.error(`Ошибка при удаении проекта:`, error);
        throw error;
    }
};
