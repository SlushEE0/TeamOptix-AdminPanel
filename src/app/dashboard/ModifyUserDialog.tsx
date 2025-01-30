"use client";

import { ArrayElement } from "mongodb";

import { Tooltip } from "@nextui-org/react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
import { getPage } from "./pagination";
import { BaseRequestStates, t_Role } from "@/lib/types";
import { changeRole, modifyHours } from "./utils";
import toast from "react-hot-toast";
import {
  SWRInfiniteKeyedMutator,
  SWRInfiniteMutatorOptions
} from "swr/dist/infinite";

type user = ArrayElement<Exclude<Awaited<ReturnType<typeof getPage>>, null>>;

export default function get1Array({
  user,
  index,
  updateData
}: {
  user: user;
  index: number;
  updateData: (data: user, index: number) => void;
}) {
  const [seconds, SETseconds] = useState(user.seconds);
  const [role, SETrole] = useState<t_Role>(user.role);

  const handleSave = async function () {
    let res = await modifyHours(user._id, seconds);
    res |= await changeRole(user._id, role);

    if (res === BaseRequestStates.SUCCESS) {
      toast.success("Changes saved successfully");

      const newData = {
        ...user,
        seconds,
        role
      };

      updateData(newData, index);
    } else {
      toast.error("Failed to save changes");
    }
  };

  const formatHours = (seconds: number) => {
    const hours = (seconds / 3600).toFixed(1);
    return `${hours} hours`;
  };

  return (
    <Dialog>
      <DialogTrigger>
        <Tooltip content="Edit User">
          <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
            <Pencil />
          </span>
        </Tooltip>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User Data</DialogTitle>
          <DialogDescription>Modify "{user.displayName}"</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Display Name
              </label>
              <Input value={user.displayName} disabled className="mt-1" />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <Input value={user.email} disabled className="mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Total Hours
              </label>
              <Input
                type="number"
                value={(seconds / 3600).toFixed(2)}
                onChange={(e) => SETseconds(parseFloat(e.target.value) * 3600)}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Current: {formatHours(user.seconds)}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                User Role
              </label>
              <Select
                value={role}
                onValueChange={(value: t_Role) => SETrole(value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="certified">Certified</SelectItem>
                  <SelectItem value="member">Guest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline">Cancel</Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
