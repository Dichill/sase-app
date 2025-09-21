"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { createClient } from "@/utils/supabase/client";
import { initializeUserDatabase } from "@/utils/database";

interface DatabaseInitializerProps {
    children: React.ReactNode;
}

interface DatabaseContextType {
    isDatabaseInitialized: boolean;
    initializeDatabase: (
        user: { email: string; id: string },
        force?: boolean
    ) => Promise<void>;
    checkDatabaseStatus: () => Promise<boolean>;
}

const DatabaseContext = createContext<DatabaseContextType | null>(null);

export function useDatabaseContext() {
    const context = useContext(DatabaseContext);
    if (!context) {
        throw new Error(
            "useDatabaseContext must be used within DatabaseInitializer"
        );
    }
    return context;
}

export function useDatabaseContextSafe() {
    try {
        const context = useContext(DatabaseContext);
        return (
            context ?? {
                isDatabaseInitialized: false,
                initializeDatabase: async () => {},
                checkDatabaseStatus: async () => false,
            }
        );
    } catch (error) {
        return {
            isDatabaseInitialized: false,
            initializeDatabase: async () => {},
            checkDatabaseStatus: async () => false,
        };
    }
}

export function DatabaseInitializer({ children }: DatabaseInitializerProps) {
    const [isDatabaseInitialized, setIsDatabaseInitialized] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const initializeDatabase = async (
        user: { email: string; id: string },
        force: boolean = false
    ) => {
        if (isDatabaseInitialized && !force) {
            console.log("Database already initialized, skipping...");
            return;
        }

        try {
            console.log(
                "DatabaseInitializer: Initializing database for user:",
                user.email,
                force ? "(forced)" : ""
            );

            // Reset state before attempting initialization
            setIsDatabaseInitialized(false);

            const defaultPassword = `${user.id}_${user.email}`;

            const result = await initializeUserDatabase(defaultPassword);
            console.log(
                "DatabaseInitializer: Database initialization result:",
                result
            );

            if (result.success) {
                setIsDatabaseInitialized(true);
                console.log(
                    "DatabaseInitializer: Database successfully initialized and state updated"
                );
            } else {
                console.error(
                    "DatabaseInitializer: Database initialization returned success: false"
                );
                setIsDatabaseInitialized(false);
            }
        } catch (error) {
            console.error(
                "DatabaseInitializer: Failed to initialize database:",
                error
            );
            // Reset the state to false in case of error
            setIsDatabaseInitialized(false);
        }
    };

    const checkDatabaseStatus = async (): Promise<boolean> => {
        try {
            // Try to make a simple database call to verify it's working
            const { getDatabaseInfo } = await import("@/utils/database");
            const info = await getDatabaseInfo();
            return info.exists && !info.error;
        } catch (error) {
            console.error("Database status check failed:", error);
            return false;
        }
    };

    useEffect(() => {
        if (!isClient) return;

        const checkAndInitializeDatabase = async () => {
            if (isDatabaseInitialized) return;

            const supabase = createClient();
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (session?.user && session.user.email && session.user.id) {
                console.log(
                    "DatabaseInitializer: Found authenticated user, initializing database..."
                );

                // Check if database was recently deleted
                const wasDeleted = !localStorage.getItem(
                    "database_initialized"
                );

                await initializeDatabase(
                    {
                        email: session.user.email,
                        id: session.user.id,
                    },
                    wasDeleted
                );

                // Mark as initialized in localStorage
                localStorage.setItem("database_initialized", "true");
            }
        };

        void checkAndInitializeDatabase();

        const supabase = createClient();
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("DatabaseInitializer: Auth state change:", event);

            if (
                event === "SIGNED_IN" &&
                session?.user &&
                session.user.email &&
                session.user.id
            ) {
                console.log(
                    "DatabaseInitializer: User signed in, initializing database..."
                );

                // Check if database was recently deleted
                const wasDeleted = !localStorage.getItem(
                    "database_initialized"
                );

                await initializeDatabase(
                    {
                        email: session.user.email,
                        id: session.user.id,
                    },
                    wasDeleted
                ); // Force initialization if database was deleted

                // Mark as initialized in localStorage
                localStorage.setItem("database_initialized", "true");
            } else if (event === "SIGNED_OUT") {
                console.log(
                    "DatabaseInitializer: User signed out, resetting database state"
                );
                setIsDatabaseInitialized(false);
                localStorage.removeItem("database_initialized");
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [isClient]); // Removed isDatabaseInitialized dependency to prevent re-initialization loops

    if (!isClient) {
        return <>{children}</>;
    }

    const contextValue: DatabaseContextType = {
        isDatabaseInitialized,
        initializeDatabase,
        checkDatabaseStatus,
    };

    return (
        <DatabaseContext.Provider value={contextValue}>
            {children}
        </DatabaseContext.Provider>
    );
}
