import React, { useEffect, useState, useMemo } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import '@ant-design/v5-patch-for-react-19';
import { Skeleton } from 'antd';

ChartJS.register( CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend );

const StackedBarChart = ({ periods, activities, periodType = 'week' }) => {

  // Функция для парсинга времени в секунды
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

  // Форматирование времени для тултипов
  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    
    // Показываем секунды только если время меньше 10 минут
    if (totalSeconds < 600) {
      return `${hours}ч ${minutes}м ${seconds}с`;
    }
    return `${hours}ч ${minutes}м`;
  };

    // Получение имени активности по ID
  const getActivityName = (activityId) => {
    const activity = activities.find(a => a.id === activityId);
    return activity ? activity.name : `Activity ${activityId}`;
  };

  const activityOrder = useMemo(() => {
    const totals = {};
    for (const period of periods) {
      if (!period.totalTime) continue;
      const name = getActivityName(period.activityId);
      totals[name] = (totals[name] || 0) + parseTotalTime(period.totalTime);
    }
    return Object.entries(totals)
      .filter(([_, time]) => time > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);
  }, [periods, activities]);

  const getColor = (activityName) => {
    const index = activityOrder.indexOf(activityName);
    return `hsl(${index * 80 % 360}, 70%, 60%)`;
  };

  // Подготовка данных для недельного отчета
  const prepareWeekData = () => {
    const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    const dataMap = {};

    periods.forEach(period => {
      if (!period.totalTime || !period.startTime) return;

      const date = new Date(period.startTime);
      const dayIndex = (date.getDay() + 6) % 7; // Пн = 0
      const dayName = daysOfWeek[dayIndex];
      const activityName = getActivityName(period.activityId);
      const seconds = parseTotalTime(period.totalTime);

      if (!dataMap[activityName]) dataMap[activityName] = {};
      dataMap[activityName][dayName] = (dataMap[activityName][dayName] || 0) + seconds;
    });

    return {
      labels: daysOfWeek,
      datasets: activityOrder
        .filter(name => dataMap[name])
        .map((name) => ({
          label: name,
          data: daysOfWeek.map(day => dataMap[name][day] || 0),
          backgroundColor: getColor(name),
          stack: 'stack1',
        }))
    };
  };
  
// Подготовка данных для дневного отчета
const prepareDayData = () => {
    const hours = Array.from({ length: 24 }, (_, i) => `${i}`);
    const dataMap = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    periods.forEach(period => {
      if (!period.totalTime || !period.startTime || !period.stopTime) return;

      const startDate = new Date(period.startTime);
      const stopDate = new Date(period.stopTime);
      
      if (startDate < today || startDate >= new Date(today.getTime() + 24 * 60 * 60 * 1000)) {
        return;
      }

      const activityName = getActivityName(period.activityId);
      const totalSeconds = parseTotalTime(period.totalTime);

      let currentHour = startDate.getHours();
      let currentTime = new Date(startDate);
      let remainingSeconds = totalSeconds;

      while (remainingSeconds > 0 && currentTime < stopDate) {
        const hourEnd = new Date(currentTime);
        hourEnd.setHours(currentHour + 1, 0, 0, 0);
        const segmentEnd = new Date(Math.min(
          hourEnd.getTime(), 
          stopDate.getTime(),
          today.getTime() + 24 * 60 * 60 * 1000
        ));
        
        const segmentSeconds = (segmentEnd - currentTime) / 1000;
        
        if (!dataMap[activityName]) dataMap[activityName] = {};
        const hourLabel = `${currentHour}`;
        dataMap[activityName][hourLabel] = (dataMap[activityName][hourLabel] || 0) + segmentSeconds;

        remainingSeconds -= segmentSeconds;
        currentHour++;
        currentTime = segmentEnd;
      }
    });

    return {
      labels: hours,
      datasets: activityOrder
        .filter(name => dataMap[name])
        .map((name, index) => ({
          label: name,
          data: hours.map(hour => Math.min(dataMap[name][hour] || 0, 3600)),
          backgroundColor: getColor(name),
          stack: `stack1`,
        }))
    };
  };

  // Выбор формата данных в зависимости от периода
  const chartData = periodType === 'day' ? prepareDayData() : prepareWeekData();

  const options = {
    plugins: {
      title: {
        display: false,
        text: periodType === 'day' 
          ? 'Время по активностям по часам (минуты)' 
          : 'Время по активностям по дням недели (минуты)'
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            if (context.raw <= 0) return null;
            return `${context.dataset.label}: ${formatTime(context.raw)}`;
          },
          filter: (tooltipItem) => tooltipItem.raw > 0
        }
      },
      legend: {
        display: activityOrder.length === 1
          ? false
          : true,
        position: 'bottom',
        labels: {
          filter: (legendItem, chartData) => {
            const dataset = chartData.datasets[legendItem.datasetIndex];
            return dataset.data.some(value => value > 0.001);
          }
        }
      }
    },
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      x: {
        stacked: true,
        title: {
          display: false,
        },
        grid: { display: false }
      },
      y: {
        stacked: true,
        title: {
          display: false,
        },
        max: periodType === 'day' 
            ? 3600
            : null,
        ticks: {
            stepSize: periodType === 'day' 
            ? 600
            : 3600,
            callback: (value) => {
            // Для дневной диаграммы показываем только минуты
            if (periodType === 'day') {
                return `${Math.round(value / 60)}м`;
            }
            else 
                return `${Math.round(value / 3660)}ч`;
        }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        }
      },
    },
  };

  return chartData ? 
  <div style={{ width: '100%', height: '300px' }}>
    <Bar 
      options={options} 
      data={chartData}/>
  </div> : <Skeleton/>;
};

export default StackedBarChart; 
