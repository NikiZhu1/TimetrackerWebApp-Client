import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import '@ant-design/v5-patch-for-react-19';

//Методы
import { useUsers } from '../useUsers.jsx';

//Компоненты
import AuthForm from '../components/AuthForm.jsx';

function Login() {
    const navigate = useNavigate(); // Хук для навигации между страницами
    const { loading, loginUser } = useUsers();

    //Авторизация
    const onFinish = async (values) => {
        try{
            await loginUser(values, false);
            // Перенаправляем на страницу пользователя
            navigate('/dashboard/activities');

            message.success('Успешный вход!');
        }
        catch (error) {
            message.error('Неверный логин или пароль');
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            flexDirection: 'column'
        }}>
            <div style=
            {{
                width: 340,
                border: '1px solid rgb(50 50 50 / 20%)',
                padding: 24,
                borderRadius: 16,
                display: 'flex',
                flexDirection: 'column'
            }}>
                <AuthForm
                    title="Авторизация"
                    onFinish={onFinish}
                    buttonText="Войти"
                    linkText="Нет аккаунта? Зарегистрироваться"
                    linkTo="/register"
                    loading={loading}/>
            </div>
        </div>
    );
}

export default Login;