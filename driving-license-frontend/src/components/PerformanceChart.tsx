import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

interface PerformanceChartProps {
  data: Array<{ period: string; averageScore: number; passRate: number }>;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="period" />
        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
        <Tooltip />
        <Legend />
        <Bar yAxisId="left" dataKey="averageScore" fill="#8884d8" name="Average Score" />
        <Bar yAxisId="right" dataKey="passRate" fill="#82ca9d" name="Pass Rate (%)" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default PerformanceChart;
