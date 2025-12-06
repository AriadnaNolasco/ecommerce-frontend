'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function SalesChart({ data, type }: { data: any[], type: 'line' | 'bar' }) {
  if (type === 'line') {
    return (
      <div className="h-64 bg-white p-4 rounded-xl border">
        <h4 className="text-xs font-bold uppercase text-gray-500 mb-4">Ventas (7 días)</h4>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tick={{fontSize: 10}} />
            <YAxis tick={{fontSize: 10}} />
            <Tooltip />
            <Line type="monotone" dataKey="sales" stroke="#000" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }
  return (
    <div className="h-64 bg-white p-4 rounded-xl border">
      <h4 className="text-xs font-bold uppercase text-gray-500 mb-4">Por Categoría</h4>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="category" tick={{fontSize: 10}} />
          <YAxis tick={{fontSize: 10}} />
          <Tooltip />
          <Bar dataKey="total_sales" fill="#000" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}