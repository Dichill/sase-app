"use client";
import { useState, Fragment } from "react";
import {
  DescriptionDetails,
  DescriptionList,
  DescriptionTerm,
} from "../ui/description-list";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Save, X, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { invoke } from "@tauri-apps/api/core";

interface IncomeSource {
  id: string;
  source: "Employment" | "Self-Employed" | "Other";
  employerName: string;
  jobTitle: string;
  employmentLength: string;
  employerContact: string;
  isEditing: boolean;
}

const createEmptyIncomeSource = (): IncomeSource => ({
  id: Math.random().toString(36), //change to actual id logic?
  source: "Employment",
  employerName: "",
  jobTitle: "",
  employmentLength: "",
  employerContact: "",
  isEditing: true,
});



const IncomeSnapshot: React.FC = () => {
  const [monthlyIncome, setMonthlyIncome] = useState<string>("");
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([]); // get: set income sources from database
  const [editBuffer, setEditBuffer] = useState<
    Partial<Record<string, { source: string; employerName: string; jobTitle: string; employmentLength: string; employerContact: string }>>
  >({});

  // get function

  // delete from database function

  // save to database (replace all this!!)
  // const saveIncomeSource = async (data: IncomeSource[]) => {
  //   return new Promise<void>((resolve) => {
  //     console.log("Saving income source data", data);
  //     setTimeout(() => {
  //       resolve();
  //     }, 300);
  //   });
  // };
  const saveIncomeSource = async (data: IncomeSource[]) => {
    console.log("Saving income source data", data);
    for (const src of data) {
      await invoke("add_income_source", {
        id: src.id,
        source: src.source,
        employerName: src.employerName,
        jobTitle: src.jobTitle,
        employmentLength: src.employmentLength,
        employerContact: src.employerContact
      });
    }
  }
  
  

  const handleChange = (
    id: string,
    field: keyof IncomeSource,
    value: string
  ) => {
    setIncomeSources((prev) =>
      prev.map((source) =>
        source.id === id ? { ...source, [field]: value } : source
      )
    );
  };

  const addIncomeSource = () => {
    setIncomeSources((prev) => [...prev, createEmptyIncomeSource()]);
  };

  const removeIncomeSource = (id: string) => {
    setIncomeSources((prev) => prev.filter((source) => source.id !== id));
  };

  const saveItem = (id: string) => {
    setIncomeSources((prev) => {
      const next = prev.map((source) =>
        source.id === id ? { ...source, isEditing: false } : source
      );
      void saveIncomeSource(next);
      return next;
    });
    setEditBuffer((buf) => {
      const { [id]: _removed, ...rest } = buf;
      return rest;
    });
  };

  const editItem = (id: string) => {
    setIncomeSources((prev) => {
      const current = prev.find((i) => i.id === id);
      if (current) {
        setEditBuffer((buf) => ({
          ...buf,
          [id]: { source: current.source, employerName: current.employerName, jobTitle: current.jobTitle, employmentLength: current.employmentLength, employerContact: current.employerContact },
        }));
      }
      return prev.map((source) =>
        source.id === id ? { ...source, isEditing: true } : source
      );
    });
  };

  const cancelEdit = (id: string) => {
    setIncomeSources((prev) => {
      const original = editBuffer[id];
      if (!original) {
        return prev.filter((source) => source.id !== id);
      }
      return prev.map((source) =>
        source.id === id
          ? {
              ...source,
              source: original.source as "Employment" | "Self-Employed" | "Other",
              employerName: original.employerName,
              jobTitle: original.jobTitle,
              employmentLength: original.employmentLength,
              employerContact: original.employerContact,
              isEditing: false,
            }
          : source
      );
    });
    setEditBuffer((buf) => {
      const { [id]: _removed, ...rest } = buf;
      return rest;
    });
  };
// Frontend only component
  return (
    <div className="rounded-lg border px-4 py-6">
      <div className="flex items-center justify-between border-b pb-3">
        <h2 className="text-lg font-medium">Income Sources</h2>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          aria-label="Add income source"
          onClick={() => {
            addIncomeSource();
          }}
          className="cursor-pointer"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-4 space-y-4">
        <DescriptionList>
          {incomeSources
            .filter((i) => !i.isEditing)
            .map((income) => (
              <Fragment key={income.id}>
                <DescriptionTerm>{income.source} - {income.jobTitle}</DescriptionTerm>
                <DescriptionDetails>
                  <div className="flex items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div>{income.employerName}</div>
                      <div className="text-sm text-muted-foreground">
                        {income.employmentLength} • {income.employerContact}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="cursor-pointer"
                          aria-label="More actions"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Row actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault();
                            editItem(income.id);
                          }}
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault();
                            removeIncomeSource(income.id);
                          }}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </DescriptionDetails>
              </Fragment>
            ))}
        </DescriptionList>

        {incomeSources
          .filter((i) => i.isEditing)
          .map((income) => (
            <div key={income.id} className="space-y-4 border-t pt-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-1 block">Source Type</label>
                  <Select
                    value={income.source}
                    onValueChange={(value) => {
                      handleChange(income.id, "source", value as IncomeSource["source"]);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Income Source</SelectLabel>
                        <SelectItem value="Employment">Employment</SelectItem>
                        <SelectItem value="Self-Employed">Self-Employed</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Job Title</label>
                  <Input
                    value={income.jobTitle}
                    onChange={(e) => {
                      handleChange(income.id, "jobTitle", e.target.value);
                    }}
                    placeholder="Job title"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Employer Name</label>
                  <Input
                    value={income.employerName}
                    onChange={(e) => {
                      handleChange(income.id, "employerName", e.target.value);
                    }}
                    placeholder="Company name"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Employment Length</label>
                  <Input
                    value={income.employmentLength}
                    onChange={(e) => {
                      handleChange(income.id, "employmentLength", e.target.value);
                    }}
                    placeholder="e.g., 2 years"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-sm font-medium mb-1 block">Employer Contact</label>
                  <Input
                    value={income.employerContact}
                    onChange={(e) => {
                      handleChange(income.id, "employerContact", e.target.value);
                    }}
                    placeholder="Email or phone"
                  />
                </div>
              </div>

              <div className="flex gap-1">
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="cursor-pointer"
                  aria-label="Save"
                  onClick={() => {
                    saveItem(income.id);
                  }}
                >
                  <Save className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="cursor-pointer"
                  aria-label="Cancel"
                  onClick={() => {
                    cancelEdit(income.id);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default IncomeSnapshot;
