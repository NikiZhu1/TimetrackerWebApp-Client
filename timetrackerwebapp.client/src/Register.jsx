import AuthForm from './components/AuthForm.jsx';

function Register() {
    const onFinish = (values) => {
        console.log('Регистрация:', values);
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
                    linkTo="/" /> 
            </div> 
        </div>
    );
}

export default Register;
