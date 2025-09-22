"use client";
import { useState, Fragment, useEffect } from "react";
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
import {
  Plus,
  Save,
  X,
  MoreVertical,
  Pencil,
  AlertCircleIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { invoke } from "@tauri-apps/api/core";
import { get } from "http";
import { set } from "zod";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

interface IncomeSource {
  id: string;
  source: "Employment" | "Self-Employed" | "Other";
  employerName: string;
  jobTitle: string;
  employmentLength: string;
  employerContact: string;
  isEditing: boolean;
  isNew?: boolean;
}

const createNewIncomeSource = (): IncomeSource => ({
  id: `income_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
  source: "Employment",
  employerName: "",
  jobTitle: "",
  employmentLength: "",
  employerContact: "",
  isEditing: true,
  isNew: true,
});

const IncomeSnapshot: React.FC = () => {
  const [monthlyIncome, setMonthlyIncome] = useState<number>(0);
  const [isEditingIncome, setIsEditingIncome] = useState<boolean>(false);
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([]);

  useEffect(() => {
    getIncomeSources();
    getMonthlyIncome(1);
  }, []);

  const updateIncomeSource = (id: string, updates: Partial<IncomeSource>) => {
    setIncomeSources((prev) =>
      prev.map((source) =>
        source.id === id ? { ...source, ...updates } : source
      )
    );
  };

  const getIncomeSources = async () => {
    try {
      const sources: IncomeSource[] = await invoke("get_income_sources");
      console.log("Fetched income sources:", sources);
      setIncomeSources(sources);
    } catch (error) {
      console.error("Failed to fetch income sources:", error);
    }
  };

  const getMonthlyIncome = async (profileId: number) => {
  try {
    const income: number | null = await invoke("get_monthly_income", { profileId });
    console.log("Fetched monthly income:", income);

    // if you want to store 0 when it's null:
    setMonthlyIncome(income ?? 0);
  } catch (error) {
    console.error("Failed to fetch monthly income:", error);
  }
};

  const handleChange = (
    id: string,
    field: keyof IncomeSource,
    value: string
  ) => {
    updateIncomeSource(id, { [field]: value });
  };

  const addIncomeSource = () => {
    setIncomeSources((prev) => [...prev, createNewIncomeSource()]);
  };

  // @zoph db stores income source id as an integer, but your struct builds on it being a string
  // I just casted it in case you had some reason for it being a string
  // Cannot test yet until saving function is fixed
  // TEST: DELETE operation for individual income source in db
  const deleteIncomeSource = async (id: string) => {
    await invoke("delete_income_source", { id: parseInt(id, 10) });
  };

  const saveAllIncomeSources = async (data: IncomeSource[]) => {
    console.log("Saving income source data", data);
    for (const src of data) {
      await invoke("add_income_source", {
        id: src.id,
        source: src.source,
        employerName: src.employerName,
        jobTitle: src.jobTitle,
        employmentLength: src.employmentLength,
        employerContact: src.employerContact,
      });
    }
  };

  // CREATE/UPDATE operation for individual income source
  const createIncomeSource = async (id: string) => {
    const source = incomeSources.find((s) => s.id === id);
    if (!source || !source.employerName.trim() || !source.jobTitle.trim()) {
      <Alert variant="destructive">
        <AlertCircleIcon />
        <AlertTitle>Unable to add income source.</AlertTitle>
        <AlertDescription>
          Employer Name and Job Title are required.
        </AlertDescription>
      </Alert>;
      return;
    }

    try {
      await invoke("add_income_source", {
        id: source.id,
        source: source.source,
        employerName: source.employerName,
        jobTitle: source.jobTitle,
        employmentLength: source.employmentLength,
        employerContact: source.employerContact,
      });

      updateIncomeSource(id, { isEditing: false, isNew: false });
    } catch (error) {
      <Alert variant="destructive">
        <AlertCircleIcon />
        <AlertTitle>Failed to save income source.</AlertTitle>
        <AlertDescription>Please try again.</AlertDescription>
      </Alert>;
    }
  };

  // FIXED: UPDATE operation for monthly income in db
  const saveMonthlyIncome = async () => {
    try {
      await invoke("set_monthly_income", { income: monthlyIncome });
      setIsEditingIncome(false);
    } catch (error) {
      <Alert variant="destructive">
        <AlertCircleIcon />
        <AlertTitle>Failed to save monthly income.</AlertTitle>
        <AlertDescription>Please try again.</AlertDescription>
      </Alert>;
    }
  };

  const editIncomeSource = (id: string) => {
    updateIncomeSource(id, { isEditing: true });
  };

  const cancelEdit = (id: string) => {
    const source = incomeSources.find((s) => s.id === id);
    if (source?.isNew) {
      setIncomeSources((prev) => prev.filter((s) => s.id !== id));
    } else {
      updateIncomeSource(id, { isEditing: false });
    }
  };
  // Frontend only component
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-6">
      <div className="flex items-center justify-between border-b pb-3">
        <h2 className="text-lg font-medium">Employment</h2>
      </div>

      <div className="mt-4 space-y-4">
        <DescriptionList>
          <DescriptionTerm>Monthly Income</DescriptionTerm>
          <DescriptionDetails>
            {isEditingIncome ? (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={monthlyIncome}
                  onChange={(e) => {
                    setMonthlyIncome(Number(e.target.value));
                  }}
                  placeholder="Enter monthly income"
                  className="max-w-xs"
                />

                <div className="flex items-center ">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="cursor-pointer"
                    aria-label="Save"
                    onClick={() => {
                      void saveMonthlyIncome();
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
                      setIsEditingIncome(false);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div>${monthlyIncome.toLocaleString()}</div>
                <Pencil
                  className="mr-2 h-4 w-4 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsEditingIncome(true);
                  }}
                />
              </div>
            )}
          </DescriptionDetails>
        </DescriptionList>
        <div className="flex items-center justify-between border-b mb-1">
          <h4>Income Sources</h4>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label="Add income source"
            onClick={addIncomeSource}
            className="cursor-pointer"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <DescriptionList>
          {incomeSources
            .filter((i) => !i.isEditing)
            .map((income) => (
              <Fragment key={income.id}>
                <DescriptionTerm>
                  {income.source} - {income.jobTitle}
                </DescriptionTerm>
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
                            editIncomeSource(income.id);
                          }}
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault();
                            void deleteIncomeSource(income.id);
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
            <div key={income.id} className="space-y-4 border-b pt-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Source Type
                  </label>
                  <Select
                    value={income.source}
                    onValueChange={(value) => {
                      handleChange(
                        income.id,
                        "source",
                        value as IncomeSource["source"]
                      );
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Income Source</SelectLabel>
                        <SelectItem value="Employment">Employment</SelectItem>
                        <SelectItem value="Self-Employed">
                          Self-Employed
                        </SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Job Title
                  </label>
                  <Input
                    value={income.jobTitle}
                    onChange={(e) => {
                      handleChange(income.id, "jobTitle", e.target.value);
                    }}
                    placeholder="Job title"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Employer Name
                  </label>
                  <Input
                    value={income.employerName}
                    onChange={(e) => {
                      handleChange(income.id, "employerName", e.target.value);
                    }}
                    placeholder="Company name"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Employment Length
                  </label>
                  <Input
                    value={income.employmentLength}
                    onChange={(e) => {
                      handleChange(
                        income.id,
                        "employmentLength",
                        e.target.value
                      );
                    }}
                    placeholder="e.g., 2 years"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-sm font-medium mb-1 block">
                    Employer Contact
                  </label>
                  <Input
                    value={income.employerContact}
                    onChange={(e) => {
                      handleChange(
                        income.id,
                        "employerContact",
                        e.target.value
                      );
                    }}
                    placeholder="Email or phone"
                  />
                </div>
              </div>

              <div className="flex gap-1">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="cursor-pointer"
                  aria-label="Save"
                  onClick={() => {
                    void createIncomeSource(income.id);
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
