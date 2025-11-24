import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/icons"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Logo className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">أهلاً بعودتك</CardTitle>
          <CardDescription className="text-center">
            أدخل بريدك الإلكتروني وكلمة المرور للوصول إلى لوحة التحكم
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input id="email" type="email" placeholder="m@example.com" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">كلمة المرور</Label>
            <Input id="password" type="password" required />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col">
          <Link href="/dashboard" className="w-full">
            <Button className="w-full">تسجيل الدخول</Button>
          </Link>
          <p className="mt-4 text-xs text-center text-muted-foreground">
            بالنقر فوق متابعة، فإنك توافق على{" "}
            <a href="#" className="underline">
              شروط الخدمة
            </a>{" "}
            و{" "}
            <a href="#" className="underline">
              سياسة الخصوصية
            </a>
            .
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
