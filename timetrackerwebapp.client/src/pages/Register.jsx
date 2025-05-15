import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import '@ant-design/v5-patch-for-react-19';

//Методы
import { useUsers } from '../useUsers.jsx';

//Компоненты
import AuthForm from '../components/AuthForm.jsx';

function Register() {
    const navigate = useNavigate(); // Хук для навигации между страницами
    const { loading, registerUser } = useUsers();

    //Регистрация
    const onFinish = async (values) => {
            try{
                await registerUser(values);
                // Перенаправляем на страницу пользователя
                navigate('/dashboard/activities');
    
                message.success('Успешная регистрация!');
            }
            catch (error) {
                message.error('Ошибка регистрации. Попробуйте позже');
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
                    title="Регистрация" 
                    onFinish={onFinish}
                    buttonText="Зарегестрироваться" 
                    linkText="Уже есть аккаунь? Войти" 
                    linkTo="/"
                    loading={loading}/> 
            </div> 
        </div>
    );
}

export default Register;
