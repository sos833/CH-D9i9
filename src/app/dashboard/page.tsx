import AppLayout from '@/components/app-layout';
import PageHeader from '@/components/page-header';
import StatCard from '@/components/stat-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, CreditCard, Activity, Power } from 'lucide-react';
import OverviewChart from './components/overview-chart';

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <PageHeader title="لوحة المعلومات" description="نظرة عامة على أداء متجرك." />
          <div className="ml-auto flex items-center gap-2">
              <Button size="sm" className="h-8 gap-1">
                <Power className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  نهاية اليوم
                </span>
              </Button>
            </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="إجمالي الإيرادات" 
            value="د.ج 45,231.89" 
            icon={<DollarSign />} 
            description="+20.1% عن الشهر الماضي" 
          />
          <StatCard 
            title="إجمالي الديون" 
            value="د.ج 12,870.00" 
            icon={<CreditCard />} 
            description="+180.1% عن الشهر الماضي" 
          />
          <StatCard 
            title="مبيعات اليوم" 
            value="+573" 
            icon={<Activity />} 
            description="+201 since last hour" 
          />
          <StatCard 
            title="عملاء جدد" 
            value="+23" 
            icon={<Users />} 
            description="هذا الشهر" 
          />
        </div>
        <div className="grid gap-4 grid-cols-1">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>نظرة عامة على الأرباح</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <OverviewChart />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
