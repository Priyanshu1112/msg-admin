"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, getCsrfToken } from "next-auth/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import useAppStore from "@/store/app";
import { LoaderCircle } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const params = useSearchParams();
  const errorParam = params.get("error");

  const { error, setError } = useAppStore();

  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [csrfToken, setCsrfToken] = useState<string>("");
  const [otpHint, setOtpHint] = useState<string>("");
  const [form, setForm] = useState({ username: "", password: "", otp: "" });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (errorParam) {
      setError(errorParam);
    }

    getCsrfToken().then((token) => {
      if (token) setCsrfToken(token);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const res = await signIn("credentials", {
      redirect: false,
      username: form.username,
      password: form.password,
      otp: step === "otp" ? form.otp : undefined,
      callbackUrl: "/",
      csrfToken,
    });

    if (res?.error) {
      if (res.error.startsWith("OTP_REQUIRED")) {
        const last4 = res.error.split(":")[1];
        setOtpHint(`Sent to phone ending in ${last4}`);
        setStep("otp");
      } else {
        setError(res.error);
      }
    } else {
      router.push(res?.url || "/");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>
            {step === "credentials"
              ? "Enter your username and password"
              : otpHint}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input name="csrfToken" type="hidden" value={csrfToken} />

            <div>
              <Label htmlFor="username" className="mb-1">
                Username
              </Label>
              <Input
                id="username"
                name="username"
                value={form.username}
                onChange={handleChange}
                required
              />
            </div>

            {step === "credentials" && (
              <div>
                <Label htmlFor="password" className="mb-1">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            {step === "otp" && (
              <div>
                <Label htmlFor="otp" className="mb-1">
                  One-Time Code
                </Label>
                <Input
                  id="otp"
                  name="otp"
                  value={form.otp}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            {error && <p className="text-red-600">{error}</p>}

            <Button
              type="submit"
              className="w-full disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <LoaderCircle size={20} className="rotate" />
              ) : step === "credentials" ? (
                "Next"
              ) : (
                "Verify OTP"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
