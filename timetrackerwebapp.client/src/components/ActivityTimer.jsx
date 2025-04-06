import React, { useState, useEffect } from 'react';
import { Typography } from 'antd';

const { Text } = Typography;

const ActivityTimer = ({ startTime, style = {} }) => {
    const [elapsedTime, setElapsedTime] = useState(0);

    useEffect(() => {
        if (!startTime) return;

        // Вычисляем изначальное прошедшее время (если активность уже начата)
        const initialElapsed = Math.floor((new Date() - new Date(startTime)) / 1000);
        setElapsedTime(initialElapsed);

        // Запускаем таймер
        const timer = setInterval(() => {
            setElapsedTime(prev => prev + 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [startTime]);

    if (!startTime) return <Text type="secondary">Не активно</Text>;

    // Форматируем секунды в HH:MM:SS
    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        return [
            hours.toString().padStart(2, '0'),
            minutes.toString().padStart(2, '0'),
            secs.toString().padStart(2, '0')
        ].join(':');
    };

    return (
        <Text strong
            style={{
                fontSize: '20px',
                ...style // переопределение из пропсов
            }}>
            {formatTime(elapsedTime)}
        </Text>
    );
};

export default ActivityTimer;