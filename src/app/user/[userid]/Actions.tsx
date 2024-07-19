"use client";

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

import { With_id, t_UserData } from "@/lib/types";

export default function Actions({ data }: { data: With_id<t_UserData> }) {
  return (
    <div className="flex justify-end items-start p-5 size-full">
      <Card className="h-full w-80 p-5 flex flex-wrap items-start justify-center">
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
                Change user's authorization level. Changing to 'admin' will
                allow user access to this admin panel
              </DialogDescription>
            </DialogHeader>
            <section aria-label="main-dialog">
              <Select>
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
              <Button variant="destructive">Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  );
}
