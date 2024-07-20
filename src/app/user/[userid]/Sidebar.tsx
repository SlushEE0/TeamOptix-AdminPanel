"use client";

import { useState } from "react";
import toast from "react-hot-toast";

import { User } from "@nextui-org/react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";

import { With_id, t_Role, t_UserData } from "@/lib/types";
import { changeRole } from "./utils";
import { unixToFancyDate } from "@/lib/utils";

type t_RoleForm = {
  role: t_Role;
  confirm: boolean;
};

export default function Sidebar({ data }: { data: With_id<t_UserData> }) {
  const [roleForm, SETroleForm] = useState<t_RoleForm>({
    role: "member",
    confirm: false
  });

  const onRoleSave = async function () {
    if (!roleForm) {
      toast.custom("Are you sure?");
      return SETroleForm((curr) => {
        return { ...curr, confirm: true };
      });
    }

    const loader = toast.loading(`Updating`);

    await changeRole(roleForm.role, data.uid);

    toast.remove(loader);
    toast.success(`${data.displayName} is now '${roleForm.role}'`);
  };

  const onRoleChange = function (role: t_Role) {
    SETroleForm((curr) => {
      return {
        ...curr,
        role
      };
    });
  };

  return (
    <Card className="h-full w-80 p-5 flex flex-wrap items-start justify-center ml-auto">
      <User
        description={
          <a
            href={`mailto:${data.email}`}
            target="_blank"
            className="text-blue-500">
            {data.email}
          </a>
        }
        avatarProps={{
          radius: "full",
          src: data.photoURL,
          size: "lg"
        }}
        name={data.displayName}></User>
      <Dialog>
        <DialogTrigger className="self-end">
          <div className={buttonVariants({ variant: "default" })}>
            Change Role
          </div>
        </DialogTrigger>
        <DialogContent className="w-max h-80">
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Change user's authorization level. Changing to 'admin' will allow
              user access to this admin panel
            </DialogDescription>
          </DialogHeader>
          <section aria-label="main-dialog">
            <Select onValueChange={onRoleChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Roles</SelectLabel>
                  <SelectItem value="certified">Certified</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </section>
          <DialogFooter>
            <Button
              onClick={onRoleSave}
              variant={roleForm.confirm ? "destructive" : "default"}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
