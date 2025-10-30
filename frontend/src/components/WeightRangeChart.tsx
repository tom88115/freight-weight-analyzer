import React from 'react';
import { Card } from 'antd';
import ReactECharts from 'echarts-for-react';
import { AnalysisResult } from '../types';

interface WeightRangeChartProps {
  data: AnalysisResult | null;
}

const WeightRangeChart: React.FC<WeightRangeChartProps> = ({ data }) => {
  if (!data || !data.weightRanges.length) {
    return null;
  }

  const barOption = {
    title: {
      text: '各重量段订单数量分布',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    xAxis: {
      type: 'category',
      data: data.weightRanges.map((r) => r.range),
      axisLabel: {
        rotate: 45,
      },
    },
    yAxis: {
      type: 'value',
      name: '订单数量',
    },
    series: [
      {
        name: '订单数量',
        type: 'bar',
        data: data.weightRanges.map((r) => r.count),
        itemStyle: {
          color: '#1890ff',
        },
        label: {
          show: true,
          position: 'top',
        },
      },
    ],
  };

  const pieOption = {
    title: {
      text: '重量段订单占比',
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle',
    },
    series: [
      {
        name: '订单数量',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: '{b}: {d}%',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
          },
        },
        data: data.weightRanges.map((r) => ({
          value: r.count,
          name: r.range,
        })),
      },
    ],
  };

  const costOption = {
    title: {
      text: '各重量段运费统计',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: ['总运费', '平均运费'],
      top: 30,
    },
    xAxis: {
      type: 'category',
      data: data.weightRanges.map((r) => r.range),
      axisLabel: {
        rotate: 45,
      },
    },
    yAxis: [
      {
        type: 'value',
        name: '总运费（元）',
      },
      {
        type: 'value',
        name: '平均运费（元）',
      },
    ],
    series: [
      {
        name: '总运费',
        type: 'bar',
        data: data.weightRanges.map((r) => r.totalCost.toFixed(2)),
        itemStyle: {
          color: '#52c41a',
        },
      },
      {
        name: '平均运费',
        type: 'line',
        yAxisIndex: 1,
        data: data.weightRanges.map((r) => r.averageCost.toFixed(2)),
        itemStyle: {
          color: '#fa8c16',
        },
      },
    ],
  };

  return (
    <>
      <Card style={{ marginTop: 16 }}>
        <ReactECharts option={barOption} style={{ height: '400px' }} />
      </Card>
      <Card style={{ marginTop: 16 }}>
        <ReactECharts option={pieOption} style={{ height: '400px' }} />
      </Card>
      <Card style={{ marginTop: 16 }}>
        <ReactECharts option={costOption} style={{ height: '400px' }} />
      </Card>
    </>
  );
};

export default WeightRangeChart;

