import React, { useEffect, useState } from 'react';
import { Button, ConfigProvider } from 'antd';
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
                        colorText: '#b4b4b4',
                        defaultHoverColor: '#fff',
                        defaultActiveBg: '#282828',
                        defaultBg: '#282828',
                        defaultHoverBg: '#282828',
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
                        ...icon.props?.style
                    }})}
                style={{
                    display: 'flex',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    border: border,
                    transition: 'all 0.3s ease',
                }}>
                {!collapsed && text}
            </Button>
        </ConfigProvider>
    );
}

export default MenuButton;
