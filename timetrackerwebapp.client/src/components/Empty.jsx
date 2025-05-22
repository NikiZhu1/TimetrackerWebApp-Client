import React, { act, useEffect, useState } from 'react';
import { Button, message, Typography, Flex, Image } from 'antd';
import Icon, { EditOutlined, EllipsisOutlined, CaretRightOutlined, PauseOutlined, FolderOpenOutlined, ExclamationCircleFilled, PlusOutlined, PieChartOutlined, ClockCircleOutlined, FolderOutlined, TeamOutlined, DeleteOutlined } from '@ant-design/icons';
import '@ant-design/v5-patch-for-react-19';

function Empty({
    hasActivities = false,
    textZeroActivities,
    textWhenAllActivityIsBusy,
    showButton = true,
    onClickAction,
    buttonText = 'Создать активность',
    showButton2 = false,
    onClickAction2,
    buttonText2
}) {
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

            <Flex gap='8px'>
                {showButton && (<Button type="primary" onClick={() => onClickAction()}>{buttonText}</Button>)}
                {showButton2 && (<Button color="default" style={{background: 'transparent'}} variant="dashed" onClick={() => onClickAction2()}>{buttonText2}</Button>)}
            </Flex>
        </Flex>
    );
}

export default Empty;
