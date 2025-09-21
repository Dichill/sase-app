/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-confusing-void-expression */
"use client";

import React, { useState, useEffect } from "react";
import {
    Document,
    createDocumentBlobUrl,
    isImageDocument,
    isPdfDocument,
    formatFileSize,
    deleteDocument,
} from "@/utils/database";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Eye,
    Download,
    FileText,
    Image as ImageIcon,
    File,
    Trash2,
    MoreVertical,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface DocumentViewerProps {
    documents: Document[];
    onDocumentSelect?: (document: Document) => void;
    onDocumentDelete?: (documentId: number) => void;
}

interface DocumentPreviewProps {
    document: Document;
    onView?: () => void;
    onDownload?: () => void;
    onDelete?: () => void;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({
    document,
    onView,
    onDownload,
    onDelete,
}) => {
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [isImage, setIsImage] = useState(false);

    useEffect(() => {
        const url = createDocumentBlobUrl(document);
        setBlobUrl(url);
        setIsImage(isImageDocument(document));

        return () => {
            if (url) {
                URL.revokeObjectURL(url);
            }
        };
    }, [document]);

    const getFileIcon = () => {
        if (isImage) return <ImageIcon className="h-8 w-8 text-blue-500" />;
        if (isPdfDocument(document))
            return <FileText className="h-8 w-8 text-red-500" />;
        return <File className="h-8 w-8 text-gray-500" />;
    };

    const getFileSize = () => {
        if (!document.data) return "Unknown size";
        return formatFileSize(document.data.length);
    };

    return (
        <Card className="w-full max-w-sm hover:shadow-lg transition-shadow flex flex-col">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                        {getFileIcon()}
                        <div className="min-w-0 flex-1">
                            <CardTitle className="text-sm font-medium truncate">
                                {document.name}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">
                                {document.document_type}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs">
                            {getFileSize()}
                        </Badge>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 hover:bg-muted"
                                >
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem
                                    variant="destructive"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete?.();
                                    }}
                                    className="cursor-pointer"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Document
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-0 flex-1 flex flex-col">
                {/* Image Preview */}
                {isImage && blobUrl && (
                    <div className="mb-3">
                        <img
                            src={blobUrl}
                            alt={document.name}
                            className="w-full h-32 object-cover rounded-md border"
                            onError={() => setBlobUrl(null)}
                        />
                    </div>
                )}

                {/* Document Info */}
                <div className="space-y-2 flex-1">
                    {document.mime_type && (
                        <p className="text-xs text-muted-foreground">
                            Type: {document.mime_type}
                        </p>
                    )}

                    {document.reminder_date && (
                        <p className="text-xs text-muted-foreground">
                            Reminder:{" "}
                            {new Date(
                                document.reminder_date
                            ).toLocaleDateString()}
                        </p>
                    )}

                    {document.updated_at && (
                        <p className="text-xs text-muted-foreground">
                            Updated:{" "}
                            {new Date(document.updated_at).toLocaleDateString()}
                        </p>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2 mt-4">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={onView}
                        className="flex-1 cursor-pointer"
                    >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={onDownload}
                        className="flex-1 cursor-pointer"
                    >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

const DocumentModal: React.FC<{
    document: Document | null;
    onClose: () => void;
}> = ({ document, onClose }) => {
    const [blobUrl, setBlobUrl] = useState<string | null>(null);

    useEffect(() => {
        if (document) {
            const url = createDocumentBlobUrl(document);
            setBlobUrl(url);

            return () => {
                if (url) {
                    URL.revokeObjectURL(url);
                }
            };
        }
    }, [document]);

    if (!document) return null;

    const isImage = isImageDocument(document);
    const isPdf = isPdfDocument(document);

    const handleDownload = () => {
        if (blobUrl) {
            const link = window.document.createElement("a");
            link.href = blobUrl;
            link.download = document.name;
            window.document.body.appendChild(link);
            link.click();
            window.document.body.removeChild(link);

            toast.success("File downloaded successfully!", {
                description: `${document.name} has been saved to your Downloads folder`,
                duration: 3000,
                className: "text-foreground",
                descriptionClassName: "text-foreground/80",
            });
        }
    };

    return (
        <Dialog open={!!document} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between mr-4">
                        <span>{document.name}</span>
                        <Button
                            onClick={handleDownload}
                            size="sm"
                            className="cursor-pointer"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                        </Button>
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-auto">
                    {isImage && blobUrl ? (
                        <img
                            src={blobUrl}
                            alt={document.name}
                            className="w-full h-auto max-h-[70vh] object-contain"
                        />
                    ) : isPdf && blobUrl ? (
                        <iframe
                            src={blobUrl}
                            className="w-full h-[70vh] border rounded"
                            title={document.name}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                            <File className="h-16 w-16 mb-4" />
                            <p>Preview not available for this file type</p>
                            <p className="text-sm">
                                MIME Type: {document.mime_type}
                            </p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
    documents,
    onDocumentSelect,
    onDocumentDelete,
}) => {
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(
        null
    );
    const [documentToDelete, setDocumentToDelete] = useState<Document | null>(
        null
    );

    const handleViewDocument = (document: Document) => {
        setSelectedDocument(document);
        onDocumentSelect?.(document);
    };

    const handleDownloadDocument = (document: Document) => {
        const blobUrl = createDocumentBlobUrl(document);
        if (blobUrl) {
            const link = window.document.createElement("a");
            link.href = blobUrl;
            link.download = document.name;
            window.document.body.appendChild(link);
            link.click();
            window.document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);

            toast.success("File downloaded successfully!", {
                description: `${document.name} has been saved to your Downloads folder`,
                duration: 3000,
                className: "text-foreground",
                descriptionClassName: "text-foreground/80",
            });
        }
    };

    const handleDeleteDocument = (document: Document) => {
        setDocumentToDelete(document);
    };

    const confirmDelete = async () => {
        if (!documentToDelete || documentToDelete.id === undefined) return;

        try {
            await deleteDocument(documentToDelete.id);
            onDocumentDelete?.(documentToDelete.id);

            toast.success("Document deleted successfully!", {
                description: `${documentToDelete.name} has been removed`,
                duration: 3000,
                className: "text-foreground",
                descriptionClassName: "text-foreground/80",
            });
        } catch (error) {
            console.error("Failed to delete document:", error);
            toast.error("Failed to delete document", {
                description:
                    error instanceof Error ? error.message : "Unknown error",
                duration: 3000,
                className: "text-foreground",
                descriptionClassName: "text-foreground/80",
            });
        } finally {
            setDocumentToDelete(null);
        }
    };

    if (documents.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <File className="h-16 w-16 mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                    No documents found
                </h3>
                <p className="text-sm">
                    Drag and drop files to upload. All documents are encrypted
                    and stored locally on your device.
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {documents.map((document) => (
                    <DocumentPreview
                        key={document.id}
                        document={document}
                        onView={() => handleViewDocument(document)}
                        onDownload={() => handleDownloadDocument(document)}
                        onDelete={() => handleDeleteDocument(document)}
                    />
                ))}
            </div>

            <DocumentModal
                document={selectedDocument}
                onClose={() => setSelectedDocument(null)}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={!!documentToDelete}
                onOpenChange={() => setDocumentToDelete(null)}
            >
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Delete Document</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-sm text-muted-foreground">
                            Are you sure you want to delete &quot;
                            {documentToDelete?.name}&quot;? This action cannot
                            be undone.
                        </p>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setDocumentToDelete(null)}
                            className="cursor-pointer"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => void confirmDelete()}
                            className="cursor-pointer"
                        >
                            Delete
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default DocumentViewer;
