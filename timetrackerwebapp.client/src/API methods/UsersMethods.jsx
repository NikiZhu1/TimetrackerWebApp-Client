import apiClient from './.ApiClient';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

/** Функция для отправки пост-запроса 
 * @param {any} values Логин, пароль для аунтефикации
 * @param {any} isRegistration Регистрация или авторизации
 */
export const AuthenticateUser = async (values, isRegistration) => {
    try {
        let url = '/Auth/login';
        if (isRegistration) 
            url = '/Users';

        const response = await apiClient.post(url, {
            name: values.username,
            password: values.password
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
            return;
        }

        return token;
    }
    catch (error) {
        throw error;
    }
};

/** Получение JWT токена из cookie
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

/** Получение id пользователя из JWT-токена
 * @param {string} token 
 * @returns {*} id пользователя
 */
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
};

/** Получение информации о пользователе
 * @param {string} token JWT-токен
 * @param {string} userId id пользователя
 */
export const getUserInfo = async (token, userId) => {
    try {
        const response = await apiClient.get(`/Users/${userId}`,
            { 
                headers: { Authorization: `Bearer ${token}` } 
            }
        );
        return response.data;
    }
    catch (error) {
        console.error(`Ошибка при получении информациии пользователя #${userId}`, error);
    }
};

/** Изменить имя пользователя */
export const changeUsername = async (token, userId, newName) => {
    try {
        const responce = await apiClient.patch(`/Users/${userId}`,
            {
                userName: newName
            },
            { 
                headers: { Authorization: `Bearer ${token}` } 
            }
        );
        return responce.data;
    } catch (error) {
        console.error(`Ошибка при обновлении имени пользователя #${userId}`, error);
        throw error;
    }
}