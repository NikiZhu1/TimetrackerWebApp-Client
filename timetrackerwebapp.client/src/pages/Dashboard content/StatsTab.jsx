import React, { useEffect, useState } from 'react';
import { Button, message, DatePicker, Select, Flex, ConfigProvider } from 'antd';
import { PlusOutlined, LinkOutlined } from '@ant-design/icons';
import '@ant-design/v5-patch-for-react-19';
import Cookies from 'js-cookie';
import { subscribe } from '../../event.jsx';
import locale from 'antd/locale/ru_RU';
import 'dayjs/locale/ru'; 
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween); // Подключаем плагин для isBetween

//Методы
import { GetJWT, GetUserIdFromJWT } from '../../API methods/UsersMethods.jsx';
import { useActivities } from '../../hooks/useActivities.jsx';
import { useIsPortrait } from '../../hooks/useIsPortain.jsx';

//Компоненты
import StackedBarChart from '../../components/StackedBarChart.jsx';
import ActivityPieChart from '../../components/PieChart.jsx';
import Empty from '../../components/Empty.jsx';

function StatsTab() {
    const isPortrait = useIsPortrait();

    const { getUserStats, loadData} = useActivities();
    const [periodType, setPeriodType] = useState('week');
    const [selectActivity, setSelectActivity] = useState('all');

    const [dateRange, setDateRange] = useState([]);
    const [filteredPeriods, setFilteredPeriods] = useState([]);
    
    const [periods, setPeriods] = useState([]);
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        const token = GetJWT();
        const userId = GetUserIdFromJWT(token);

        if (!token || !userId) {
            if (!token) message.warning('Сначала войдите в систему');
            if (!userId) Cookies.remove('token');
            navigate('/');
            return;
        }
        
        const fetchData = async () => {
            const periodsData = await getUserStats(token, userId);
            setPeriods(periodsData);

            const activitiesData = await loadData(token, userId);
            setActivities(activitiesData);
        };

        fetchData();
    }, []);

    // Фильтрация периодов при изменении дат или типа периода
    useEffect(() => {
    
    // Фильтр для дня
    if (periodType === 'day') {
        const today = dayjs().startOf('day');
        const filtered = periods.filter(period => {
            return dayjs(period.startTime).isSame(today, 'day');
        });
        setFilteredPeriods(filtered);
        return;
    }

    if (periodType === 'week') {
        const startOfWeek = dayjs().startOf('week').add(1, 'day'); // Начало недели (понедельник)
        const endOfWeek = dayjs().endOf('week').add(1, 'day'); // Конец недели (воскресенье)
        
        const filtered = periods.filter(period => {
            const periodDate = dayjs(period.startTime);
            return periodDate.isBetween(startOfWeek, endOfWeek, null, '[]');
        });
        setFilteredPeriods(filtered);
        console.log(filtered);
        return;
    }

    if (periodType === 'month') {
        const startOfMonth = dayjs().startOf('month');
        const endOfMonth = dayjs().endOf('month');
        
        const filtered = periods.filter(period => {
            const periodDate = dayjs(period.startTime);
            return periodDate.isBetween(startOfMonth, endOfMonth, null, '[]');
        });
        setFilteredPeriods(filtered);
        console.log(filtered);
        return;
    }
        
    if (periodType !== 'custom') {
        setFilteredPeriods(periods);
        return;
    }

    if (dateRange && dateRange.length === 2) {
        const [start, end] = dateRange;
        const filtered = periods.filter(period => {
            const periodDate = dayjs(period.startTime);
            const startDate = dayjs(start);
            const endDate = dayjs(end);
            return periodDate.isBetween(startDate, endDate, null, '[]');
        });
        setFilteredPeriods(filtered);
        console.log("фильтрованные", filtered);
    } else {
        setFilteredPeriods([]); // Сбрасываем, если диапазон не выбран
    }
    }, [dateRange, periodType, periods]);

    // Проверка на пустые данные
    const isEmptyData = filteredPeriods.length === 0;

    return (
        <Flex vertical>
            <Flex wrap gap='8px' style={{paddingTop: '16px', paddingBottom: '16px'}}>
                <Flex align='center' gap='8px'>
                    {!isPortrait && <p style={{fontSize: '20px', whiteSpace: 'nowrap'}}>Статистика по</p>}
                    <Select
                    size= {isPortrait && 'large'}
                    defaultValue='all'
                    style={{ width: '170px' }}
                    onChange={setSelectActivity}
                    options={[
                        { value: 'all', label: 'Все активности' },
                        ...activities.map(activity => ({
                            value: activity.id,
                            label: activity.name
                        })),
                    ]}
                    />
                </Flex>
                <Flex align='center' gap='8px'>
                    {!isPortrait && <p style={{fontSize: '20px', whiteSpace: 'nowrap'}}>за</p>}
                    <Select
                    size= {isPortrait && 'large'}
                    defaultValue='week'
                    style={{ width: 140 }}
                    onChange={setPeriodType}
                    options={[
                        { value: 'day', label: `сегодня (${dayjs(new Date()).format('DD.MM')})` },
                        { value: 'week', label: `эту неделю` },
                        { value: 'month', label: `месяц (${dayjs(new Date()).format('MMMM')})` },
                        { value: 'custom', label: 'своё время...' },
                    ]}
                    />
                </Flex>
                
                {periodType === 'custom' && (
                    <Flex gap='8px'>
                        <p style={{fontSize: '20px', whiteSpace: 'nowrap'}}>Выберите период:</p>
                        <ConfigProvider 
                            locale={locale}>
                            <DatePicker.RangePicker 
                                format="DD.MM.YYYY" 
                                onChange={setDateRange}
                                disabledDate={(current) => current && current > dayjs().endOf('day')}/>
                        </ConfigProvider>
                    </Flex>
                )}
            </Flex>
            {isEmptyData 
            ? (<Empty textZeroActivities='Похоже у вас нет данных об отслеживании активностей за данный период' showButton={false}/>)
            : (<Flex wrap gap='16px' style={{width: '100%'}}>
                {selectActivity === 'all' && (periodType === 'month' || periodType === 'week' || periodType === 'day') &&
                (
                    <Flex vertical align='center' style={{width: '100%', padding: '16px', borderRadius: '12px',backgroundColor: 'rgb(180 180 180 / 20%)'}}>
                        <p style={{fontSize: '18px', fontWeight: '500'}}>{periodType === 'day' ? `Время активностей по часам за ${dayjs(new Date()).locale('ru-ru').format('DD MMMM')}` : `Время активностей за эту неделю`}</p>
                        <StackedBarChart periods={filteredPeriods} activities={activities} periodType={periodType}/>
                    </Flex>
                )}
                {selectActivity !== 'all' && (periodType === 'month' || periodType === 'week' || periodType === 'day') &&
                (
                    <Flex vertical align='center' style={{width: '100%', padding: '16px', borderRadius: '12px',backgroundColor: 'rgb(180 180 180 / 20%)'}}>
                        <p style={{fontSize: '18px', fontWeight: '500'}}>{periodType === 'day' ? `Время активности "${activities.find(activity => activity.id === selectActivity).name}" по часам за ${dayjs(new Date()).locale('ru-ru').format('DD MMMM')}` : `Время активности "${activities.find(activity => activity.id === selectActivity).name}" за эту неделю`}</p>
                        <StackedBarChart periods={filteredPeriods.filter(period => period.activityId == selectActivity)} activities={activities.filter(activity => activity.id == selectActivity)} periodType={periodType}/>
                    </Flex>
                )}
                {selectActivity === 'all' && 
                (
                    <Flex vertical align='center' style={{width: '100%', padding: '16px', borderRadius: '12px',backgroundColor: 'rgb(180 180 180 / 20%)'}}>
                        <p style={{fontSize: '18px', fontWeight: '500'}}>{`Топ активностей`}</p>
                        <ActivityPieChart periods={filteredPeriods} activities={activities}/>
                    </Flex>
                )}
                {selectActivity !== 'all' && 
                (
                    <Flex vertical align='center' style={{width: '100%', padding: '16px', borderRadius: '12px',backgroundColor: 'rgb(180 180 180 / 20%)'}}>
                        <p style={{fontSize: '18px', fontWeight: '500'}}>{`Топ активностей`}</p>
                        <ActivityPieChart periods={filteredPeriods.filter(period => period.activityId == selectActivity)} activities={activities.filter(activity => activity.id == selectActivity)}/>
                    </Flex>
                )}
            </Flex>)}
            
        </Flex>
        
    );
    
}

export default StatsTab;
