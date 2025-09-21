"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [rememberMe, setRememberMe] = useState(true);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const supabase = createClient();
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setError(error.message);
                setIsLoading(false);
                return;
            }

            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (data.session?.user?.email) {
                const user = data.session.user;
                console.log("Login successful for user:", user.email);
                console.log("Session data:", data.session);

                await supabase.auth.setSession({
                    access_token: data.session.access_token,
                    refresh_token: data.session.refresh_token,
                });
                console.log("Session explicitly set in storage");

                const { data: verifySession } =
                    await supabase.auth.getSession();
                console.log(
                    "Session verification:",
                    verifySession.session
                        ? "Session found in storage"
                        : "Session NOT found in storage"
                );

                await new Promise((resolve) => setTimeout(resolve, 100));
            }

            console.log("Attempting to navigate to home page...");
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (data.session && rememberMe) {
                const sessionWithTimestamp = {
                    ...data.session,
                    stored_at: Date.now(),
                };
                localStorage.setItem(
                    "supabase_session",
                    JSON.stringify(sessionWithTimestamp)
                );
                console.log(
                    "Session stored in localStorage for persistence with timestamp"
                );
            } else {
                console.log(
                    "Remember me not checked, session will not persist across app restarts"
                );
            }
            router.replace("/");
            console.log("Navigation command sent (using replace)");
        } catch (err) {
            console.error("Login error:", err);
            setError("An unexpected error occurred");
            setIsLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const supabase = createClient();
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) {
                setError(error.message);
                setIsLoading(false);
                return;
            }

            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (data.session?.user?.email) {
                const user = data.session.user;
                console.log("Signup successful for user:", user.email);

                await supabase.auth.setSession({
                    access_token: data.session.access_token,
                    refresh_token: data.session.refresh_token,
                });
                console.log("Signup session explicitly set in storage");

                await new Promise((resolve) => setTimeout(resolve, 100));

                console.log(
                    "Attempting to navigate to home page after signup..."
                );
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                if (data.session && rememberMe) {
                    const sessionWithTimestamp = {
                        ...data.session,
                        stored_at: Date.now(),
                    };
                    localStorage.setItem(
                        "supabase_session",
                        JSON.stringify(sessionWithTimestamp)
                    );
                    console.log(
                        "Signup session stored in localStorage for persistence with timestamp"
                    );
                } else {
                    console.log(
                        "Remember me not checked, session will not persist across app restarts"
                    );
                }
                router.replace("/");
                console.log(
                    "Navigation command sent after signup (using replace)"
                );
            } else if (data.user && !data.session) {
                // User needs to confirm email
                setError("Please check your email to confirm your account.");
                setIsLoading(false);
            }
        } catch (err) {
            console.error("Signup error:", err);
            setError("An unexpected error occurred");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">
                        Sign in to your account
                    </CardTitle>
                    <CardDescription className="text-center">
                        Enter your email and password to access your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        className="space-y-4"
                        onSubmit={(e) => {
                            void handleLogin(e);
                        }}
                    >
                        <div className="space-y-2">
                            <Label htmlFor="email">Email address</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                }}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                }}
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="remember-me"
                                checked={rememberMe}
                                onCheckedChange={(checked) => {
                                    setRememberMe(checked === true);
                                }}
                            />
                            <Label
                                htmlFor="remember-me"
                                className="text-sm font-normal"
                            >
                                Remember me (stay logged in)
                            </Label>
                        </div>

                        {error && (
                            <div className="text-destructive text-sm text-center p-2 bg-destructive/10 rounded-md">
                                {error}
                            </div>
                        )}

                        <div className="flex space-x-2">
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full cursor-pointer"
                            >
                                {isLoading ? "Signing in..." : "Sign in"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
