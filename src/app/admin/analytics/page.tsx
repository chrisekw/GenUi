
'use client';

import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"

const chartData = [
  { date: "2024-07-15", pro: 120, studio: 80, enterprise: 40 },
  { date: "2024-07-16", pro: 130, studio: 85, enterprise: 42 },
  { date: "2024-07-17", pro: 140, studio: 90, enterprise: 45 },
  { date: "2024-07-18", pro: 135, studio: 88, enterprise: 43 },
  { date: "2024-07-19", pro: 150, studio: 95, enterprise: 50 },
  { date: "2024-07-20", pro: 160, studio: 100, enterprise: 55 },
  { date: "2024-07-21", pro: 155, studio: 105, enterprise: 53 },
];

const chartConfig = {
  pro: {
    label: "Pro",
    color: "hsl(var(--chart-1))",
  },
  studio: {
    label: "Studio",
    color: "hsl(var(--chart-2))",
  },
  enterprise: {
    label: "Enterprise",
    color: "hsl(var(--chart-3))",
  },
}

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-8">
        <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground">A detailed breakdown of your application's performance.</p>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Subscriptions Over Time</CardTitle>
                <CardDescription>Daily count of active subscriptions per plan.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[400px] w-full">
                <LineChart
                    accessibilityLayer
                    data={chartData}
                    margin={{
                    left: 12,
                    right: 12,
                    }}
                >
                    <CartesianGrid vertical={false} />
                    <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" />}
                    />
                    <Line
                        dataKey="pro"
                        type="natural"
                        stroke="var(--color-pro)"
                        strokeWidth={2}
                        dot={false}
                    />
                    <Line
                        dataKey="studio"
                        type="natural"
                        stroke="var(--color-studio)"
                        strokeWidth={2}
                        dot={false}
                    />
                    <Line
                        dataKey="enterprise"
                        type="natural"
                        stroke="var(--color-enterprise)"
                        strokeWidth={2}
                        dot={false}
                    />
                     <ChartLegend content={<ChartLegendContent />} />
                </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    </div>
  );
}
