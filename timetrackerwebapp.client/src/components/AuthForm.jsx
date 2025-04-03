import { Button, Typography, Divider, Form } from 'antd';
import { Link } from 'react-router-dom';
import LoginPasswordInput from './LoginPasswwordInput.jsx';

const { Title } = Typography;

/**
 * Компонент формы авторизации/регистрации
 * @param {Object} props Свойства компонента.
 * @param {string} props.title Заголовок формы.
 * @param {Function} props.onFinish Функция, вызываемая при отправке формы.
 * @param {string} props.buttonText Текст кнопки.
 * @param {string} props.linkText Текст ссылки.
 * @param {string} props.linkTo Путь ссылки.
 */
function AuthForm({ title, onFinish, buttonText, linkText, linkTo }) {
    return (
        <Form
            name="auth-form"
            initialValues={{ remember: true }}
            onFinish={onFinish}>

            <Title style={{ textAlign: 'center' }} level={3}>{title}</Title>

            <LoginPasswordInput/>

            <Form.Item>
                <Button block type="primary" htmlType="submit">
                    {buttonText}
                </Button>
            </Form.Item>

            <Link to={linkTo}>{linkText}</Link>

            <Divider plain>или</Divider>

            <Form.Item style={{ margin: '0' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <Button block disabled>
                        Продолжить c Telegram
                    </Button>
                    <span className="telegram-description">Больше возможностей, продолжив с помощью Telegram</span>
                </div>
            </Form.Item>

        </Form>
    );
}

export default AuthForm;
