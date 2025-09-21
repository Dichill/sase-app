"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Database, Trash2, Shield, Bell, Palette, Info } from "lucide-react";
import {
    deleteDatabase,
    getDatabaseInfo,
    handleLogout,
} from "@/utils/database";
import { useRouter } from "next/navigation";

const Settings = () => {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteSuccess, setDeleteSuccess] = useState(false);
    const [dbInfo, setDbInfo] = useState<{
        exists: boolean;
        path: string;
        size?: number;
        permissions?: string;
        readonly?: boolean;
        is_file?: boolean;
        error?: string;
    } | null>(null);
    const [showDbInfo, setShowDbInfo] = useState(false);

    const handleDeleteDatabase = async () => {
        try {
            setIsDeleting(true);
            await deleteDatabase();
            setDeleteSuccess(true);
            setTimeout(() => {
                setDeleteSuccess(false);
            }, 3000);

            await handleLogout().then(() => {
                router.push("/login");
            });
        } catch (error) {
            console.error("Failed to delete database:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleGetDbInfo = async () => {
        try {
            const info = await getDatabaseInfo();
            setDbInfo(info);
            setShowDbInfo(true);
        } catch (error) {
            console.error("Failed to get database info:", error);
            setDbInfo({
                exists: false,
                path: "unknown",
                error: String(error),
            });
            setShowDbInfo(true);
        }
    };

    return (
        <div className="h-full overflow-y-auto">
            <div
                className="container mx-auto w-full px-10"
                style={{ marginTop: "48px", marginBottom: "64px" }}
            >
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Settings
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Manage your application preferences and data
                    </p>
                </div>

                <Tabs defaultValue="database" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger
                            value="database"
                            className="flex items-center gap-2"
                        >
                            <Database className="h-4 w-4" />
                            Database
                        </TabsTrigger>
                        <TabsTrigger
                            value="security"
                            className="flex items-center gap-2"
                        >
                            <Shield className="h-4 w-4" />
                            Security
                        </TabsTrigger>
                        <TabsTrigger
                            value="notifications"
                            className="flex items-center gap-2"
                        >
                            <Bell className="h-4 w-4" />
                            Notifications
                        </TabsTrigger>
                        <TabsTrigger
                            value="appearance"
                            className="flex items-center gap-2"
                        >
                            <Palette className="h-4 w-4" />
                            Appearance
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="database" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Database className="h-5 w-5" />
                                    Database Management
                                </CardTitle>
                                <CardDescription>
                                    Manage your local database and data storage
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-medium">
                                            Database Status
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Your encrypted local database is
                                            active
                                        </p>
                                    </div>
                                    <Badge
                                        variant="secondary"
                                        className="bg-green-50 text-green-700 border-green-200"
                                    >
                                        Active
                                    </Badge>
                                </div>

                                <Separator />

                                <div className="space-y-4">
                                    <h3 className="font-medium">
                                        Database Information
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">
                                                Type:
                                            </span>
                                            <span className="ml-2">
                                                SQLite (Encrypted)
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">
                                                Location:
                                            </span>
                                            <span className="ml-2">
                                                Local Storage
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">
                                                Tables:
                                            </span>
                                            <span className="ml-2">
                                                Listings, Profile, Documents,
                                                Checklists
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">
                                                Encryption:
                                            </span>
                                            <span className="ml-2">
                                                SQLCipher
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-medium">
                                                Debug Information
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                View detailed database file
                                                information
                                            </p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                void handleGetDbInfo();
                                            }}
                                        >
                                            <Info className="h-4 w-4 mr-2" />
                                            Get DB Info
                                        </Button>
                                    </div>

                                    {showDbInfo && dbInfo && (
                                        <Card className="bg-muted/50">
                                            <CardContent className="pt-4">
                                                <pre className="text-xs overflow-x-auto">
                                                    {JSON.stringify(
                                                        dbInfo,
                                                        null,
                                                        2
                                                    )}
                                                </pre>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>

                                <Separator />

                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-medium text-destructive">
                                            Danger Zone
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Irreversible and destructive actions
                                        </p>
                                    </div>

                                    {deleteSuccess && (
                                        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                                            <p className="text-sm text-green-700">
                                                Database deleted successfully!
                                            </p>
                                        </div>
                                    )}

                                    <Card className="border-destructive/20">
                                        <CardContent className="pt-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-medium">
                                                        Delete Database
                                                    </h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        Permanently delete all
                                                        your data including
                                                        listings, profile,
                                                        documents, and
                                                        checklists
                                                    </p>
                                                </div>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            disabled={
                                                                isDeleting
                                                            }
                                                            className="ml-4 cursor-pointer"
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            {isDeleting
                                                                ? "Deleting..."
                                                                : "Delete Database"}
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                                                                <Trash2 className="h-5 w-5" />
                                                                Delete Database?
                                                            </AlertDialogTitle>
                                                            <AlertDialogDescription
                                                                asChild
                                                            >
                                                                <div>
                                                                    <p className="mb-2">
                                                                        This
                                                                        action
                                                                        cannot
                                                                        be
                                                                        undone.
                                                                        This
                                                                        will
                                                                        permanently
                                                                        delete
                                                                        your
                                                                        entire
                                                                        database
                                                                        including:
                                                                    </p>
                                                                    <ul className="list-disc list-inside space-y-1">
                                                                        <li>
                                                                            All
                                                                            rental
                                                                            listings
                                                                        </li>
                                                                        <li>
                                                                            Your
                                                                            profile
                                                                            information
                                                                        </li>
                                                                        <li>
                                                                            All
                                                                            uploaded
                                                                            documents
                                                                        </li>
                                                                        <li>
                                                                            All
                                                                            checklists
                                                                            and
                                                                            tasks
                                                                        </li>
                                                                    </ul>
                                                                </div>
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel className="cursor-pointer">
                                                                Cancel
                                                            </AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => {
                                                                    void handleDeleteDatabase();
                                                                }}
                                                                className="bg-destructive hover:bg-destructive/90 cursor-pointer"
                                                                disabled={
                                                                    isDeleting
                                                                }
                                                            >
                                                                {isDeleting
                                                                    ? "Deleting..."
                                                                    : "Yes, Delete Everything"}
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="security" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    Security Settings
                                </CardTitle>
                                <CardDescription>
                                    Manage your security preferences and
                                    encryption settings
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Security settings will be implemented in
                                    future updates.
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="notifications" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Bell className="h-5 w-5" />
                                    Notification Settings
                                </CardTitle>
                                <CardDescription>
                                    Configure when and how you receive
                                    notifications
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Notification settings will be implemented in
                                    future updates.
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="appearance" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Palette className="h-5 w-5" />
                                    Appearance Settings
                                </CardTitle>
                                <CardDescription>
                                    Customize the look and feel of your
                                    application
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Appearance settings will be implemented in
                                    future updates.
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default Settings;
