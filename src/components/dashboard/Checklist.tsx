/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-confusing-void-expression */

"use client";
import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "../ui/collapsible";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import {
    ChevronDown,
    ChevronRight,
    Trash2,
    Plus,
    FileText,
    Folder,
    Link,
    Edit,
    X,
    Check,
} from "lucide-react";
import {
    getChecklists,
    addChecklist,
    updateChecklist,
    deleteChecklist,
    toggleChecklistCompletion,
    type Checklist as ChecklistType,
} from "../../utils/database";

interface Reference {
    id: string;
    name: string;
    type: "file" | "folder" | "link";
    url?: string;
}

interface Task {
    id: number;
    title: string;
    dueDate?: string;
    completed: boolean;
    isOpen: boolean;
    references: Reference[];
    documentReferences?: string;
}

const convertChecklistToTask = (checklist: ChecklistType): Task => {
    let references: Reference[] = [];

    if (checklist.document_references) {
        try {
            references = JSON.parse(checklist.document_references);
        } catch (error) {
            console.warn("Failed to parse document references:", error);
            references = [];
        }
    }

    return {
        id: checklist.id ?? 0,
        title: checklist.task_name,
        dueDate: checklist.reminder_date
            ? new Date(checklist.reminder_date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
              })
            : undefined,
        completed: checklist.is_checked,
        isOpen: false,
        references,
        documentReferences: checklist.document_references,
    };
};

// Icon type mapping for the form
const iconTypes = {
    file: { icon: <FileText className="w-4 h-4" /> },
    folder: { icon: <Folder className="w-4 h-4" /> },
    link: { icon: <Link className="w-4 h-4" /> },
};

const Checklist = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [createReference, setCreateReference] = useState<{
        taskId: number;
        refId?: string;
    } | null>(null);
    const [newReference, setNewReference] = useState({
        name: "",
        type: "file" as "file" | "folder" | "link",
        url: "",
    });
    const [newTaskName, setNewTaskName] = useState("");
    const [newTaskDate, setNewTaskDate] = useState("");
    const [isAddingTask, setIsAddingTask] = useState(false);

    useEffect(() => {
        void loadChecklists();
    }, []);

    const loadChecklists = async () => {
        try {
            setLoading(true);
            setError(null);
            const checklists = await getChecklists();
            const convertedTasks = checklists.map(convertChecklistToTask);
            setTasks(convertedTasks);
        } catch (err) {
            setError(`Failed to load checklists: ${err}`);
            console.error("Failed to load checklists:", err);
        } finally {
            setLoading(false);
        }
    };

    const toggleTask = (taskId: number) => {
        setTasks(
            tasks.map((task) =>
                task.id === taskId ? { ...task, isOpen: !task.isOpen } : task
            )
        );
    };

    const toggleTaskCompletion = async (taskId: number) => {
        try {
            const newStatus = await toggleChecklistCompletion(taskId);
            setTasks(
                tasks.map((task) =>
                    task.id === taskId
                        ? { ...task, completed: newStatus }
                        : task
                )
            );
        } catch (err) {
            setError(`Failed to toggle task completion: ${err}`);
            console.error("Failed to toggle task completion:", err);
        }
    };

    const deleteTask = async (taskId: number) => {
        try {
            await deleteChecklist(taskId);
            setTasks(tasks.filter((task) => task.id !== taskId));
        } catch (err) {
            setError(`Failed to delete task: ${err}`);
            console.error("Failed to delete task:", err);
        }
    };

    const addNewTask = async () => {
        if (!newTaskName.trim()) return;

        try {
            const newTask: Omit<
                ChecklistType,
                "id" | "created_at" | "updated_at"
            > = {
                task_name: newTaskName,
                is_checked: false,
                document_references: undefined,
                reminder_date: newTaskDate || undefined,
            };

            const taskId = await addChecklist(newTask);

            const createdTask: Task = {
                id: taskId,
                title: newTaskName,
                dueDate: newTaskDate
                    ? new Date(newTaskDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                      })
                    : undefined,
                completed: false,
                isOpen: false,
                references: [],
                documentReferences: undefined,
            };

            setTasks([createdTask, ...tasks]);
            setNewTaskName("");
            setNewTaskDate("");
            setIsAddingTask(false);
        } catch (err) {
            setError(`Failed to add task: ${err}`);
            console.error("Failed to add task:", err);
        }
    };

    const addReference = async (taskId: number) => {
        if (!newReference.name.trim()) return;

        const reference: Reference = {
            id: `r${Date.now()}`,
            name: newReference.name,
            type: newReference.type,
            url: newReference.url,
        };

        try {
            const task = tasks.find((t) => t.id === taskId);
            if (!task) return;

            const updatedReferences = [...task.references, reference];
            const documentReferences = JSON.stringify(updatedReferences);

            await updateChecklist(
                taskId,
                task.title,
                task.completed,
                documentReferences,
                task.dueDate ? new Date(task.dueDate).toISOString() : undefined
            );

            setTasks(
                tasks.map((t) =>
                    t.id === taskId
                        ? {
                              ...t,
                              references: updatedReferences,
                              documentReferences,
                          }
                        : t
                )
            );

            setNewReference({ name: "", type: "file", url: "" });
            setCreateReference(null);
        } catch (err) {
            setError(`Failed to add reference: ${err}`);
            console.error("Failed to add reference:", err);
        }
    };

    const deleteReference = async (taskId: number, refId: string) => {
        try {
            const task = tasks.find((t) => t.id === taskId);
            if (!task) return;

            const updatedReferences = task.references.filter(
                (ref) => ref.id !== refId
            );
            const documentReferences =
                updatedReferences.length > 0
                    ? JSON.stringify(updatedReferences)
                    : undefined;

            await updateChecklist(
                taskId,
                task.title,
                task.completed,
                documentReferences,
                task.dueDate ? new Date(task.dueDate).toISOString() : undefined
            );

            setTasks(
                tasks.map((t) =>
                    t.id === taskId
                        ? {
                              ...t,
                              references: updatedReferences,
                              documentReferences,
                          }
                        : t
                )
            );
        } catch (err) {
            setError(`Failed to delete reference: ${err}`);
            console.error("Failed to delete reference:", err);
        }
    };

    const getIconForType = (type: "file" | "folder" | "link") => {
        switch (type) {
            case "file":
                return <FileText className="w-4 h-4" />;
            case "folder":
                return <Folder className="w-4 h-4" />;
            case "link":
                return <Link className="w-4 h-4" />;
        }
    };

    if (loading) {
        return (
            <div className="w-full">
                <div className="rounded-lg border px-4 py-6">
                    <div className="flex items-center justify-center py-8">
                        <div className="text-gray-500">
                            Loading checklists...
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="rounded-lg border px-4 py-6">
                <div className="flex items-center justify-between border-b pb-3 mb-4">
                    <h2 className="text-lg font-medium">Checklist</h2>
                    <Button
                        onClick={() => setIsAddingTask(!isAddingTask)}
                        size="sm"
                        className="flex items-center gap-1"
                    >
                        <Plus className="w-4 h-4" />
                        Add Task
                    </Button>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                        <div className="text-red-800 text-sm">{error}</div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setError(null)}
                            className="mt-2 text-red-600 hover:text-red-800"
                        >
                            Dismiss
                        </Button>
                    </div>
                )}

                {isAddingTask && (
                    <div className="space-y-3 p-4 bg-gray-50 rounded-lg mb-4">
                        <div className="grid gap-2">
                            <Label htmlFor="taskName">Task Name</Label>
                            <Input
                                id="taskName"
                                value={newTaskName}
                                onChange={(e) => setNewTaskName(e.target.value)}
                                placeholder="Enter task name"
                                className="h-8"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="taskDate">
                                Due Date (optional)
                            </Label>
                            <Input
                                id="taskDate"
                                type="date"
                                value={newTaskDate}
                                onChange={(e) => setNewTaskDate(e.target.value)}
                                className="h-8"
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setIsAddingTask(false);
                                    setNewTaskName("");
                                    setNewTaskDate("");
                                }}
                            >
                                Cancel
                            </Button>
                            <Button size="sm" onClick={addNewTask}>
                                <Check className="w-4 h-4 mr-1" />
                                Add Task
                            </Button>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    {tasks.length === 0 && !isAddingTask ? (
                        <div className="text-center py-8 text-gray-500">
                            <div className="mb-2">No tasks yet</div>
                            <Button
                                onClick={() => setIsAddingTask(true)}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1 mx-auto"
                            >
                                <Plus className="w-4 h-4" />
                                Add your first task
                            </Button>
                        </div>
                    ) : (
                        tasks.map((task) => (
                            <div
                                key={task.id}
                                className="border rounded-lg p-4"
                            >
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={task.completed}
                                        onChange={() => {
                                            void toggleTaskCompletion(task.id);
                                        }}
                                        className="w-4 h-4 rounded"
                                    />
                                    <div className="flex-1">
                                        <span
                                            className={`font-medium ${
                                                task.completed
                                                    ? "line-through text-gray-500"
                                                    : "text-gray-900"
                                            }`}
                                        >
                                            {task.title}
                                        </span>
                                        {task.dueDate && (
                                            <span className="text-sm text-gray-500 ml-2">
                                                (Due: {task.dueDate})
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Collapsible
                                            open={task.isOpen}
                                            onOpenChange={() => {
                                                toggleTask(task.id);
                                            }}
                                        >
                                            <CollapsibleTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                >
                                                    {task.isOpen ? (
                                                        <ChevronDown className="w-4 h-4" />
                                                    ) : (
                                                        <ChevronRight className="w-4 h-4" />
                                                    )}
                                                </Button>
                                            </CollapsibleTrigger>
                                        </Collapsible>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                void deleteTask(task.id);
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                        </Button>
                                    </div>
                                </div>

                                <Collapsible
                                    open={task.isOpen}
                                    onOpenChange={() => {
                                        toggleTask(task.id);
                                    }}
                                >
                                    <CollapsibleContent className="mt-4">
                                        <div className="ml-7 space-y-2">
                                            <div className="text-sm font-medium text-gray-600 mb-2">
                                                ↳ Linked:
                                            </div>
                                            {task.references.map((ref) => (
                                                <div
                                                    key={ref.id}
                                                    className="flex items-center gap-2 text-sm"
                                                >
                                                    {getIconForType(ref.type)}
                                                    {ref.type === "link" &&
                                                    ref.url ? (
                                                        <a
                                                            href={ref.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:underline"
                                                        >
                                                            {ref.name}
                                                        </a>
                                                    ) : (
                                                        <span>{ref.name}</span>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            void deleteReference(
                                                                task.id,
                                                                ref.id
                                                            );
                                                        }}
                                                        className="ml-auto p-1 h-auto"
                                                    >
                                                        <X className="w-3 h-3 text-red-500" />
                                                    </Button>
                                                </div>
                                            ))}

                                            {createReference?.taskId ===
                                            task.id ? (
                                                <div className="space-y-2 p-3 bg-gray-50 rounded">
                                                    <div className="grid gap-2">
                                                        <div className="grid grid-cols-3 items-center gap-4">
                                                            <Label htmlFor="name">
                                                                Name
                                                            </Label>
                                                            <Input
                                                                id="name"
                                                                value={
                                                                    newReference.name
                                                                }
                                                                onChange={(
                                                                    e
                                                                ) => {
                                                                    setNewReference(
                                                                        {
                                                                            ...newReference,
                                                                            name: e
                                                                                .target
                                                                                .value,
                                                                        }
                                                                    );
                                                                }}
                                                                placeholder="Enter name"
                                                                className="col-span-2 h-8"
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-3 items-center gap-4">
                                                            <Label htmlFor="type">
                                                                Type
                                                            </Label>
                                                            <Select
                                                                value={
                                                                    newReference.type
                                                                }
                                                                onValueChange={(
                                                                    value
                                                                ) => {
                                                                    setNewReference(
                                                                        {
                                                                            ...newReference,
                                                                            type: value as
                                                                                | "file"
                                                                                | "folder"
                                                                                | "link",
                                                                        }
                                                                    );
                                                                }}
                                                            >
                                                                <SelectTrigger className="col-span-2 h-8 w-full">
                                                                    <SelectValue placeholder="Select type" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="file">
                                                                        <div className="flex items-center gap-2">
                                                                            {
                                                                                iconTypes
                                                                                    .file
                                                                                    .icon
                                                                            }
                                                                            <span>
                                                                                File
                                                                            </span>
                                                                        </div>
                                                                    </SelectItem>
                                                                    <SelectItem value="folder">
                                                                        <div className="flex items-center gap-2">
                                                                            {
                                                                                iconTypes
                                                                                    .folder
                                                                                    .icon
                                                                            }
                                                                            <span>
                                                                                Folder
                                                                            </span>
                                                                        </div>
                                                                    </SelectItem>
                                                                    <SelectItem value="link">
                                                                        <div className="flex items-center gap-2">
                                                                            {
                                                                                iconTypes
                                                                                    .link
                                                                                    .icon
                                                                            }
                                                                            <span>
                                                                                Link
                                                                            </span>
                                                                        </div>
                                                                    </SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="grid grid-cols-3 items-center gap-4">
                                                            <Label htmlFor="url">
                                                                URL
                                                            </Label>
                                                            <Input
                                                                id="url"
                                                                value={
                                                                    newReference.url
                                                                }
                                                                onChange={(
                                                                    e
                                                                ) => {
                                                                    setNewReference(
                                                                        {
                                                                            ...newReference,
                                                                            url: e
                                                                                .target
                                                                                .value,
                                                                        }
                                                                    );
                                                                }}
                                                                placeholder="Enter URL or path"
                                                                className="col-span-2 h-8"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-end gap-2 pt-4">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                setCreateReference(
                                                                    null
                                                                );
                                                            }}
                                                        >
                                                            Cancel
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => {
                                                                void addReference(
                                                                    task.id
                                                                );
                                                            }}
                                                        >
                                                            <Check className="w-4 h-4 mr-1" />
                                                            Add Reference
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setCreateReference({
                                                            taskId: task.id,
                                                        });
                                                    }}
                                                    className="flex items-center gap-1 text-blue-600"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    Add Reference
                                                </Button>
                                            )}
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Checklist;
