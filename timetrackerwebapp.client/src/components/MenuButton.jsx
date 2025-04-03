import React, { useEffect, useState } from 'react';
import { Button, ConfigProvider } from 'antd';
import Icon, { SettingOutlined } from '@ant-design/icons';
import '@ant-design/v5-patch-for-react-19';

function MenuButton({
    collapsed,
    text,
    icon,
    onClick,
    href = null,
    border})
{
    return (
        <ConfigProvider
            theme={{
                components: {
                    Button: {
                        colorText: '#b4b4b4', // текст по умолчанию
                        defaultHoverColor: '#fff', // Тёмный текст при наведении
                        defaultActiveBg: '#282828', // Тёмный фон при нажатии
                        defaultBg: '#282828', // Фон по умолчанию
                        defaultHoverBg: '#282828', // Фон при наведении
                        paddingInline: 12
                    },
                },
            }}>
            <Button
                block
                onClick={onClick}
                href={href}
                icon={React.cloneElement(icon, {
                    style: {
                        fontSize: '16px',
                        ...icon.props?.style // Сохраняем существующие стили иконки
                    }})}
                style={{
                    display: 'flex',
                    justifyContent: collapsed ? 'center' : 'flex-start', // Динамическое выравнивание,
                    border: border,
                    transition: 'all 0.3s ease', // Плавная анимация 
                }}>
                {!collapsed && text}
            </Button>
        </ConfigProvider>
    );
}

export default MenuButton;
