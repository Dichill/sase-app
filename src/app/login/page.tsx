"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

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
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Sign in to your account
                    </h2>
                </div>
                <form
                    className="mt-8 space-y-6"
                    onSubmit={(e) => {
                        void handleLogin(e);
                    }}
                >
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="sr-only">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                }}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                }}
                            />
                        </div>
                    </div>

                    <div className="flex items-center">
                        <input
                            id="remember-me"
                            name="remember-me"
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => {
                                setRememberMe(e.target.checked);
                            }}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label
                            htmlFor="remember-me"
                            className="ml-2 block text-sm text-gray-900"
                        >
                            Remember me (stay logged in)
                        </label>
                    </div>

                    {error && (
                        <div className="text-red-600 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div className="flex space-x-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {isLoading ? "Signing in..." : "Sign in"}
                        </button>
                        <button
                            type="button"
                            onClick={(e) => {
                                void handleSignup(e);
                            }}
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {isLoading ? "Signing up..." : "Sign up"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
