
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/icons';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/app-context';
import * as React from 'react';
import { useToast } from '@/hooks/use-toast';
import { FinanceBackground } from '@/components/ui/finance-background';

export default function OnboardingPage() {
  const router = useRouter();
  const { setStoreSettings } = useApp();
  const { toast } = useToast();
  const [storeName, setStoreName] = React.useState('');
  const [initialCash, setInitialCash] = React.useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const cashAmount = parseFloat(initialCash) || 0;

    if (!storeName.trim()) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "الرجاء إدخال اسم المحل.",
      });
      return;
    }
    
    await setStoreSettings({
      storeName: storeName,
      initialCash: cashAmount,
      initialSetupDone: true,
    });
    
    toast({
      title: "تم الإعداد بنجاح!",
      description: `مرحباً بك في ${storeName}.`,
    });

    router.push('/dashboard');
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4">
      
      {/* استدعاء الخلفية المتحركة */}
      <FinanceBackground />

      {/* بطاقة التسجيل (بتأثير الزجاج) */}
      <form onSubmit={handleSubmit} className="relative z-10 w-full max-w-md overflow-hidden rounded-xl border border-white/10 bg-black/40 backdrop-blur-md shadow-2xl transition-all">
        
        {/* رأس البطاقة */}
        <div className="flex flex-col items-center justify-center space-y-3 border-b border-white/10 bg-white/5 p-8 text-center">
          <div className="rounded-full bg-emerald-500/20 p-3 ring-1 ring-emerald-500/50">
            <Logo className="h-12 w-12 text-emerald-500" />
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold tracking-tight text-white">
              مرحبًا بك في دفتر دي زاد
            </h3>
            <p className="text-sm text-slate-400">
             لنقم بإعداد حسابك. أدخل تفاصيل متجرك للبدء.
            </p>
          </div>
        </div>

        {/* نموذج التسجيل */}
        <div className="p-8 space-y-6" dir="rtl">
          <div className="space-y-2">
            <Label htmlFor="store-name" className="text-white">اسم المتجر</Label>
            <Input 
              id="store-name" 
              placeholder="مثال: متجر السعادة" 
              required
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20 h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="initial-cash" className="text-white">صندوق النقد الأولي (لاكاس)</Label>
            <Input 
              id="initial-cash" 
              type="number" 
              placeholder="0.00" 
              value={initialCash}
              onChange={(e) => setInitialCash(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20 h-11"
            />
             <p className="text-xs text-slate-400 pr-1">
                أدخل المبلغ النقدي الموجود حاليًا في صندوقك. اتركه فارغًا إذا كان صفرًا.
              </p>
          </div>

          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 shadow-lg shadow-emerald-900/20">
            بدء الاستخدام
          </Button>

        </div>
        
        {/* تذييل بسيط */}
        <div className="bg-emerald-950/30 p-4 text-center text-xs text-slate-500 border-t border-white/5">
          منصة جزائرية 100% لتسيير المحلات التجارية
        </div>
      </form>
    </div>
  );
}
