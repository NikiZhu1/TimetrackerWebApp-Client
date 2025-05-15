import React, { act, useEffect, useState } from 'react';
import { Button, message, Typography, Flex, Image, Modal } from 'antd';
import Icon, { EditOutlined, EllipsisOutlined, CaretRightOutlined, PauseOutlined, FolderOpenOutlined, ExclamationCircleFilled, PlusOutlined, PieChartOutlined, ClockCircleOutlined, FolderOutlined, TeamOutlined, DeleteOutlined } from '@ant-design/icons';
import '@ant-design/v5-patch-for-react-19';

const { confirm } = Modal;

//Компоненты
import { showAddNewActivity } from './AddNewActivityModal.jsx';

//Методы
import { useActivities } from '../hooks/useActivities.jsx';

function Empty({
    hasActivities = false,
    textZeroActivities,
    textWhenAllActivityIsBusy,
    showButton = true,
    onClickAction
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
                    ? textWhenAllActivityIsBusy
                    : textZeroActivities
                }
            </Typography.Text>

            {showButton && (<Button type="primary" onClick={() => onClickAction()}>Создать активность</Button>)}
        </Flex>
    );
}

export default Empty;
