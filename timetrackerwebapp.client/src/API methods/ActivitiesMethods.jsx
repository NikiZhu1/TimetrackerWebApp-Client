import axios from 'axios';

// Получение активностей
export const getAllActivities = async (token, userId) => {
    if (!token || !userId) return [];

    try {
        const response = await axios.get(`http://localhost:8080/api/Users/${userId}/activities?onlyArchived=false&onlyInProcces=false&onlyActive=false`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const activities = response.data;

        // Получаем список projectId для каждой активности
        const activitiesWithProject = await Promise.all(
            activities.map(async (activity) => {
                const projectData = await getActivityProject(token, activity.id);
                const projectId = projectData.length > 0 ? projectData[0].projectId : null;
                return { ...activity, projectId };
            })
        );

        // Сортируем по ID (если нужно)
        const sortedActivities = activitiesWithProject.sort((a, b) => a.id - b.id);

        console.log("Полученные активности: ", sortedActivities);
        return sortedActivities;
    } catch (error) {
        console.error('Ошибка при получении активностей:', error);
        throw error;
    }
};

export const getActivityProject = async (token, activityId) => {
    try {
        // Получаем список проектов, в которых есть эта активность
        const projectResponse = await axios.get(`http://localhost:8080/api/Activities/${activityId}/projects`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const projectLinks = projectResponse.data;

        // Если проект найден — добавляем projectId в объект активности
        // if (projectLinks.length > 0) {
        //     return projectLinks[0].projectId;
        // }

        return projectLinks;
    }
    catch (error) {
        console.error(`Ошибка при получении проекта активности #${activityId}`, error);
        throw error;
    }
};

export const getActivity = async (token, activityId) => {
    try {
        // Получаем саму активность
        const response = await axios.get(`http://localhost:8080/api/Activities/${activityId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const activity = response.data;

        // Получаем список проектов, в которых есть эта активность
        const projectResponse = await axios.get(`http://localhost:8080/api/Activities/${activityId}/projects`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const projectLinks = projectResponse.data;

        // Если проект найден — добавляем projectId в объект активности
        if (projectLinks.length > 0) {
            activity.projectId = projectLinks[0].projectId;
        }

        return activity;
    }
    catch (error) {
        console.error(`Ошибка при получении активности #${activityId}`, error);
        throw error;
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

        const periods = response.data;
        return periods;

    } catch (error) {
        console.error('Ошибка при получении периодов активности:', error);
        throw error;
    }
};

// Получение всех периодов по всем активностям
export const getAllActivityPeriods = async (token, activities) => {
    if (!token || !activities?.length) return {};

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
    }
};

// Форматирование времени
export const formatActivityTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Плдучение статистки активности
export const getActivityStats = async (token, activityId, date1 = null, date2 = null) => {
    if (!token || !activityId) return;

    try {
        const response = await axios.get(
            `http://localhost:8080/api/ActivityPeriods?activityId=${activityId}${date1 && (`&data1=${date1}`)}${date2 && (`&data2=${date2}`)}`,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        const periods = response.data?.ActivityPeriods || [];
        return periods;

    } catch (error) {
        console.error(`Ошибка при получении статистики у activityId ${activityId}:`, error);
        throw error;
    }
};

// Получение статистики всех активностей пользователя
export const getUserStats = async (token, userId, date1 = null, date2 = null) => {
    if (!token || !userId) return;

    try {
        // Формируем базовый URL
        let url = `http://localhost:8080/api/ActivityPeriods?userId=${userId}`;
        
        // Добавляем даты, если они указаны
        if (date1) {
            url += `&date1=${date1}`;
        }
        if (date2) {
            url += `&date2=${date2}`;
        }

        const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }}
        );

        const periods = response.data;
        return periods;

    } catch (error) {
        console.error(`Ошибка при получении статистики у activityId ${activityId}:`, error);
        throw error;
    }
};

// Нажатие на карточку
export const actCard_Click = (activityId) => {
    console.log('Выбрана активность с ID:', activityId);
};

// Добавление активности
export const AddActivity = async (token, userId, name) => {
    try {
        const response = await axios.post('http://localhost:8080/api/Activities',
            {
                userId: userId,
                activityName: name
            },
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        return response.data;
    } catch (error) {
        console.error(`Ошибка при добавлении активности:`, error);
        throw error;
    }
}

// Общая функция для управления трекером активности
export const ManageTrackerActivity = async (token, activityId, isStarted) => {
    try {
        const response = await axios.post('http://localhost:8080/api/ActivityPeriods',
            {
                activityId: activityId,
                isStarted: isStarted
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
export const ManageArchiveActivity = async (token, activityId, isArchived) => {
    try {
        const response = await axios.patch(`http://localhost:8080/api/Activities/${activityId}`,
            {
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

// Изменение названия активности
export const UpdateActivityName = async (token, activityId, newActivityName) => {
    try {
        const response = await axios.patch(`http://localhost:8080/api/Activities/${activityId}`,
            {
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

// Удаление активности
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
