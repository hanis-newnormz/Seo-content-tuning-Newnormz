"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

import { signIn, signUp, type AuthActionState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const initialState: AuthActionState = {};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" size="lg" disabled={pending}>
      {pending && <Loader2 className="animate-spin" />}
      {label}
    </Button>
  );
}

export function LoginForm() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [signInState, signInAction] = useFormState(signIn, initialState);
  const [signUpState, signUpAction] = useFormState(signUp, initialState);

  return (
    <Tabs value={mode} onValueChange={(v) => setMode(v as "signin" | "signup")}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="signin">Sign in</TabsTrigger>
        <TabsTrigger value="signup">Create account</TabsTrigger>
      </TabsList>

      <TabsContent value="signin" className="mt-6">
        <form action={signInAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Work email</Label>
            <Input id="email" name="email" type="email" placeholder="you@agency.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          {signInState.error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {signInState.error}
            </p>
          )}
          <SubmitButton label="Sign in" />
        </form>
      </TabsContent>

      <TabsContent value="signup" className="mt-6">
        <form action={signUpAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" name="fullName" placeholder="Jane Tan" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signupEmail">Work email</Label>
            <Input
              id="signupEmail"
              name="email"
              type="email"
              placeholder="you@agency.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signupPassword">Password</Label>
            <Input
              id="signupPassword"
              name="password"
              type="password"
              minLength={8}
              required
            />
          </div>
          {signUpState.error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {signUpState.error}
            </p>
          )}
          <SubmitButton label="Create account" />
        </form>
      </TabsContent>
    </Tabs>
  );
}
