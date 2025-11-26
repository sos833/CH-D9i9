"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, BarChart, Bar, ResponsiveContainer } from "recharts";

// بيانات وهمية للرسوم البيانية
const generateChartData = () => Array.from({ length: 10 }, (_, i) => ({
  name: i,
  value: Math.floor(Math.random() * 100) + 50,
}));

// مكون لرقم عائم واحد
const FloatingNumber = ({ delay, x, duration }: { delay: number; x: string; duration: number }) => {
  return (
    <motion.div
      initial={{ y: "110vh", opacity: 0 }}
      animate={{ y: "-10vh", opacity: [0, 1, 1, 0] }}
      transition={{
        duration: duration,
        repeat: Infinity,
        delay: delay,
        ease: "linear",
      }}
      className="absolute text-emerald-500/20 font-mono font-bold text-xl select-none z-0"
      style={{ left: x }}
    >
      {Math.floor(Math.random() * 10000).toLocaleString('en-US')} د.ج
    </motion.div>
  );
};

// مكون للخلفية كاملة
export const FinanceBackground = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [chartData, setChartData] = useState(generateChartData());

  useEffect(() => {
    setIsMounted(true);
    const interval = setInterval(() => {
      setChartData(generateChartData());
    }, 2000); // تحديث البيانات كل ثانيتين
    return () => clearInterval(interval);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-slate-950 -z-10">
      {/* 1. شبكة خلفية خفيفة */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      {/* 2. الأرقام العائمة (تمثل المعاملات) */}
      {Array.from({ length: 15 }).map((_, i) => (
        <FloatingNumber
          key={i}
          delay={Math.random() * 5}
          x={`${Math.random() * 90}%`}
          duration={Math.random() * 10 + 10} // سرعة بين 10 و 20 ثانية
        />
      ))}

      {/* 3. رسم بياني خطي (يمثل النمو) - يمين الشاشة */}
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 0.4, x: 0 }}
        transition={{ duration: 2 }}
        className="absolute bottom-10 right-[-10%] w-[600px] h-[300px] opacity-20 pointer-events-none"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <Line
              type="monotone"
              dataKey="value"
              stroke="#10b981" // لون الزمرد
              strokeWidth={4}
              dot={false}
              isAnimationActive={false} // إيقاف الأنيميشن الداخلي لـ recharts للتحكم الكامل
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* 4. رسم بياني عمودي (يمثل المبيعات) - يسار الشاشة */}
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 0.3, y: 0 }}
        transition={{ duration: 2, delay: 0.5 }}
        className="absolute bottom-0 left-[-5%] w-[500px] h-[250px] opacity-10 pointer-events-none"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <Bar dataKey="value" fill="#fbbf24" radius={[4, 4, 0, 0]} isAnimationActive={false} /> {/* لون ذهبي */}
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* 5. دائرة ضوئية في الأعلى للجمالية */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px]" />
    </div>
  );
};
