/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-confusing-void-expression */

"use client";

import { getCurrentWebview } from "@tauri-apps/api/webview";
import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ChevronDownIcon, Search, X, Filter } from "lucide-react";
import {
    addDocument,
    readFileAsBlob,
    getDocuments,
    Document,
} from "@/utils/database";
import { useDatabaseContextSafe } from "@/components/DatabaseInitializer";
import DocumentViewer from "@/components/documents/DocumentViewer";

interface DocumentFormData {
    name: string;
    document_type: string;
    enable_reminder: boolean;
    reminder_date: Date | undefined;
    reminder_time: string;
}

const Documents = () => {
    const [isDragHover, setIsDragHover] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [droppedFiles, setDroppedFiles] = useState<string[]>([]);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<DocumentFormData>({
        name: "",
        document_type: "",
        enable_reminder: false,
        reminder_date: undefined,
        reminder_time: "10:30:00",
    });
    const [datePickerOpen, setDatePickerOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDocumentType, setSelectedDocumentType] =
        useState<string>("all");
    const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
    const { isDatabaseInitialized } = useDatabaseContextSafe();

    const filterDocuments = (docs: Document[]) => {
        return docs.filter((doc) => {
            const matchesSearch = doc.name
                .toLowerCase()
                .includes(searchQuery.toLowerCase());
            const matchesType =
                selectedDocumentType === "all" ||
                doc.document_type === selectedDocumentType;
            return matchesSearch && matchesType;
        });
    };

    useEffect(() => {
        const loadDocuments = async () => {
            if (isDatabaseInitialized) {
                setIsLoading(true);
                try {
                    const docs = await getDocuments();
                    setDocuments(docs);
                    setFilteredDocuments(filterDocuments(docs));
                } catch (error) {
                    console.error("Failed to load documents:", error);
                } finally {
                    setIsLoading(false);
                }
            }
        };

        void loadDocuments();
    }, [isDatabaseInitialized]);

    useEffect(() => {
        setFilteredDocuments(filterDocuments(documents));
    }, [searchQuery, selectedDocumentType, documents]);

    useEffect(() => {
        const setupDragDrop = async () => {
            const unlisten = await getCurrentWebview().onDragDropEvent(
                (event) => {
                    if (event.payload.type === "over") {
                        console.log("User hovering", event.payload.position);
                        setIsDragHover(true);
                    } else if (event.payload.type === "drop") {
                        console.log("User dropped", event.payload.paths);
                        console.log(
                            "File paths details:",
                            event.payload.paths.map((path) => ({
                                path,
                                type: typeof path,
                                length: path.length,
                            }))
                        );
                        setIsDragHover(false);
                        setDroppedFiles(event.payload.paths);
                        setIsModalOpen(true);
                    } else {
                        console.log("File drop cancelled");
                        setIsDragHover(false);
                    }
                }
            );

            return unlisten;
        };

        let unlistenPromise: Promise<() => void> | null = null;

        unlistenPromise = setupDragDrop();

        return () => {
            if (unlistenPromise) {
                void unlistenPromise.then((unlisten) => unlisten());
            }
        };
    }, []);

    const handleSubmit = async () => {
        console.log("Submitting document:", {
            files: droppedFiles,
            ...formData,
        });

        if (!isDatabaseInitialized) {
            console.error(
                "Database not initialized. Please wait for initialization to complete."
            );
            alert("Database not ready. Please wait a moment and try again.");
            return;
        }

        if (droppedFiles.length === 0) {
            alert("Please select at least one file to upload.");
            return;
        }

        try {
            const filePath = droppedFiles[0];
            console.log("Attempting to read file:", filePath);
            const { data, mimeType } = await readFileAsBlob(filePath);
            console.log(
                "File read successfully. MIME type:",
                mimeType,
                "Data size:",
                data.length
            );

            const documentData = {
                ...formData,
                reminder_date:
                    formData.enable_reminder && formData.reminder_date
                        ? formData.reminder_date.toISOString()
                        : undefined,
                mime_type: mimeType,
                data: data,
            };

            await addDocument(documentData);

            const updatedDocs = await getDocuments();
            setDocuments(updatedDocs);
            setFilteredDocuments(filterDocuments(updatedDocs));

            setIsModalOpen(false);
            setFormData({
                name: "",
                document_type: "",
                enable_reminder: false,
                reminder_date: undefined,
                reminder_time: "10:30:00",
            });
            setDroppedFiles([]);
            setDatePickerOpen(false);
        } catch (error) {
            console.error("Failed to add document:", error);
            alert(
                `Failed to add document: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`
            );
        }
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setFormData({
            name: "",
            document_type: "",
            enable_reminder: false,
            reminder_date: undefined,
            reminder_time: "10:30:00",
        });
        setDroppedFiles([]);
        setDatePickerOpen(false);
    };

    const clearFilters = () => {
        setSearchQuery("");
        setSelectedDocumentType("all");
    };

    const hasActiveFilters =
        searchQuery !== "" || selectedDocumentType !== "all";

    return (
        <motion.div
            className="h-full overflow-y-auto relative"
            animate={{
                backgroundColor: isDragHover
                    ? "rgba(59, 130, 246, 0.05)"
                    : "transparent",
            }}
            transition={{ duration: 0.2 }}
        >
            <AnimatePresence>
                {isDragHover && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
                    >
                        <motion.div
                            animate={{
                                scale: [1, 1.05, 1],
                                rotate: [0, 1, -1, 0],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                repeatType: "loop",
                            }}
                            className="bg-blue-500/10 border-2 border-dashed border-blue-500 rounded-xl p-12"
                            style={{
                                imageRendering: "crisp-edges",
                                WebkitFontSmoothing: "antialiased",
                                MozOsxFontSmoothing: "grayscale",
                            }}
                        >
                            <div className="text-center">
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        repeatType: "loop",
                                    }}
                                    className="text-6xl mb-4"
                                >
                                    📁
                                </motion.div>
                                <h3 className="text-xl font-semibold text-blue-600 mb-2">
                                    Drop your files here
                                </h3>
                                <p className="text-blue-500/80">
                                    Release to upload documents
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div
                className="container mx-auto w-full px-10"
                style={{ marginTop: "48px", marginBottom: "64px" }}
            >
                <motion.div
                    className="mb-8"
                    animate={{
                        opacity: isDragHover ? 0.3 : 1,
                        scale: isDragHover ? 0.95 : 1,
                    }}
                    transition={{ duration: 0.2 }}
                >
                    <h1 className="text-3xl font-bold tracking-tight">
                        Documents
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Manage your documents and files
                    </p>
                </motion.div>

                {/* Search and Filter Controls */}
                <motion.div
                    className="mb-6"
                    animate={{
                        opacity: isDragHover ? 0.3 : 1,
                        scale: isDragHover ? 0.95 : 1,
                    }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="flex flex-col sm:flex-row gap-4 flex-1">
                            {/* Search Input */}
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search documents..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="pl-10 pr-10"
                                />
                                {searchQuery && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
                                        onClick={() => setSearchQuery("")}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                )}
                            </div>

                            {/* Document Type Filter */}
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-muted-foreground" />
                                <Select
                                    value={selectedDocumentType}
                                    onValueChange={setSelectedDocumentType}
                                >
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="All types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Types
                                        </SelectItem>
                                        <SelectItem value="Personal">
                                            Personal
                                        </SelectItem>
                                        <SelectItem value="Listing">
                                            Listing
                                        </SelectItem>
                                        <SelectItem value="General">
                                            General
                                        </SelectItem>
                                        <SelectItem value="Other">
                                            Other
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Clear Filters Button */}
                        {hasActiveFilters && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={clearFilters}
                                className="cursor-pointer"
                            >
                                <X className="h-4 w-4 mr-2" />
                                Clear Filters
                            </Button>
                        )}
                    </div>

                    {/* Filter Results Summary */}
                    {hasActiveFilters && (
                        <div className="mt-3 text-sm text-muted-foreground">
                            Showing {filteredDocuments.length} of{" "}
                            {documents.length} documents
                            {searchQuery && ` matching "${searchQuery}"`}
                            {selectedDocumentType !== "all" &&
                                ` of type "${selectedDocumentType}"`}
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Documents List */}
            <div className="container mx-auto w-full px-10">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-muted-foreground">
                            Loading documents...
                        </div>
                    </div>
                ) : (
                    <DocumentViewer
                        documents={filteredDocuments}
                        onDocumentDelete={async (documentId) => {
                            try {
                                const updatedDocs = await getDocuments();
                                setDocuments(updatedDocs);
                                setFilteredDocuments(
                                    filterDocuments(updatedDocs)
                                );
                            } catch (error) {
                                console.error(
                                    "Failed to refresh documents:",
                                    error
                                );
                            }
                        }}
                    />
                )}
            </div>

            {/* Document Upload Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Add Document Details</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="text-sm text-muted-foreground mb-2">
                            Files to upload:{" "}
                            {droppedFiles
                                .map((file) => file.split("/").pop())
                                .join(", ")}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="name">Document Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        name: e.target.value,
                                    }))
                                }
                                placeholder="Enter document name"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="document_type">Document Type</Label>
                            <Select
                                value={formData.document_type}
                                onValueChange={(value) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        document_type: value,
                                    }))
                                }
                            >
                                <SelectTrigger
                                    id="document_type"
                                    className="w-full"
                                >
                                    <SelectValue placeholder="Select document type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Personal">
                                        Personal
                                    </SelectItem>
                                    <SelectItem value="Listing">
                                        Listing
                                    </SelectItem>
                                    <SelectItem value="General">
                                        General
                                    </SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-3">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="enable-reminder"
                                    checked={formData.enable_reminder}
                                    onCheckedChange={(checked) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            enable_reminder: !!checked,
                                            // Reset date and time when unchecked
                                            reminder_date: checked
                                                ? prev.reminder_date
                                                : undefined,
                                        }))
                                    }
                                />
                                <Label
                                    htmlFor="enable-reminder"
                                    className="text-sm font-medium cursor-pointer"
                                >
                                    Set reminder notification
                                </Label>
                            </div>

                            {formData.enable_reminder && (
                                <div className="flex gap-4 ml-6">
                                    <div className="flex flex-col gap-3">
                                        <Label
                                            htmlFor="date-picker"
                                            className="px-1 text-xs text-muted-foreground"
                                        >
                                            Date
                                        </Label>
                                        <Popover
                                            open={datePickerOpen}
                                            onOpenChange={setDatePickerOpen}
                                        >
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    id="date-picker"
                                                    className="w-32 justify-between font-normal"
                                                >
                                                    {formData.reminder_date
                                                        ? formData.reminder_date.toLocaleDateString()
                                                        : "Select date"}
                                                    <ChevronDownIcon className="h-4 w-4" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent
                                                className="w-auto overflow-hidden p-0"
                                                align="start"
                                            >
                                                <Calendar
                                                    mode="single"
                                                    selected={
                                                        formData.reminder_date
                                                    }
                                                    captionLayout="dropdown"
                                                    onSelect={(date) => {
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            reminder_date: date,
                                                        }));
                                                        setDatePickerOpen(
                                                            false
                                                        );
                                                    }}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <Label
                                            htmlFor="time-picker"
                                            className="px-1 text-xs text-muted-foreground"
                                        >
                                            Time
                                        </Label>
                                        <Input
                                            type="time"
                                            id="time-picker"
                                            step="1"
                                            value={formData.reminder_time}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    reminder_time:
                                                        e.target.value,
                                                }))
                                            }
                                            className="w-32 bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={handleCancel}
                            className="cursor-pointer"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={
                                !formData.name ||
                                !formData.document_type ||
                                !isDatabaseInitialized
                            }
                            className="cursor-pointer"
                        >
                            {!isDatabaseInitialized
                                ? "Database Loading..."
                                : "Add Document"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

export default Documents;
