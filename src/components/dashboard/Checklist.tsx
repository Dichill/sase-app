"use client";
import React, { useState } from "react";
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

interface Reference {
  id: string;
  name: string;
  type: "file" | "folder" | "link";
  url?: string;
}

interface Task {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
  isOpen: boolean;
  references: Reference[];
}

const initialTasks: Task[] = [
  {
    id: "1",
    title: "Submit Application",
    dueDate: "Sep 25",
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
    dueDate: "Sep 28",
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
    dueDate: "Sep 30",
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
  const [createReference, setCreateReference] = useState<{
    taskId: string;
    refId?: string;
  } | null>(null);
  const [newReference, setNewReference] = useState({
    name: "",
    type: "file" as "file" | "folder" | "link",
    url: "",
  });

  const toggleTask = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, isOpen: !task.isOpen } : task
      )
    );
  };

  const toggleTaskCompletion = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const addReference = (taskId: string) => {
    if (!newReference.name.trim()) return;

    const reference: Reference = {
      id: `r${Date.now()}`,
      name: newReference.name,
      type: newReference.type,
      url: newReference.url,
    };

    setTasks(
      tasks.map((task) =>
        task.id === taskId
          ? { ...task, references: [...task.references, reference] }
          : task
      )
    );

    setNewReference({ name: "", type: "file", url: "" });
    setCreateReference(null);
  };

  const deleteReference = (taskId: string, refId: string) => {
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
    <div className="w-full">
      <div className="rounded-lg border px-4 py-6">
        <div className="flex items-center justify-between border-b pb-3 mb-4">
          <h2 className="text-lg font-medium">Checklist</h2>
        </div>

        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="border rounded-lg p-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => {
                    toggleTaskCompletion(task.id);
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
                  <span className="text-sm text-gray-500 ml-2">
                    (Due: {task.dueDate})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Collapsible
                    open={task.isOpen}
                    onOpenChange={() => {
                      toggleTask(task.id);
                    }}
                  >
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm">
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
                      deleteTask(task.id);
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
                        {ref.type === "link" && ref.url ? (
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
                            deleteReference(task.id, ref.id);
                          }}
                          className="ml-auto p-1 h-auto"
                        >
                          <X className="w-3 h-3 text-red-500" />
                        </Button>
                      </div>
                    ))}

                    {createReference?.taskId === task.id ? (
                      <div className="space-y-2 p-3 bg-gray-50 rounded">
                        <div className="grid gap-2">
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
                              setCreateReference(null);
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              addReference(task.id);
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
                          setCreateReference({ taskId: task.id });
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default Checklist;
