"use client";

import { useRouter } from "next/navigation";
import { RegisterForm } from "@/components/auth/register-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const futuraSignInFontClasses =
  "font-['Futura_PT_Book',_Futura,_sans-serif] [&_.font-semibold]:font-['Futura_PT_Demi',_Futura,_sans-serif] [&_.font-bold]:font-['Futura_PT_Demi',_Futura,_sans-serif]";

export default function RegisterPage() {
  const router = useRouter();

  return (
    <div className="min-h-full flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>Join our investment tracker</CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={() => router.push("/login")}
              className={["text-sm", futuraSignInFontClasses].join(" ")}
            >
              Already have an account? Sign in
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
