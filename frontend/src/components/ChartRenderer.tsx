'use client';

import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartData {
  name: string;
  value: number;
}

interface ChartConfig {
  type: 'bar' | 'line' | 'pie';
  title: string;
  data: ChartData[];
  description?: string;
}

interface ChartRendererProps {
  config: ChartConfig;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function ChartRenderer({ config }: ChartRendererProps) {
  const { type, title, data, description } = config;

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Bar dataKey="value" name="数量" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Line type="monotone" dataKey="value" name="数量" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return <div className="text-gray-400">不支持的图表类型</div>;
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 mt-4">
      <h4 className="text-lg font-semibold text-white mb-2">{title}</h4>
      {renderChart()}
      {description && <p className="text-gray-400 text-sm mt-2">{description}</p>}
    </div>
  );
}
