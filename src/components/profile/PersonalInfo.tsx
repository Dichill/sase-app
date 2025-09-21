"use client";
import { useState, useEffect } from "react";
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Save, X } from "lucide-react";
import { ca } from "zod/v4/locales";
import { invoke } from "@tauri-apps/api/core";
import { get } from "http";

interface UserProfile {
  name: string;
  dateOfBirth: string; // Changed to string for easier input handling
  gender: string;
  address: string;
  phoneNumber: string;
  email: string;
}

interface ProfileProps {
  user: UserProfile;
}

const PersonalInfo: React.FC<ProfileProps> = ({ user: initialUser }) => {
  const [user, setUser] = useState<UserProfile>(initialUser);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [originalUser, setOriginalUser] = useState<UserProfile>(initialUser);

  // TEST: READ operation; get profile from db
  useEffect(() => {
    getUserProfile();
  }, []);

  const getUserProfile = async () => {
    try {
      const profile: UserProfile[] = await invoke("get_user_profile");
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  }

  // Helper function to format date for input field (YYYY-MM-DD)
  const formatDateForInput = (dateString: string): string => {
    try {
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
      }

      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch {
      return dateString;
    }
  };

  const formatDateForDisplay = (dateString: string): string => {
    try {
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        const [year, month, day] = dateString.split("-");
        const date = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day)
        );
        return date.toLocaleDateString();
      }

      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const handleChange = (field: keyof UserProfile, value: string) => {
    setUser((prev) => ({ ...prev, [field]: value }));
  };

  // Mock UPDATE operation, save changes to profile to db
  const saveProfile = async () => {
    console.log("DATABASE UPDATE: Updating user profile:", user);

    // Validation
    if (!user.name.trim() || !user.email.trim()) {
      alert("Name and Email are required.");
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      setOriginalUser(user);
      setIsEditing(false);
      console.log("Profile UPDATE successful.");
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to save profile. Please try again.");
    }
  };

  const startEditing = () => {
    setOriginalUser(user);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setUser(originalUser);
    setIsEditing(false);
  };
  return (
    <div className="rounded-lg border px-4 py-6">
      <div className="flex items-center justify-between border-b pb-3">
        <h2 className="text-lg font-medium">Personal Information</h2>
        {!isEditing ? (
          <Pencil className="h-4 w-4 cursor-pointer" onClick={startEditing} />
        ) : (
          <div className="flex gap-1">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="cursor-pointer"
              aria-label="Save"
              onClick={() => {
                void saveProfile();
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
              onClick={cancelEdit}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {!isEditing ? (
        <DescriptionList>
          <DescriptionTerm>Name</DescriptionTerm>
          <DescriptionDetails>{user.name}</DescriptionDetails>

          <DescriptionTerm>Date of Birth</DescriptionTerm>
          <DescriptionDetails>
            {formatDateForDisplay(user.dateOfBirth)}
          </DescriptionDetails>

          <DescriptionTerm>Gender</DescriptionTerm>
          <DescriptionDetails>{user.gender}</DescriptionDetails>

          <DescriptionTerm>Address</DescriptionTerm>
          <DescriptionDetails>{user.address}</DescriptionDetails>

          <DescriptionTerm>Phone Number</DescriptionTerm>
          <DescriptionDetails>{user.phoneNumber}</DescriptionDetails>

          <DescriptionTerm>Email</DescriptionTerm>
          <DescriptionDetails>{user.email}</DescriptionDetails>
        </DescriptionList>
      ) : (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-1 block">Name</label>
              <Input
                value={user.name}
                onChange={(e) => {
                  handleChange("name", e.target.value);
                }}
                placeholder="Full name"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                Date of Birth
              </label>
              <Input
                type="date"
                value={formatDateForInput(user.dateOfBirth)}
                onChange={(e) => {
                  handleChange("dateOfBirth", e.target.value);
                }}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Gender</label>
              <Select
                value={user.gender}
                onValueChange={(value) => {
                  handleChange("gender", value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                  <SelectItem value="Prefer not to say">
                    Prefer not to say
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                Phone Number
              </label>
              <Input
                value={user.phoneNumber}
                onChange={(e) => {
                  handleChange("phoneNumber", e.target.value);
                }}
                placeholder="Phone number"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-sm font-medium mb-1 block">Address</label>
              <Input
                value={user.address}
                onChange={(e) => {
                  handleChange("address", e.target.value);
                }}
                placeholder="Full address"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-sm font-medium mb-1 block">Email</label>
              <Input
                type="email"
                value={user.email}
                onChange={(e) => {
                  handleChange("email", e.target.value);
                }}
                placeholder="Email address"
                required
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalInfo;
