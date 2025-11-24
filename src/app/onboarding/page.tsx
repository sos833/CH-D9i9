'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/icons';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Here you would typically save the data
    // For now, we'll just redirect to the dashboard
    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
      <Card className="w-full max-w-lg">
        <form onSubmit={handleSubmit}>
          <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <Logo className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl">مرحبًا بك في دفتر دي زاد</CardTitle>
            <CardDescription>
              لنقم بإعداد حسابك. أدخل المعلومات الأولية لمتجرك.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="store-name">اسم المحل</Label>
                <Input
                  id="store-name"
                  placeholder="مثال: متجر السعادة"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="initial-revenue">الإيرادات الأولية</Label>
                  <Input
                    id="initial-revenue"
                    type="number"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="initial-debt">إجمالي الدين الأولي</Label>
                  <Input
                    id="initial-debt"
                    type="number"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              بدء الاستخدام
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
