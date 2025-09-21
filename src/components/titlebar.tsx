"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { Minus, X, Maximize2, Minimize2 } from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";

interface TitlebarProps {
    title?: string;
    showControls?: boolean;
    className?: string;
}

export async function Titlebar({
    title = "DICHOPHSTIN",
    showControls = true,
    className = "",
}: TitlebarProps) {
    const appWindow = getCurrentWindow();

    return (
        <div
            className={`titlebar flex items-center justify-between h-12 bg-background border-b border-border z-50 relative ${className}`}
        >
            <div
                data-tauri-drag-region
                className="flex items-center gap-3 px-4 h-full flex-1 select-none cursor-grab active:cursor-grabbing"
            >
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-gradient-to-br from-blue-500 via-purple-500 to-purple-600 rounded-sm flex items-center justify-center shadow-sm">
                        <span className="text-xs font-bold text-white drop-shadow-sm">
                            D
                        </span>
                    </div>
                </div>
            </div>

            <div
                data-tauri-drag-region
                className="flex-1 h-full flex items-center justify-center select-none"
            ></div>

            <div className="flex items-center gap-1 px-2">
                <div className="mr-2">
                    <ThemeToggle />
                </div>

                <Separator orientation="vertical" className="h-6" />

                {showControls && (
                    <div className="titlebar-controls flex items-center ml-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-muted/50 rounded-sm"
                            onClick={() => appWindow.minimize()}
                        >
                            <Minus className="h-3 w-3" />
                            <span className="sr-only">Minimize window</span>
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-muted/50 rounded-sm"
                            onClick={() => appWindow.maximize()}
                        >
                            {(await appWindow.isMaximized()) ? (
                                <Minimize2 className="h-3 w-3" />
                            ) : (
                                <Maximize2 className="h-3 w-3" />
                            )}
                            <span className="sr-only">
                                {(await appWindow.isMaximized())
                                    ? "Restore window"
                                    : "Maximize window"}
                            </span>
                        </Button>

                        {/* Close Button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-red-500 hover:text-white rounded-sm ml-1 transition-colors duration-150"
                            onClick={() => appWindow.close()}
                        >
                            <X className="h-3 w-3" />
                            <span className="sr-only">Close window</span>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
