import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { message } from 'antd';

/**
 * Функция для отправки пост-запроса 
 * @param {any} values Логин, пароль для аунтефикации
 * @param {any} isRegistration Процесс регистрации или авторизации
 * @param {any} navigate Хук для навигации
 * @returns
 */

export const AuthenticateUser = async (values, isRegistration, navigate) => {
    try {
        console.log(isRegistration ? 'Регистрация:' : 'Вход:', values);

        const response = await axios.post('http://localhost:8080/api/Users', {
            IsNewUser: isRegistration,
            Name: values.username,
            Password: values.password
        });

        //Получаем JWT токен из ответа на авторизацию
        const token = response.data.Token;
        if (!token) {
            throw new Error('Токен отсутствует в ответе сервера');
        }

        //Декодируем JWT токен для получения UserId
        let userId;
        try {
            userId = GetUserIdFromJWT(token);

        } catch (decodeError) {
            console.error('Ошибка при декодировании токена:', decodeError);
            message.error(`Ошибка ${isRegistration ? 'регистрации' : 'аутентификации'}. Попробуйте снова.`);
            return;
        }

        // Сохраняем токен в cookies
        Cookies.set('token', token, { expires: 1, secure: true, sameSite: 'Strict' });

        message.success(isRegistration ? 'Успешная регистрация!' : 'Успешный вход!');
        console.log(`${isRegistration ? 'Зарегистрированный' : 'Авторизованный'} userId:`, userId);

        // Перенаправляем на страницу пользователя
        navigate('/dashboard'); 
    }
    catch (error) {
        console.error(`Ошибка ${isRegistration ? 'регистрации' : 'авторизации'}:`, error);
        message.error(error.response?.data || `Ошибка ${isRegistration ? 'регистрации' : 'авторизации'}`);
    }
};

/**
 * Получение JWT токена из cookie
 * @returns
 */
export const GetJWT = () => {
    const token = Cookies.get('token');

    if (!token) {
        console.error('Ошибка: Токен отсутствует.');
        return null;
    }

    return token;
};

export const GetUserIdFromJWT = (token) => {
    try {
        let userId
        const decoded = jwtDecode(token);
        userId = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];

        if (userId)
            return userId;

    } catch (decodeError) {;
        console.error('Ошибка при декодировании токена:', decodeError);
        return;
    }
}