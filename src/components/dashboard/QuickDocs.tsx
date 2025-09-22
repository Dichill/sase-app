"use client";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { Folder, FileText, Link, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const quickAccess = [
  {
    name: "Documents",
    icon: <Folder className="w-20 h-20" />,
    href: "/listings",
  },
  {
    name: "Forms",
    icon: <FileText className="w-20 h-20" />,
    href: "/listings",
  },
  {
    name: "Templates",
    icon: <Link className="w-20 h-20" />,
    href: "/listings",
  },
];
// Icon type mapping
const iconTypes = {
  folder: { icon: <Folder className="w-4 h-4" />, component: Folder },
  file: { icon: <FileText className="w-4 h-4" />, component: FileText },
  link: { icon: <Link className="w-4 h-4" />, component: Link },
};

const QuickDocs = () => {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState("folder");
  const [quickAccessItems, setQuickAccessItems] = useState(quickAccess);
  const [formData, setFormData] = useState({
    name: "",
    url: "",
  });
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleAdd = () => {
    if (!formData.name.trim() || !formData.url.trim()) {
      alert("Please fill in all fields");
      return;
    }

    // Get the selected icon component
    const IconComponent =
      iconTypes[selectedType as keyof typeof iconTypes].component;

    // Create new quick access item
    const newItem = {
      name: formData.name,
      icon: <IconComponent className="w-20 h-20" />,
      href: formData.url,
    };

    // Add to the list
    setQuickAccessItems([...quickAccessItems, newItem]);

    // Reset form
    setFormData({ name: "", url: "" });
    setSelectedType("folder");
    setIsPopoverOpen(false);

    console.log("Added new quick access item:", newItem);
  };

  return (
    <div>
      <div className="w-full px-18">
        {/* Outer box */}
        <div className="w-full rounded-lg px-4 py-6 ">
          <h2 className="text-lg font-medium py-4">Quick Access</h2>
          <div className="flex items-center space-x-2 my-4">
            {quickAccessItems.map((item, index) => (
              <Button
                key={index}
                type="button"
                variant="ghost"
                className="flex flex-col items-center gap-2 hover:bg-transparent"
                onClick={() => {
                  router.push(item.href);
                }}
              >
                <div className="bg-gray-100 hover:bg-gray-200 rounded-xl p-4 cursor-pointer flex items-center justify-center">
                  {item.icon}
                </div>
                <div className="text-sm cursor-pointer font-medium">
                  {item.name}
                </div>
              </Button>
            ))}

            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="flex flex-col items-center gap-2 hover:bg-transparent z-50"
                >
                  <div className="bg-gray-200 hover:bg-gray-300 rounded-xl p-4 cursor-pointer flex items-center justify-center border-dashed border border-gray-400">
                    <Plus className="w-20 h-20" />
                  </div>
                  <div className="text-sm cursor-pointer font-medium">Add</div>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 z-50 bg-gray-50 rounded-lg border p-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="leading-none font-medium">
                      Add Quick Access
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      Add a quick access item to your dashboard.
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value });
                        }}
                        placeholder="Enter name"
                        className="col-span-2 h-8"
                      />
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="type">Type</Label>
                      <Select
                        value={selectedType}
                        onValueChange={setSelectedType}
                      >
                        <SelectTrigger className="col-span-2 h-8 w-full">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="folder">
                            <div className="flex items-center gap-2">
                              {iconTypes.folder.icon}
                              <span>Folder</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="file">
                            <div className="flex items-center gap-2">
                              {iconTypes.file.icon}
                              <span>File</span>
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
                        value={formData.url}
                        onChange={(e) => {
                          setFormData({ ...formData, url: e.target.value });
                        }}
                        placeholder="Enter URL or path"
                        className="col-span-2 h-8"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsPopoverOpen(false);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleAdd}>
                        Add Item
                      </Button>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickDocs;
