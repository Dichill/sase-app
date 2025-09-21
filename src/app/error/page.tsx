"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function ErrorPage() {
    const handleGoHome = () => {
        window.location.href = "/";
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-destructive">
                        Oops! Something went wrong
                    </CardTitle>
                    <CardDescription>
                        We apologize for the inconvenience. Please try again or
                        go back to the home page.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleGoHome} className="w-full">
                        Go Home
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
