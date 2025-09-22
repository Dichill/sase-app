"use client";

import { useState, Fragment, useEffect } from "react";
import {
  DescriptionDetails,
  DescriptionList,
  DescriptionTerm,
} from "../ui/description-list";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Plus, Save, X, MoreVertical, AlertCircleIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { get } from "http";
import { invoke } from "@tauri-apps/api/core";
import { Alert, AlertTitle } from "../ui/alert";

interface AdditionalInfoItem {
  id: string;
  label: string;
  value: string;
  isEditing: boolean;
  isNew?: boolean;
}

const createNewItem = (): AdditionalInfoItem => ({
  id: `temp_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
  label: "",
  value: "",
  isEditing: true,
  isNew: true,
});

const AdditionalInfo: React.FC = () => {
  const [items, setItems] = useState<AdditionalInfoItem[]>([]);

  // TEST: READ operation; get additional info from db
  useEffect(() => {
    // console.log("DATABASE READ: Fetching additional info on component mount.");
    void getAdditionalInfo();
  }, []);

  const getAdditionalInfo = async () => {
    try {
      const info: AdditionalInfoItem[] = await invoke("get_additional_info");
      setItems(info);
    } catch (error) {
      console.error("Failed to fetch additional info:", error);
    }
  };

  const updateItem = (id: string, updates: Partial<AdditionalInfoItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const handleChange = (
    id: string,
    field: keyof AdditionalInfoItem,
    value: string
  ) => {
    updateItem(id, { [field]: value });
  };

  const addItem = () => {
    setItems((prev) => [...prev, createNewItem()]);
  };

  // TEST: DELETE operation from db
  const deleteItem = async (id: string) => {
    console.log(`DATABASE DELETE: Deleting item with id: ${id}`);
    await invoke("delete_additional_info", { id: Number(id) });
    setItems((prev) => prev.filter((item) => item.id !== id));
    console.log("DELETE successful.");
  };

  // TEST: UPSERT (CREATE/UPDATE) operation from db
  const saveItem = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item || !item.label.trim() || !item.value.trim()) {
      <Alert variant="destructive">
        <AlertCircleIcon />
        <AlertTitle>Both Label and Value fields are required.</AlertTitle>
      </Alert>;
      return;
    }

    const numId = Number(id);

    try {
      const updated: boolean = await invoke("set_additional_info", {
        id: numId,
        info: item,
      });
      if (!updated) {
        await invoke("set_additional_info", { info: item });
      }
      updateItem(id, { isEditing: false, isNew: false });
    } catch (error) {
      await invoke("add_additional_info", { info: item });
      updateItem(id, { isEditing: false, isNew: false });
    }
  };

  const editItem = (id: string) => {
    updateItem(id, { isEditing: true });
  };

  const cancelEdit = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (item?.isNew) {
      setItems((prev) => prev.filter((i) => i.id !== id));
    } else {
      updateItem(id, { isEditing: false });
    }
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
          onClick={addItem}
          className="cursor-pointer"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-4 space-y-4">
        <DescriptionList>
          {items
            .filter((item) => !item.isEditing)
            .map((item) => (
              <Fragment key={item.id}>
                <DescriptionTerm>{item.label}</DescriptionTerm>
                <DescriptionDetails>
                  <div className="flex items-center justify-between gap-3">
                    <span>{item.value}</span>
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
                            editItem(item.id);
                          }}
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault();
                            void deleteItem(item.id);
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

        {items
          .filter((item) => item.isEditing)
          .map((item) => (
            <div key={item.id} className="flex gap-4 w-full border-t pt-5">
              <Input
                type="text"
                value={item.label}
                onChange={(e) => {
                  handleChange(item.id, "label", e.target.value);
                }}
                placeholder="Label"
                className="max-w-[24%]"
                required
              />
              <Input
                type="text"
                value={item.value}
                onChange={(e) => {
                  handleChange(item.id, "value", e.target.value);
                }}
                placeholder="Value"
                className="max-w-[76%]"
                required
              />
              <div className="flex gap-1">
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="cursor-pointer"
                  aria-label="Save"
                  onClick={() => void saveItem(item.id)}
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
                    cancelEdit(item.id);
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
