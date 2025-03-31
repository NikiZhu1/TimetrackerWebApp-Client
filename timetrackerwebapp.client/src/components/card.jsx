import { Button, Input, Typography, Divider, Form } from 'antd';
const { Title } = Typography;
import { EyeInvisibleOutlined, EyeTwoTone, UserOutlined, LockOutlined } from '@ant-design/icons';
import React, { useEffect } from 'react';

function InputLogin() {

    return (
        <div>
            <Input
                style={{ width: '300px' }}
                maxLength={50}
                placeholder="Логин"
                prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
            />
        </div>
    );

}

export default InputLogin;