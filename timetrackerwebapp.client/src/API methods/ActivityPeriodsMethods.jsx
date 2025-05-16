import apiClient from './.ApiClient';

// Изменение времени периода активности
export const EditActivityPeriod = async (token, activityPeriodId, newStartTime, newStopTime) => {
    try {
        const response = await apiClient.patch(`/ActivityPeriods/${activityPeriodId}`,
            {
                newStartTime: newStartTime,
                newStopTime: newStopTime
            },
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        return response.data;
    } catch (error) {
        console.error(`Ошибка при изменнии периода активности:`, error);
        throw error;
    }
};

// Удаление периода активности
export const DeleteActivityPeriod = async (token, activityPeriodId) => {
    try {
        const response = await apiClient.delete(`/ActivityPeriods/${activityPeriodId}`,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        return response.data;
    } catch (error) {
        console.error(`Ошибка при удаении периода активности:`, error);
        throw error;
    }
};
