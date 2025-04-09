import React, { act, useEffect, useState } from 'react';
import { Button, message, Typography, Flex, Image, Modal } from 'antd';
import Icon, { EditOutlined, EllipsisOutlined, CaretRightOutlined, PauseOutlined, FolderOpenOutlined, ExclamationCircleFilled, PlusOutlined, PieChartOutlined, ClockCircleOutlined, FolderOutlined, TeamOutlined, DeleteOutlined } from '@ant-design/icons';
import '@ant-design/v5-patch-for-react-19';

const { confirm } = Modal;

//Компоненты
import { showAddNewActivity } from './AddNewActivityModal.jsx';

//Методы
import { useActivities } from '../useActivities.jsx';

function Empty({
    hasActivities
}) {

    const { startActivity, stopActivity, addActivity, countStatus1, countStatus2, countStatus3 } = useActivities();

    return (
        <Flex vertical align='center' gap='12px'
            style={{
                background: '#f1f1f1',
                borderRadius: '8px',
                padding: '24px'
            }}>
            <Image
                preview={false}
                height='60px'
                src="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
            />
            <Typography.Text>
                {hasActivities
                    ? "Похоже, вы уже отслеживаете все доступные активности или переместили их в архив"
                    : "Здесь пока пусто. Создайте свою первую активность и начните отслеживать продуктивность!"
                }
            </Typography.Text>

            <Button type="primary" onClick={() => showAddNewActivity()}>Создать активность</Button>
        </Flex>
    );
}

export default Empty;
