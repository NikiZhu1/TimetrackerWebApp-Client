import React, { useEffect, useState, useCallback, useRef } from 'react';
import { emit, subscribe } from './event.jsx';
import { message, Avatar, Tooltip } from 'antd';

//Методы
import { GetJWT, GetUserIdFromJWT, getUserInfo } from './methods/UsersMethods.jsx'; 

export const useUsers = () => {
    const [user, setUser] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const userRef = useRef(user);

    // Синхронизируем ref с состоянием
    useEffect(() => {
        userRef.current = user;
    }, [user]);

    const loadData = useCallback(async (token, userId) => {
        setLoading(true);
        setError(null);
        try {
            const userData = await getUserInfo(token, userId);
            setUser(userData);
            console.log("Пользователь: ", userData)
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);

const getColorFromString = (str, id) => {
    if (!str || typeof str !== 'string') return '#000000';
    
    const firstChar = str.charCodeAt(0) || 0;
    const noise = id * 37; // Произвольный множитель для "шума"
    
    const r = (firstChar + noise) % 256;
    const g = (firstChar * 3 + noise) % 256;
    const b = (firstChar * 4 + noise) % 256;
    
    const toHex = (n) => n.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const UserAvatar = ({ name, id }) => {

    const safeName = typeof name === 'string' ? name : '??';
    // Берём первые 2 буквы и переводим в верхний регистр
    const letters = safeName.slice(0, 2).toUpperCase();

    return (
        // <Tooltip title={`@${safeName}`} placement="top">
            <Avatar
                size={30}
                style={{ 
                    backgroundColor: getColorFromString(safeName, id), 
                    verticalAlign: 'middle',
                    fontSize: '14px' 
                }}>
                {letters}
            </Avatar>
        // </Tooltip>
    );
};

    return {
        user,
        loading,
        error,
        loadData,
        UserAvatar
    };
};