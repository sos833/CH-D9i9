
"use client";

import AppLayout from "@/components/app-layout";
import { SimpleCalculator } from "@/components/calculator";
import { Card } from "@/components/ui/card";

export default function CalculatorPage() {
  return (
    <AppLayout>
      <div className="flex flex-1 items-center justify-center">
        <Card className="w-full max-w-sm">
          <SimpleCalculator />
        </Card>
      </div>
    </AppLayout>
  );
}
