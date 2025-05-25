import apiClient from './.ApiClient';
import 'dayjs/locale/ru'; 
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);

const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    
    if (totalSeconds < 600) {
      return `${minutes}м ${seconds}с`;
    }
    return `${hours && (`${hours}ч`)} ${minutes}м ${seconds}с`;
  };

function sumTotalTime(stats) {
    const totalSeconds = stats.reduce((acc, item) => {
        const [h, m, s] = item.totalTime.split(':');
        const [sec, ms = 0] = s.split('.');
        const dur = dayjs.duration({
            hours: +h,
            minutes: +m,
            seconds: +sec
        });
        return acc + dur.asSeconds();
    }, 0);

    return formatTime(totalSeconds);
}

// Получение активностей
export const getAllActivities = async (token, userId) => {
    if (!token || !userId) return [];

    try {
        const response = await apiClient.get(`/Users/${userId}/activities?onlyArchived=false&onlyInProcces=false&onlyActive=false`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const activities = response.data;
        const today = dayjs().format('YYYY-MM-DD')

        // Получаем список projectId для каждой активности
        const activitiesWithProject = await Promise.all(
        activities.map(async (activity) => {
            const [projectData, stats] = await Promise.all([
            getActivityProject(token, activity.id),
            getActivityStats(token, activity.id, today, today)
            ]);

            console.log(`Stats for activity ${activity.id}:`, stats);

            const projectId = projectData.length > 0 ? projectData[0].projectId : null;
            const dayStats = sumTotalTime(stats);

            return { ...activity, projectId, dayStats };
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
        const projectResponse = await apiClient.get(`/Activities/${activityId}/projects`, {
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
        const response = await apiClient.get(`/Activities/${activityId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const activity = response.data;

        // Получаем список проектов, в которых есть эта активность
        const projectResponse = await apiClient.get(`/Activities/${activityId}/projects`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const projectLinks = projectResponse.data;

        // Если проект найден — добавляем projectId в объект активности
        if (projectLinks.length > 0) {
            activity.projectId = projectLinks[0].projectId;
        }

        const today = dayjs().format('YYYY-MM-DD');
        const stats = await getActivityStats(token, activityId, today, today);
        activity.dayStats = sumTotalTime(stats);

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
        const response = await apiClient.get(
            `/ActivityPeriods?activityId=${activityId}`,
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

// Получение статистки активности
export const getActivityStats = async (token, activityId, date1 = null, date2 = null) => {
    if (!token || !activityId) return;

    try {
        // Формируем базовый URL
        let url = `/ActivityPeriods?activityId=${activityId}`;
        
        // Добавляем даты, если они указаны
        if (date1) {
            url += `&data1=${date1}`;
        }
        if (date2) {
            url += `&data2=${date2}`;
        }

        const response = await apiClient.get(url,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        return response.data;

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
        let url = `/ActivityPeriods?userId=${userId}`;
        
        // Добавляем даты, если они указаны
        if (date1) {
            url += `&date1=${date1}`;
        }
        if (date2) {
            url += `&date2=${date2}`;
        }

        const response = await apiClient.get(url, {
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
        const response = await apiClient.post('/Activities',
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
        const response = await apiClient.post('/ActivityPeriods',
            {
                activityId: activityId,
                isStarted: isStarted
            },
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        return response.data;
    } catch (error) {
        console.error(`Ошибка при ${isStarted ? 'старте' : 'остановке'} активности:`, error);
        throw error;
    }
};

// Общая функция для изменения архивации активности
export const ManageArchiveActivity = async (token, activityId, isArchived) => {
    try {
        const response = await apiClient.patch(`/Activities/${activityId}`,
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
        const response = await apiClient.patch(`/Activities/${activityId}`,
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
        const response = await apiClient.delete(`/Activities/${activityId}`,
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
