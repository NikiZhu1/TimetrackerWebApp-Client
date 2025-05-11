import React, { useEffect, useState, useCallback, useRef } from 'react';
import * as api from './methods/ActivityPeriodsMethods';
import { emit, subscribe } from './event.jsx';

export const useActivityPeriods = () => {
    // const [activities, setActivities] = useState([]);
    // const [periods, setPeriods] = useState({});
    // const [loading, setLoading] = useState(false);
    // const [error, setError] = useState(null);

    // const activitiesRef = useRef(activities);
    // const periodsRef = useRef(periods);

    // // Синхронизируем ref с состоянием
    // useEffect(() => {
    //     activitiesRef.current = activities;
    // }, [activities]);

    // // Синхронизируем ref с состоянием
    // useEffect(() => {
    //     periodsRef.current = periods;
    // }, [periods]);

    //Изменение периода активности
    const editActivityPeriod = async (token, activityPeriodId, newStartTime, newStopTime) => {
        try {
            await api.EditActivityPeriod(token, activityPeriodId, newStartTime, newStopTime);
            emit('activityPeriodsChanged'); // Обновляем данные
            console.log('Изменение периода активности с ID:', activityPeriodId);
        } catch (err) {
            throw err;
        }
    };

    //Удаление периода активности
    const deleteActivityPeriod = async (token, activityPeriodId) => {
        try {
            await api.DeleteActivityPeriod(token, activityPeriodId);
            emit('activityPeriodsChanged'); // Обновляем данные
            console.log('Удален период активности с ID:', activityPeriodId);
        } catch (err) {
            throw err;
        }
    };

    return {
        editActivityPeriod,
        deleteActivityPeriod
    };
};