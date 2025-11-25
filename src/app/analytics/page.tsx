
"use client";

import AppLayout from "@/components/app-layout";
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OverviewChart from "@/app/dashboard/components/overview-chart";
import ProductSalesChart from "./components/product-sales-chart";
import * as React from "react";

export default function AnalyticsPage() {
    const [isClient, setIsClient] = React.useState(false);

    React.useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return (
            <AppLayout>
                <PageHeader title="التحاليل" description="نظرة معمقة على أداء متجرك." />
                <div className="h-96 w-full rounded-lg border flex items-center justify-center mt-4">
                    <p>جار تحميل التحاليل...</p>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <PageHeader title="التحاليل" description="نظرة معمقة على أداء متجرك." />

            <div className="grid gap-4 grid-cols-1 mt-4">
                <Tabs defaultValue="month" className="space-y-4">
                    <div className="flex items-center">
                        <TabsList>
                            <TabsTrigger value="day">اليوم</TabsTrigger>
                            <TabsTrigger value="week">الأسبوع</TabsTrigger>
                            <TabsTrigger value="month">الشهر</TabsTrigger>
                        </TabsList>
                    </div>
                    <TabsContent value="day" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>نظرة عامة على أرباح اليوم</CardTitle>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <OverviewChart viewMode="day" />
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="week" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>نظرة عامة على أرباح الأسبوع</CardTitle>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <OverviewChart viewMode="week" />
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="month" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>نظرة عامة على أرباح الشهر</CardTitle>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <OverviewChart viewMode="month" />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                <Card>
                    <CardHeader>
                        <CardTitle>المنتجات الأكثر مبيعًا</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ProductSalesChart />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
