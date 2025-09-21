"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { createClient } from "@/utils/supabase/client";
import { initializeUserDatabase } from "@/utils/database";

interface DatabaseInitializerProps {
    children: React.ReactNode;
}

interface DatabaseContextType {
    isDatabaseInitialized: boolean;
    initializeDatabase: (user: { email: string; id: string }) => Promise<void>;
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
            }
        );
    } catch (error) {
        return {
            isDatabaseInitialized: false,
            initializeDatabase: async () => {},
        };
    }
}

export function DatabaseInitializer({ children }: DatabaseInitializerProps) {
    const [isDatabaseInitialized, setIsDatabaseInitialized] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const initializeDatabase = async (user: { email: string; id: string }) => {
        if (isDatabaseInitialized) {
            console.log("Database already initialized, skipping...");
            return;
        }

        try {
            console.log(
                "DatabaseInitializer: Initializing database for user:",
                user.email
            );
            const defaultPassword = `${user.id}_${user.email}`;

            const result = await initializeUserDatabase(defaultPassword);
            console.log(
                "DatabaseInitializer: Database initialization result:",
                result
            );
            setIsDatabaseInitialized(true);
        } catch (error) {
            console.error(
                "DatabaseInitializer: Failed to initialize database:",
                error
            );
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
                await initializeDatabase({
                    email: session.user.email,
                    id: session.user.id,
                });
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
                await initializeDatabase({
                    email: session.user.email,
                    id: session.user.id,
                });
            } else if (event === "SIGNED_OUT") {
                console.log(
                    "DatabaseInitializer: User signed out, resetting database state"
                );
                setIsDatabaseInitialized(false);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [isClient, isDatabaseInitialized]);

    if (!isClient) {
        return <>{children}</>;
    }

    const contextValue: DatabaseContextType = {
        isDatabaseInitialized,
        initializeDatabase,
    };

    return (
        <DatabaseContext.Provider value={contextValue}>
            {children}
        </DatabaseContext.Provider>
    );
}
