"use server";

import { mongoConnect, mongoDisconnect } from "@/db/mongo";

//might add more stuff later

export async function connect() {
  mongoConnect();
}

export async function disconnect() {
  mongoDisconnect();
}
