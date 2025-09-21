"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { Minus, X, Maximize2, Minimize2 } from "lucide-react";

// Type definition for Tauri window
interface TauriWindow {
    minimize(): Promise<void>;
    maximize(): Promise<void>;
    unmaximize(): Promise<void>;
    close(): Promise<void>;
    isMaximized(): Promise<boolean>;
}

interface TitlebarProps {
    title?: string;
    showControls?: boolean;
    className?: string;
}

export function Titlebar({
    title = "DICHOPHSTIN",
    showControls = true,
    className = "",
}: TitlebarProps) {
    const [isMaximized, setIsMaximized] = useState(false);
    const [appWindow, setAppWindow] = useState<TauriWindow | null>(null);

    useEffect(() => {
        const initWindow = async (): Promise<void> => {
            try {
                const { getCurrentWindow } = await import(
                    "@tauri-apps/api/window"
                );
                const window = getCurrentWindow() as TauriWindow;
                setAppWindow(window);

                const maximized = await window.isMaximized();
                setIsMaximized(maximized);
            } catch (error) {
                console.warn("Tauri window API not available:", error);
            }
        };

        void initWindow();
    }, []);

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
                            onClick={() => {
                                if (appWindow) {
                                    void appWindow.minimize();
                                }
                            }}
                            disabled={!appWindow}
                        >
                            <Minus className="h-3 w-3" />
                            <span className="sr-only">Minimize window</span>
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-muted/50 rounded-sm"
                            onClick={() => {
                                if (!appWindow) return;

                                void (async (): Promise<void> => {
                                    if (isMaximized) {
                                        await appWindow.unmaximize();
                                        setIsMaximized(false);
                                    } else {
                                        await appWindow.maximize();
                                        setIsMaximized(true);
                                    }
                                })();
                            }}
                            disabled={!appWindow}
                        >
                            {isMaximized ? (
                                <Minimize2 className="h-3 w-3" />
                            ) : (
                                <Maximize2 className="h-3 w-3" />
                            )}
                            <span className="sr-only">
                                {isMaximized
                                    ? "Restore window"
                                    : "Maximize window"}
                            </span>
                        </Button>

                        {/* Close Button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-red-500 hover:text-white rounded-sm ml-1 transition-colors duration-150"
                            onClick={() => {
                                if (appWindow) {
                                    void appWindow.close();
                                }
                            }}
                            disabled={!appWindow}
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
