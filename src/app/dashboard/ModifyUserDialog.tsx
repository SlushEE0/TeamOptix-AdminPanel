"use client";

import { ArrayElement } from "mongodb";
import toast from "react-hot-toast";

import { Tooltip } from "@nextui-org/react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { ChangeEvent, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
import { getPage, getPageSize } from "./pagination";
import { BaseRequestStates, t_Role } from "@/lib/types";
import { changeRole, modifyHours } from "./utils";

type user = ArrayElement<Exclude<Awaited<ReturnType<typeof getPage>>, null>>;

export default function ModifyUserDialog({
  user,
  updateData
}: {
  user: user;
  updateData: (newData: any) => void;
}) {
  const [time, SETtime] = useState({
    hours: parseInt(Math.floor(user.seconds / 3600).toFixed(0)),
    minutes: parseInt(Math.floor((user.seconds % 3600) / 60).toFixed(0))
  });
  const [role, SETrole] = useState<t_Role>(user.role);

  const handleSave = async function () {
    const seconds = time.hours * 3600 + time.minutes * 60;

    let res = await modifyHours(user._id, seconds);
    res |= await changeRole(user._id, role);

    if (res === BaseRequestStates.SUCCESS) {
      toast.success("Changes saved successfully");

      const newData = {
        ...user,
        seconds,
        role
      };

      updateData(newData);
    } else {
      toast.error("Failed to save changes");
    }
  };

  const getFormattedTime = function () {
    return `${time.hours} hours, ${time.minutes} minutes`;
  };

  const handleTimeChange = function (e: ChangeEvent<HTMLInputElement>) {
    const newTime = e.target.value;
    const key = e.target.name as keyof typeof time;

    let t: number;

    if (newTime) {
      try {
        t = parseInt(newTime);
      } catch (e) {
        return;
      }
    } else {
      t = 0;
    }

    SETtime((prev) => ({
      ...prev,
      [key]: t
    }));
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

        <div className="grid-cols-2 grid-rows-3">
          <div className="col-span-2 row-span-1">
            <label className="text-sm font-medium text-gray-700">
              Display Name
            </label>
            <Input
              value={user?.displayName || "Unknown"}
              disabled
              className="mt-1"
            />
          </div>
          <div className="row-span-1 grid grid-cols-2 grid-rows-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <Input
                value={user?.email || "Unknown"}
                disabled
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                User Role
              </label>
              <Select
                defaultValue={user.role}
                value={role}
                onValueChange={(value: t_Role) => SETrole(value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="certified">Certified</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Build Hours
              </label>
              {/* <Input
                type="number"
                value={(seconds / 3600).toFixed(2)}
                onChange={(e) => SETseconds(parseFloat(e.target.value) * 3600)}
                className="mt-1"
              /> */}
              <div className="flex gap-3">
                <Input
                  name="hours"
                  value={time.hours}
                  onChange={handleTimeChange}
                />
                <Input
                  name="minutes"
                  value={time.minutes}
                  onChange={handleTimeChange}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Current: {getFormattedTime()}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline">Cancel</Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
