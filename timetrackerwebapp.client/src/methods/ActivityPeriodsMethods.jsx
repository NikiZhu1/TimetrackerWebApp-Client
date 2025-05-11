import axios from 'axios';

// Изменение времени периода активности
export const EditActivityPeriod = async (token, activityPeriodId, newStartTime, newStopTime) => {
    try {
        const response = await axios.patch(`http://localhost:8080/api/ActivityPeriods/${activityPeriodId}`,
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
        const response = await axios.delete(`http://localhost:8080/api/ActivityPeriods/${activityPeriodId}`,
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
