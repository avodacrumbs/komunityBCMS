
import React from 'react';
import { PieChart, Pie, Tooltip, Cell, Legend } from 'recharts';

const GenderPieChart = ({ data }) => {
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28']; // Colors for pie chart segments

    return (
        <PieChart width={400} height={400}>
            <Pie
                data={data}
                cx={200}
                cy={200}
                labelLine={false}
                label={entry => entry.name}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
            >
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
            </Pie>
            <Tooltip />
            <Legend />
        </PieChart>
    );
};

export default GenderPieChart;