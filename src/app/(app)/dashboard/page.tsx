
"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAppData } from "@/contexts/AppDataContext";
import { Archive, Truck, UtensilsCrossed, Users, AlertTriangle } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { format, subDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function DashboardPage() {
  const { stockItems, deliveries, consumptionRecords, studentCount, isLoadingData } = useAppData();

  const totalStockQuantity = stockItems.reduce((sum, item) => sum + item.quantity, 0);
  const expiringSoonCount = stockItems.filter(item => {
    try {
      const expiry = parseISO(item.expiryDate);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      return expiry <= thirtyDaysFromNow && expiry >= new Date();
    } catch (e) { return false; }
  }).length;

  const recentDeliveriesCount = deliveries.filter(d => {
    try {
      return parseISO(d.date) >= subDays(new Date(), 7);
    } catch(e) { return false; }
  }).length;
  
  const recentConsumptionCount = consumptionRecords.filter(c => {
     try {
      return parseISO(c.date) >= subDays(new Date(), 7);
    } catch(e) { return false; }
  }).length;


  // Prepare data for stock chart
  const stockChartData = stockItems.slice(0, 10).map(item => ({
    name: item.name.length > 15 ? item.name.substring(0,12) + "..." : item.name,
    quantidade: item.quantity,
  }));

  const stockChartConfig = {
    quantidade: {
      label: "Quantidade",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  // Prepare data for consumption chart (last 7 days)
  const consumptionChartDataMap = new Map<string, number>();
  const last7Days = Array.from({ length: 7 }).map((_, i) => format(subDays(new Date(), i), 'dd/MM', { locale: ptBR })).reverse();
  
  last7Days.forEach(day => consumptionChartDataMap.set(day, 0));

  consumptionRecords.forEach(record => {
    try {
      const recordDate = format(parseISO(record.date), 'dd/MM', { locale: ptBR });
      if (consumptionChartDataMap.has(recordDate)) {
        const totalConsumedInRecord = record.items.reduce((sum, item) => sum + item.quantityConsumed, 0);
        consumptionChartDataMap.set(recordDate, (consumptionChartDataMap.get(recordDate) || 0) + totalConsumedInRecord);
      }
    } catch (e) { console.warn("Error parsing consumption date", e); }
  });
  
  const consumptionChartData = last7Days.map(day => ({
    date: day,
    consumo: consumptionChartDataMap.get(day) || 0,
  }));

  const consumptionChartConfig = {
    consumo: {
      label: "Consumo Total (unidades)",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;


  if (isLoadingData) {
    return <div className="flex h-full items-center justify-center"><p>Carregando dashboard...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Itens em Estoque</CardTitle>
            <Archive className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockItems.length}</div>
            <p className="text-xs text-muted-foreground">Total de {totalStockQuantity} unidades</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencendo em 30 dias</CardTitle>
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expiringSoonCount}</div>
            <p className="text-xs text-muted-foreground">Itens próximos ao vencimento</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entregas (últimos 7d)</CardTitle>
            <Truck className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentDeliveriesCount}</div>
            <p className="text-xs text-muted-foreground">Entregas recebidas recentemente</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alunos Atendidos</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentCount}</div>
            <p className="text-xs text-muted-foreground">Total de alunos cadastrados</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Visão Geral do Estoque (Top 10 Itens)</CardTitle>
            <CardDescription>Quantidade dos 10 principais itens em estoque.</CardDescription>
          </CardHeader>
          <CardContent>
            {stockItems.length > 0 ? (
              <ChartContainer config={stockChartConfig} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stockChartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} angle={-30} textAnchor="end" height={50} />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8}/>
                    <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent hideLabel />} />
                    <Bar dataKey="quantidade" fill="var(--color-quantidade)" radius={4} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (<p className="text-muted-foreground text-center p-8">Sem dados de estoque para exibir.</p>)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Consumo Diário (Últimos 7 Dias)</CardTitle>
            <CardDescription>Total de unidades consumidas por dia.</CardDescription>
          </CardHeader>
          <CardContent>
             {consumptionRecords.length > 0 ? (
              <ChartContainer config={consumptionChartConfig} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={consumptionChartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8}/>
                    <YAxis tickLine={false} axisLine={false} tickMargin={8}/>
                    <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="consumo" fill="var(--color-consumo)" radius={4} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
             ) : (<p className="text-muted-foreground text-center p-8">Sem dados de consumo para exibir.</p>)}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
