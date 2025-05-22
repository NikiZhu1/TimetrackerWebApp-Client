import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Avatar } from 'antd';
import Cookies from 'js-cookie';

//Методы
import * as api from '../API methods/UsersMethods.jsx'; 

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
            const userData = await api.getUserInfo(token, userId);
            setUser(userData);
            console.log("Пользователь: ", userData)
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);

const registerUser = async (values) => {
    setLoading(true);
    setError(null);
    try {
        const token = await api.AuthenticateUser(values, true);

        // Сохраняем токен в cookies
        setTokenToCookie(token);

        console.log('Регистрация: ', values);
    }
    catch (error) {
        console.error(`Ошибка регистрации: `, error);
        throw error;
    }
    finally {
        setLoading(false);
    }
}

const loginUser = async (values) => {
    setLoading(true);
    setError(null);
    try {
        const token = await api.AuthenticateUser(values, false);

        // Сохраняем токен в cookies
        setTokenToCookie(token);
        
        console.log('Вход: ', values);
    }
    catch (error) {
        console.error(`Ошибка входа: `, error);
        throw error;
    }
    finally {
        setLoading(false);
    }
}

const setTokenToCookie = (token) => {
    Cookies.set('token', token, { expires: 1, secure: true, sameSite: 'Strict' });
}

const changeUsername = async (userId, newUserName) => {
    setLoading(true);
    setError(null);

    const token = api.GetJWT();
    const userIdToken = api.GetUserIdFromJWT(token);

    if (!token || !userIdToken) {
        if (!token) message.warning('Сначала войдите в систему');
        if (!userId) Cookies.remove('token');
        navigate('/');
        return;
    }
    
    try {
        const responce = await api.changeUsername(token, userId, newUserName);
        return responce;
    }
    catch (error) {
        setError(error);
        throw error;
    }
    finally {
        setLoading(false);
    }
}

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

const UserAvatar = ({ name, id, size, fontSize }) => {

    const safeName = typeof name === 'string' ? name : '??';
    // Берём первые 2 буквы и переводим в верхний регистр
    const letters = safeName.slice(0, 2).toUpperCase();

    return (
        // <Tooltip title={`@${safeName}`} placement="top">
            <Avatar
                size={size}
                style={{ 
                    backgroundColor: getColorFromString(safeName, id), 
                    verticalAlign: 'middle',
                    fontSize: fontSize
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
        registerUser,
        loginUser,
        loadData,
        changeUsername,
        UserAvatar
    };
};