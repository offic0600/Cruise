'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useI18n } from '@/i18n/useI18n';

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
const AXIS = '#94a3b8';
const GRID = '#e2e8f0';
const TOOLTIP_BG = 'rgba(255,255,255,0.96)';
const TOOLTIP_TEXT = '#0f172a';

export default function ChartRenderer({ config }: ChartRendererProps) {
  const { t } = useI18n();
  const { type, title, data, description } = config;

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
              <XAxis dataKey="name" stroke={AXIS} />
              <YAxis stroke={AXIS} />
              <Tooltip
                contentStyle={{ backgroundColor: TOOLTIP_BG, border: '1px solid #e2e8f0', borderRadius: '16px', color: TOOLTIP_TEXT }}
                labelStyle={{ color: TOOLTIP_TEXT, fontWeight: 600 }}
              />
              <Legend />
              <Bar dataKey="value" name={t('common.quantity')} fill="#2563eb" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
              <XAxis dataKey="name" stroke={AXIS} />
              <YAxis stroke={AXIS} />
              <Tooltip
                contentStyle={{ backgroundColor: TOOLTIP_BG, border: '1px solid #e2e8f0', borderRadius: '16px', color: TOOLTIP_TEXT }}
                labelStyle={{ color: TOOLTIP_TEXT, fontWeight: 600 }}
              />
              <Legend />
              <Line type="monotone" dataKey="value" name={t('common.quantity')} stroke="#06b6d4" strokeWidth={3} dot={{ fill: '#06b6d4' }} />
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
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: TOOLTIP_BG, border: '1px solid #e2e8f0', borderRadius: '16px', color: TOOLTIP_TEXT }}
                labelStyle={{ color: TOOLTIP_TEXT, fontWeight: 600 }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      default:
        return <div className="text-ink-400">{t('common.unsupportedChart')}</div>;
    }
  };

  return (
    <div className="panel-card mt-4 p-4">
      <h4 className="mb-2 text-lg font-semibold text-ink-900">{title}</h4>
      {renderChart()}
      {description && <p className="mt-2 text-sm text-ink-700">{description}</p>}
    </div>
  );
}
