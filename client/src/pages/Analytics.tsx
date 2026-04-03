import React, { useMemo, useState } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { Loader2 } from 'lucide-react';

const COLORS = ['#EA580C', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#3B82F6', '#EC4899', '#14B8A6'];

export default function Analytics() {
  const [dayRange, setDayRange] = useState(30);
  
  const summaryQuery = trpc.analytics.summary.useQuery();
  const byDayQuery = trpc.analytics.byDay.useQuery({ days: dayRange });
  const byHourQuery = trpc.analytics.byHour.useQuery();
  const byProductQuery = trpc.analytics.byProduct.useQuery();
  const byDayOfWeekQuery = trpc.analytics.byDayOfWeek.useQuery();

  const isLoading = summaryQuery.isLoading || byDayQuery.isLoading || byHourQuery.isLoading || byProductQuery.isLoading || byDayOfWeekQuery.isLoading;

  // Format data for charts
  const dayData = useMemo(() => {
    return (byDayQuery.data || []).map(d => ({
      date: new Date(d.day).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
      sent: d.sent,
      failed: d.failed,
      total: d.sent + d.failed,
    }));
  }, [byDayQuery.data]);

  const hourData = useMemo(() => {
    const hourLabels = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);
    const dataMap = new Map<number, { sent: number; failed: number }>();
    
    (byHourQuery.data || []).forEach(h => {
      dataMap.set(h.hour, { sent: h.sent, failed: h.failed });
    });

    return hourLabels.map((label, hour) => ({
      hour: label,
      sent: dataMap.get(hour)?.sent ?? 0,
      failed: dataMap.get(hour)?.failed ?? 0,
    }));
  }, [byHourQuery.data]);

  const productData = useMemo(() => {
    return (byProductQuery.data || [])
      .filter(p => p.linkTitle)
      .slice(0, 8)
      .map(p => {
        const title = p.linkTitle || 'Produto';
        return {
          name: title.length > 20 ? title.substring(0, 17) + '...' : title,
          sent: p.sent,
          failed: p.failed,
        };
      });
  }, [byProductQuery.data]);


  const dayOfWeekData = useMemo(() => {
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
    return (byDayOfWeekQuery.data || []).map(d => ({
      name: dayNames[d.dayOfWeek] || 'Unknown',
      sent: d.sent,
      failed: d.failed,
    }));
  }, [byDayOfWeekQuery.data]);

  const successRateData = useMemo(() => {
    const summary = summaryQuery.data;
    if (!summary) return [];
    return [
      { name: 'Enviados', value: summary.totalSent },
      { name: 'Falhados', value: summary.totalFailed },
    ];
  }, [summaryQuery.data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-shopee-orange" />
      </div>
    );
  }

  const summary = summaryQuery.data;

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Análise de Desempenho</h1>
          <p className="text-gray-600 mt-1">Acompanhe o desempenho dos seus envios</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Enviados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-shopee-orange">{summary?.totalSent ?? 0}</div>
            <p className="text-xs text-gray-500 mt-1">mensagens com sucesso</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Falhados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">{summary?.totalFailed ?? 0}</div>
            <p className="text-xs text-gray-500 mt-1">mensagens com erro</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Taxa de Sucesso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">{summary?.successRate ?? 0}%</div>
            <p className="text-xs text-gray-500 mt-1">de taxa de sucesso</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Média/Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">{summary?.averagePerDay ?? 0}</div>
            <p className="text-xs text-gray-500 mt-1">últimos 30 dias</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Envios por Dia */}
        <Card>
          <CardHeader>
            <CardTitle>Envios por Dia</CardTitle>
            <CardDescription>Últimos {dayRange} dias</CardDescription>
            <div className="flex gap-2 mt-4">
              <Button
                variant={dayRange === 7 ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDayRange(7)}
                className={dayRange === 7 ? 'bg-shopee-orange hover:bg-shopee-orange/90' : ''}
              >
                7 dias
              </Button>
              <Button
                variant={dayRange === 30 ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDayRange(30)}
                className={dayRange === 30 ? 'bg-shopee-orange hover:bg-shopee-orange/90' : ''}
              >
                30 dias
              </Button>
              <Button
                variant={dayRange === 90 ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDayRange(90)}
                className={dayRange === 90 ? 'bg-shopee-orange hover:bg-shopee-orange/90' : ''}
              >
                90 dias
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dayData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sent" stroke="#EA580C" strokeWidth={2} name="Enviados" />
                <Line type="monotone" dataKey="failed" stroke="#EF4444" strokeWidth={2} name="Falhados" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Taxa de Sucesso */}
        <Card>
          <CardHeader>
            <CardTitle>Taxa de Sucesso</CardTitle>
            <CardDescription>Proporção de envios bem-sucedidos</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={successRateData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="#EA580C" />
                  <Cell fill="#EF4444" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Melhor Horário */}
        <Card>
          <CardHeader>
            <CardTitle>Envios por Hora</CardTitle>
            <CardDescription>Qual hora tem mais envios</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sent" fill="#EA580C" name="Enviados" />
                <Bar dataKey="failed" fill="#EF4444" name="Falhados" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Desempenho por Dia da Semana */}
        <Card>
          <CardHeader>
            <CardTitle>Desempenho por Dia</CardTitle>
            <CardDescription>Envios por dia da semana</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dayOfWeekData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sent" fill="#EA580C" name="Enviados" />
                <Bar dataKey="failed" fill="#EF4444" name="Falhados" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Produtos Mais Enviados */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Produtos Mais Enviados</CardTitle>
            <CardDescription>Top 8 produtos por número de envios</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip />
                <Legend />
                <Bar dataKey="sent" fill="#EA580C" name="Enviados" />
                <Bar dataKey="failed" fill="#EF4444" name="Falhados" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
