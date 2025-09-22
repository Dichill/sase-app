"use client";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
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

interface Reference {
  id: string;
  name: string;
  type: "file" | "folder" | "link";
  url?: string;
}

interface Task {
  id: string;
  title: string;
  completed: boolean;
  isOpen: boolean;
  references: Reference[];
}

const initialTasks: Task[] = [
  {
    id: "1",
    title: "Submit Application",
    completed: false,
    isOpen: false,
    references: [
      {
        id: "r1",
        name: "Application.pdf",
        type: "file",
        url: "/application.pdf",
      },
      {
        id: "r2",
        name: "ProofOfIncome.pdf",
        type: "file",
        url: "/proof-of-income.pdf",
      },
      { id: "r3", name: "References", type: "folder", url: "/references" },
    ],
  },
  {
    id: "2",
    title: "Pay Security Deposit",
    completed: false,
    isOpen: false,
    references: [
      {
        id: "r4",
        name: "Bank Portal",
        type: "link",
        url: "https://bank.com/payments",
      },
    ],
  },
  {
    id: "3",
    title: "Upload Lease Agreement",
    completed: false,
    isOpen: false,
    references: [{ id: "r5", name: "Lease_123MainSt.pdf", type: "file" }],
  },
  {
    id: "4 ",
    title: "Upload Lease Agreement",
    completed: false,
    isOpen: false,
    references: [{ id: "r5", name: "Lease_123MainSt.pdf", type: "file" }],
  },
  {
    id: "5",
    title: "Upload Lease Agreement",
    completed: false,
    isOpen: false,
    references: [{ id: "r5", name: "Lease_123MainSt.pdf", type: "file" }],
  },
  {
    id: "6",
    title: "Upload Lease Agreement",
    completed: false,
    isOpen: false,
    references: [{ id: "r5", name: "Lease_123MainSt.pdf", type: "file" }],
  },
  {
    id: "6",
    title: "Upload Lease Agreement",
    completed: false,
    isOpen: false,
    references: [{ id: "r5", name: "Lease_123MainSt.pdf", type: "file" }],
  },
  {
    id: "6",
    title: "Upload Lease Agreement",
    completed: false,
    isOpen: false,
    references: [{ id: "r5", name: "Lease_123MainSt.pdf", type: "file" }],
  },
  {
    id: "6",
    title: "Upload Lease Agreement",
    completed: false,
    isOpen: false,
    references: [{ id: "r5", name: "Lease_123MainSt.pdf", type: "file" }],
  },
  {
    id: "6",
    title: "Upload Lease Agreement",
    completed: false,
    isOpen: false,
    references: [{ id: "r5", name: "Lease_123MainSt.pdf", type: "file" }],
  },
  {
    id: "6",
    title: "Upload Lease Agreement",
    completed: false,
    isOpen: false,
    references: [{ id: "r5", name: "Lease_123MainSt.pdf", type: "file" }],
  },
  {
    id: "6",
    title: "Upload Lease Agreement",
    completed: false,
    isOpen: false,
    references: [{ id: "r5", name: "Lease_123MainSt.pdf", type: "file" }],
  },
  {
    id: "6",
    title: "Upload Lease Agreement",
    completed: false,
    isOpen: false,
    references: [{ id: "r5", name: "Lease_123MainSt.pdf", type: "file" }],
  },
  {
    id: "6",
    title: "Upload Lease Agreement",
    completed: false,
    isOpen: false,
    references: [{ id: "r5", name: "Lease_123MainSt.pdf", type: "file" }],
  },
  {
    id: "6",
    title: "Upload Lease Agreement",
    completed: false,
    isOpen: false,
    references: [{ id: "r5", name: "Lease_123MainSt.pdf", type: "file" }],
  },
  {
    id: "6",
    title: "Upload Lease Agreement",
    completed: false,
    isOpen: false,
    references: [{ id: "r5", name: "Lease_123MainSt.pdf", type: "file" }],
  },
];

// Icon type mapping for the form
const iconTypes = {
  file: { icon: <FileText className="w-4 h-4" /> },
  folder: { icon: <Folder className="w-4 h-4" /> },
  link: { icon: <Link className="w-4 h-4" /> },
};

const Checklist = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [showCreateReference, setShowCreateReference] = useState<{
    taskId: string;
    refId?: string;
  } | null>(null);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editingReference, setEditingReference] = useState<{
    taskId: string;
    refId: string;
  } | null>(null);
  const [newReference, setNewReference] = useState({
    name: "",
    type: "file" as "file" | "folder" | "link",
    url: "",
  });
  const [newTask, setNewTask] = useState({
    title: "",
  });

  const createTask = async () => {
    if (!newTask.title.trim()) {
      alert("Please enter a task title");
      return;
    }

    const task: Task = {
      id: `task_${Date.now()}`,
      title: newTask.title,
      completed: false,
      isOpen: false,
      references: [],
    };

    try {
      // TODO: Replace with actual database call
      // await invoke("create_task", { task });

      // For now, update local state
      setTasks([...tasks, task]);
      setNewTask({ title: "" });
      console.log("Created task:", task);
    } catch (error) {
      console.error("Failed to create task:", error);
      alert("Failed to create task");
    }
  };

  const toggleTaskCompletion = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedTask = { ...task, completed: !task.completed };

    try {
      // TODO: Replace with actual database call
      // await invoke("update_task", { id: taskId, completed: updatedTask.completed });

      // For now, update local state
      setTasks(tasks.map((t) => (t.id === taskId ? updatedTask : t)));
      console.log("Toggled completion for task:", taskId);
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const toggleTask = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, isOpen: !task.isOpen } : task
      )
    );
  };

  const deleteTask = async (taskId: string) => {
    try {
      // TODO: Replace with actual database call
      // await invoke("delete_task", { id: taskId });

      // For now, update local state
      setTasks(tasks.filter((task) => task.id !== taskId));
      console.log("Deleted task:", taskId);
    } catch (error) {
      console.error("Failed to delete task:", error);
      alert("Failed to delete task");
    }
  };

  const createReference = async (taskId: string) => {
    if (!newReference.name.trim()) {
      alert("Please enter a reference name");
      return;
    }

    const reference: Reference = {
      id: `ref_${Date.now()}`,
      name: newReference.name,
      type: newReference.type,
      url: newReference.url || undefined,
    };

    try {
      // TODO: Replace with actual database call
      // await invoke("create_reference", { taskId, reference });

      // For now, update local state
      setTasks(
        tasks.map((task) =>
          task.id === taskId
            ? { ...task, references: [...task.references, reference] }
            : task
        )
      );

      setNewReference({ name: "", type: "file", url: "" });
      setShowCreateReference(null);
      console.log("Created reference:", reference, "for task:", taskId);
    } catch (error) {
      console.error("Failed to create reference:", error);
      alert("Failed to create reference");
    }
  };

  const deleteReference = async (taskId: string, refId: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this reference?"
    );

    if (!confirmDelete) return;

    try {
      // TODO: Replace with actual database call
      // await invoke("delete_reference", { taskId, refId });

      // For now, update local state
      setTasks(
        tasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                references: task.references.filter((ref) => ref.id !== refId),
              }
            : task
        )
      );
      console.log("Deleted reference:", refId, "from task:", taskId);
    } catch (error) {
      console.error("Failed to delete reference:", error);
      alert("Failed to delete reference");
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

  return (
    <div className="w-full mx-6">
      <div className="w-full rounded-lg px-4 ">
        <h2 className="text-lg font-medium my-4">Checklist</h2>

        <div className="mb-4 rounded-lg">
          <div className="flex gap-2">
            <Input
              placeholder="New Task"
              value={newTask.title}
              onChange={(e) => {
                setNewTask({ title: e.target.value });
              }}
              className="flex-1"
            />
            <Button onClick={() => void createTask()} size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto">
          {tasks.map((task) => (
            <div key={task.id} className="border border-border bg-card rounded-lg p-4">
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
                        ? "line-through text-muted-foreground"
                        : "text-foreground"
                    }`}
                  >
                    {task.title}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      toggleTask(task.id);
                    }}
                  >
                    {task.isOpen ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </Button>
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

              {task.isOpen && (
                <div className="mt-4">
                  <div className="ml-7 space-y-2">
                    <div className="text-sm font-medium text-muted-foreground mb-2">
                      ↳ Linked:
                    </div>
                    {task.references.map((ref) => (
                      <div
                        key={ref.id}
                        className="flex items-center gap-2 text-sm mx-4 text-foreground"
                      >
                        {getIconForType(ref.type)}
                        <a
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {ref.name}
                        </a>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            void deleteReference(task.id, ref.id);
                          }}
                          className="ml-auto p-1 h-auto"
                        >
                          <X className="w-3 h-3 text-red-500" />
                        </Button>
                      </div>
                    ))}

                    {showCreateReference?.taskId === task.id ? (
                      <div className="space-y-2 p-4 border border-border bg-muted rounded">
                        <div className="grid gap-2">
                          <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="type">Type</Label>
                            <Select
                              value={newReference.type}
                              onValueChange={(value) => {
                                setNewReference({
                                  ...newReference,
                                  type: value as "file" | "folder" | "link",
                                });
                              }}
                            >
                              <SelectTrigger className="col-span-2 h-8 w-full">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="file">
                                  <div className="flex items-center gap-2">
                                    {iconTypes.file.icon}
                                    <span>File</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="folder">
                                  <div className="flex items-center gap-2">
                                    {iconTypes.folder.icon}
                                    <span>Folder</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="link">
                                  <div className="flex items-center gap-2">
                                    {iconTypes.link.icon}
                                    <span>Link</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="name">Name</Label>
                            <Input
                              id="name"
                              value={newReference.name}
                              onChange={(e) => {
                                setNewReference({
                                  ...newReference,
                                  name: e.target.value,
                                });
                              }}
                              placeholder="Enter name"
                              className="col-span-2 h-8"
                            />
                          </div>

                          <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="url">URL</Label>
                            <Input
                              id="url"
                              value={newReference.url}
                              onChange={(e) => {
                                setNewReference({
                                  ...newReference,
                                  url: e.target.value,
                                });
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
                              setShowCreateReference(null);
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              void createReference(task.id);
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
                          setShowCreateReference({ taskId: task.id });
                        }}
                        className="flex items-center gap-1 text-primary"
                      >
                        <Plus className="w-4 h-4" />
                        Add Reference
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Checklist;
