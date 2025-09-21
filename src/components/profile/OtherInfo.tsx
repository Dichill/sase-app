"use client";

import { useState, Fragment } from "react";
import {
  DescriptionDetails,
  DescriptionList,
  DescriptionTerm,
} from "../ui/description-list";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Plus, Save, X, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AdditionalInfo {
  id: string;
  label: string;
  value: string;
  isEditing: boolean;
}

const createAdditionalInfo = (): AdditionalInfo => ({
  id: Math.random().toString(36), // id logic?
  label: "",
  value: "",
  isEditing: true,
});

const AdditionalInfo: React.FC = () => {
  const [additionalInfo, setAdditionalInfo] = useState<AdditionalInfo[]>([]);
  const [editBuffer, setEditBuffer] = useState<
    Partial<Record<string, { label: string; value: string }>>
  >({});

  //do save logic
  const saveAdditionalInfo = async (data: AdditionalInfo[]) => {
    return new Promise<void>((resolve) => {
      console.log("Saving additional info data", data);
      setTimeout(() => {
        resolve();
      }, 300);
    });
  };

  const handleChange = (
    id: string,
    field: keyof AdditionalInfo,
    value: string
  ): void => {
    setAdditionalInfo((prev) =>
      prev.map((info) => (info.id === id ? { ...info, [field]: value } : info))
    );
  };

  const addAdditionalInfo = () => {
    setAdditionalInfo((prev) => [...prev, createAdditionalInfo()]);
  };

  const removeAdditionalInfo = (id: string) => {
    setAdditionalInfo((prev) => prev.filter((item) => item.id !== id));
  };

  const saveItem = (id: string) => {
    setAdditionalInfo((prev) => {
      const next = prev.map((info) =>
        info.id === id ? { ...info, isEditing: false } : info
      );
      void saveAdditionalInfo(next);
      return next;
    });
    setEditBuffer((buf) => {
      const { [id]: _removed, ...rest } = buf;
      return rest;
    });
  };

  const editItem = (id: string) => {
    setAdditionalInfo((prev) => {
      const current = prev.find((i) => i.id === id);
      if (current) {
        setEditBuffer((buf) => ({
          ...buf,
          [id]: { label: current.label, value: current.value },
        }));
      }
      return prev.map((info) =>
        info.id === id ? { ...info, isEditing: true } : info
      );
    });
  };

  const cancelEdit = (id: string) => {
    setAdditionalInfo((prev) => {
      const original = editBuffer[id];
      if (!original) {
        // Treat as a new unsaved row: remove it by id
        return prev.filter((item) => item.id !== id);
      }
      return prev.map((info) =>
        info.id === id
          ? {
              ...info,
              label: original.label,
              value: original.value,
              isEditing: false,
            }
          : info
      );
    });
    setEditBuffer((buf) => {
      const { [id]: _removed, ...rest } = buf;
      return rest;
    });
  };

  return (
    <div className="rounded-lg border px-4 py-6">
      <div className="flex items-center justify-between border-b pb-3">
        <h2 className="text-lg font-medium">Additional Information</h2>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          aria-label="Add other information"
          onClick={() => {
            addAdditionalInfo();
          }}
          className="cursor-pointer"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-4 space-y-4">
        <DescriptionList>
          {additionalInfo
            .filter((i) => !i.isEditing)
            .map((info) => (
              <Fragment key={info.id}>
                <DescriptionTerm>{info.label}</DescriptionTerm>
                <DescriptionDetails>
                  <div className="flex items-center justify-between gap-3">
                    <span>{info.value}</span>
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
                            editItem(info.id);
                          }}
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault();
                            removeAdditionalInfo(info.id);
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

        {additionalInfo
          .filter((i) => i.isEditing)
          .map((info) => (
            <div key={info.id} className="flex gap-4 w-full border-t pt-5">
              <Input
                type="text"
                value={info.label}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  handleChange(info.id, "label", e.target.value);
                }}
                placeholder="Label"
                className="max-w-[24%]"
              />
              <Input
                type="text"
                value={info.value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  handleChange(info.id, "value", e.target.value);
                }}
                placeholder="Value"
                className="max-w-[76%]"
              />
              <div className="flex gap-1">
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="cursor-pointer"
                  aria-label="Save"
                  onClick={() => {
                    saveItem(info.id);
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
                    cancelEdit(info.id);
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

export default AdditionalInfo;
