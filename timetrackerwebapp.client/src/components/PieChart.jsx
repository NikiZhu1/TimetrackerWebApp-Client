import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { Skeleton, Flex, Typography } from 'antd';

ChartJS.register(ArcElement, Tooltip, Legend);

const { Text } = Typography;

const ActivityPieChart = ({ periods, activities, periodType }) => {
  const parseTotalTime = (str) => {
    if (!str) return 0;
    
    const dayMatch = str.match(/^(\d+)\.(\d{2}):(\d{2}):(\d{2})/);
    const timeMatch = str.match(/^(\d{2}):(\d{2}):(\d{2})/);
    
    if (dayMatch) {
      const [, d, h, m, s] = dayMatch.map(Number);
      return ((d * 24 + h) * 3600 + m * 60 + s);
    } else if (timeMatch) {
      const [, h, m, s] = timeMatch.map(Number);
      return h * 3600 + m * 60 + s;
    }
    return 0;
  };

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    
    if (totalSeconds < 600) {
      return `${minutes}м ${seconds}с`;
    }
    return `${hours}ч ${minutes}м`;
  };

  // Подготовка данных для топа активностей
  const prepareTopActivities = () => {
    const activityMap = {};

    periods.forEach(period => {
      if (!period.totalTime) return;
      
      const activityId = period.activityId;
      const activityName = activities.find(a => a.id === activityId)?.name || `Activity ${activityId}`;
      const seconds = parseTotalTime(period.totalTime);
      
      activityMap[activityName] = (activityMap[activityName] || 0) + seconds;
    });

    return Object.entries(activityMap)
      .filter(([_, seconds]) => seconds > 0)
      .sort((a, b) => b[1] - a[1]) // Сортировка по убыванию времени
      .map(([name, seconds], index) => ({
        rank: index + 1,
        name,
        time: seconds,
        formattedTime: formatTime(seconds)
      }));
  };

  const preparePieData = (topActivities) => {
    return {
      labels: topActivities.map(item => item.name),
      datasets: [{
        data: topActivities.map(item => item.time),
        backgroundColor: topActivities.map((_, index) => 
          `hsl(${index * 80 % 360}, 70%, 60%)`),
        borderWidth: 1
      }]
    };
  };

  const topActivities = prepareTopActivities();
  const data = preparePieData(topActivities);

  const options = {
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const seconds = context.raw || 0;
            const totalSeconds = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = totalSeconds > 0 
              ? Math.round(((seconds / totalSeconds) * 100 * 100) / 100)
              : 0;
            
            return `${label}: ${formatTime(seconds)} (${percentage}%)`;
          }
        }
      },
      legend: {
        display: false // Отключаем стандартную легенду
      }
    },
    maintainAspectRatio: false,
    responsive: true
  };

  // Кастомная легенда с топом активностей
  const CustomLegend = () => (
    <Flex vertical gap={8}>
      {topActivities.map((activity) => (
        <Flex key={activity.rank} align="center" justify='center' gap={8}>
          <Text strong style={{ minWidth: '20px', fontSize: '16px' }}>{activity.rank}.</Text>
          <div style={{ 
            width: '12px', 
            height: '12px', 
            backgroundColor: `hsl(${(activity.rank - 1) * 80 % 360}, 70%, 60%)`,
            borderRadius: '2px'
          }} />
          <Text ellipsis style={{ flex: 1, fontSize: '16px' }}>{activity.name}</Text>
          <Text strong style={{fontSize: '16px'}}>{activity.formattedTime}</Text>
        </Flex>
      ))}
    </Flex>
  );

  return data ? (
    <Flex wrap align='center' justify='center' gap='16px' style={{ height: '100%' }}>
      <div style={{height: '250px' }}>
        <Pie data={data} options={options} />
      </div>
      <CustomLegend />
    </Flex>
  ) : <Skeleton active paragraph={{ rows: 4 }} />;
};

export default ActivityPieChart;