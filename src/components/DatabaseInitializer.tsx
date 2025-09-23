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
    const [initializationTimeout, setInitializationTimeout] =
        useState<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setIsClient(true);

        const wasInitialized = localStorage.getItem("database_initialized");
        if (wasInitialized) {
            checkDatabaseStatus()
                .then((isWorking) => {
                    if (isWorking) {
                        console.log(
                            "DatabaseInitializer: Database appears to be working, marking as initialized"
                        );
                        setIsDatabaseInitialized(true);
                    } else {
                        console.log(
                            "DatabaseInitializer: Database not working despite localStorage flag"
                        );
                        localStorage.removeItem("database_initialized");
                    }
                })
                .catch((error: unknown) => {
                    console.log(
                        "DatabaseInitializer: Initial database check failed:",
                        error
                    );
                });
        }
    }, []);

    const initializeDatabase = async (
        user: { email: string; id: string },
        force: boolean = false
    ) => {
        if (isDatabaseInitialized && !force) {
            console.log("Database already initialized, skipping...");
            return;
        }

        if (!force) {
            try {
                const status = await checkDatabaseStatus();
                if (status) {
                    console.log(
                        "Database already exists and is working, marking as initialized"
                    );
                    setIsDatabaseInitialized(true);
                    return;
                }
            } catch (error) {
                console.log(
                    "Database status check failed, proceeding with initialization:",
                    error
                );
            }
        }

        try {
            console.log(
                "DatabaseInitializer: Initializing database for user:",
                user.email,
                force ? "(forced)" : ""
            );

            if (force || !isDatabaseInitialized) {
                setIsDatabaseInitialized(false);
            }

            const defaultPassword = `${user.id}_${user.email}`;

            const result = await initializeUserDatabase(defaultPassword);
            console.log(
                "DatabaseInitializer: Database initialization result:",
                result
            );

            if (result.success) {
                console.log(
                    "DatabaseInitializer: Initialization returned success, verifying backend is ready..."
                );

                await new Promise((resolve) => setTimeout(resolve, 100));

                try {
                    const isReady = await checkDatabaseStatus();
                    if (isReady) {
                        setIsDatabaseInitialized(true);
                        console.log(
                            "DatabaseInitializer: Database successfully initialized and verified ready"
                        );
                    } else {
                        console.warn(
                            "DatabaseInitializer: Initialization succeeded but backend not ready yet, will retry"
                        );
                        setIsDatabaseInitialized(false);
                    }
                } catch (verifyError) {
                    console.warn(
                        "DatabaseInitializer: Failed to verify database readiness:",
                        verifyError
                    );
                    setIsDatabaseInitialized(true);
                }
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

            try {
                const status = await checkDatabaseStatus();
                if (status) {
                    console.log(
                        "Database exists despite initialization error, marking as initialized"
                    );
                    setIsDatabaseInitialized(true);
                    return;
                }
            } catch (checkError) {
                console.log("Database status check also failed:", checkError);
            }

            setIsDatabaseInitialized(false);
        }
    };

    const checkDatabaseStatus = async (): Promise<boolean> => {
        try {
            const { getListings } = await import("@/utils/database");
            await getListings();
            return true;
        } catch (error) {
            console.log(
                "Database status check failed (this is normal during initialization):",
                error
            );
            if (
                error instanceof Error &&
                error.message.includes("Database not initialized")
            ) {
                return false;
            }
            return false;
        }
    };

    useEffect(() => {
        if (!isClient) return;

        let isInitializing = false;

        const handleUserSession = async (
            user: { email: string; id: string },
            reason: string
        ) => {
            if (isInitializing) {
                console.log(
                    "DatabaseInitializer: Already initializing, skipping..."
                );
                return;
            }

            console.log(
                `DatabaseInitializer: ${reason}, checking database status...`
            );

            isInitializing = true;

            const timeout = setTimeout(() => {
                console.warn(
                    "DatabaseInitializer: Initialization timeout, checking if database is working..."
                );
                void (async () => {
                    try {
                        const isWorking = await checkDatabaseStatus();
                        if (isWorking) {
                            console.log(
                                "DatabaseInitializer: Database is working despite timeout, marking as initialized"
                            );
                            setIsDatabaseInitialized(true);
                        } else {
                            console.warn(
                                "DatabaseInitializer: Database not working after timeout, forcing completion to avoid infinite loop"
                            );
                            setIsDatabaseInitialized(true);
                        }
                    } catch (error) {
                        console.warn(
                            "DatabaseInitializer: Timeout check failed, forcing completion:",
                            error
                        );
                        setIsDatabaseInitialized(true);
                    }
                    localStorage.setItem("database_initialized", "true");
                    isInitializing = false;
                })();
            }, 30000);

            setInitializationTimeout(timeout);

            try {
                const wasDeleted = !localStorage.getItem(
                    "database_initialized"
                );

                await initializeDatabase(user, wasDeleted);

                localStorage.setItem("database_initialized", "true");
            } catch (error) {
                console.error(
                    "DatabaseInitializer: Error during initialization:",
                    error
                );
                setIsDatabaseInitialized(true);
                localStorage.setItem("database_initialized", "true");
            } finally {
                clearTimeout(timeout);
                setInitializationTimeout(null);
                isInitializing = false;
            }
        };

        const checkAndInitializeDatabase = async () => {
            if (isDatabaseInitialized) return;

            const supabase = createClient();
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (session?.user && session.user.email && session.user.id) {
                await handleUserSession(
                    {
                        email: session.user.email,
                        id: session.user.id,
                    },
                    "Found authenticated user on mount"
                );
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
                await handleUserSession(
                    {
                        email: session.user.email,
                        id: session.user.id,
                    },
                    "User signed in"
                );
            } else if (event === "SIGNED_OUT") {
                console.log(
                    "DatabaseInitializer: User signed out, resetting database state"
                );
                setIsDatabaseInitialized(false);
                localStorage.removeItem("database_initialized");
                isInitializing = false;
            }
        });

        return () => {
            subscription.unsubscribe();
            if (initializationTimeout) {
                clearTimeout(initializationTimeout);
            }
        };
    }, [isClient, initializationTimeout]);

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
