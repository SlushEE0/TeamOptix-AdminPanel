import { Db, FindCursor, MongoClient, WithId, Document } from "mongodb";
import { BASE_FETCH_URL, MONGO_URL } from "../lib/config";
import { getCurrentUser } from "./firebase";
import { With_id, t_Code, t_MongoUserData } from "../lib/types";

const mongoUrl = MONGO_URL;
let mongoClient: MongoClient;

export async function mongoConnect() {
  let connectionUrl = mongoUrl;
  if (!connectionUrl) {
    connectionUrl = await updateMongoUrl();
  }

  mongoClient = mongoClient || new MongoClient(connectionUrl || "");

  return mongoClient.connect();
}

type mongoFunction<T> = (db: Db) => T;
export async function mongoReq<T>(mongoFunction: mongoFunction<T>) {
  const db = (await mongoConnect()).db();

  return mongoFunction(db);
}

export async function mongoDisconnect() {
  mongoClient.close();
}

export async function mongo_parseFindCursor<T>(
  cursor: FindCursor<WithId<Document>>
) {
  const data = (await cursor.toArray()).map((item) => {
    return {
      ...item,
      _id: item._id.toJSON()
    } as With_id<T>;
  });

  // mongoClient.close()

  return data;
}

export async function mongo_parseDocId<T>(doc: WithId<T>) {
  return {
    ...doc,
    _id: doc._id.toJSON()
  } as With_id<T>;
}

async function updateMongoUrl(userToken?: string) {
  let cpy_userToken = userToken || "";

  if (!userToken) {
    const user = await getCurrentUser();

    if (!user) {
      console.error("Attempted to call updateMongoUrl with no logged in user");
      return;
    }

    cpy_userToken = await user.getIdToken();
  }

  const new_mongoUrl: string = await fetch(BASE_FETCH_URL + "/api/db", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify({
      auth: cpy_userToken
    })
  }).then((res) => res.json());

  console.log(new_mongoUrl);

  return new_mongoUrl;
}

export async function mongo_getLimitedUsersCol(limit: number, skip?: number) {
  return mongoReq((db) => {
    return mongo_parseFindCursor(
      db.collection("users").find(
        {},
        {
          skip,
          limit
        }
      )
    );
  });
}

export async function getCodesCol() {
  return mongoReq((db) => {
    return mongo_parseFindCursor<t_Code>(db.collection("settings").find({}));
  });
}

export async function createCode(code: t_Code) {
  return mongoReq((db) => {
    db.collection("settings").insertOne(code);
  });
}

export async function findAndDeleteCode(codeName: string) {
  const doc = await mongoReq((db) => {
    return db.collection("settings").findOneAndDelete({
      value: codeName
    }) as Promise<WithId<t_Code> | null>;
  });

  return doc ? mongo_parseDocId(doc) : null;
}

export async function getUsersCol() {
  return mongoReq((db) => {
    return mongo_parseFindCursor<t_MongoUserData>(
      db.collection("users").find(
        {},
        {
          limit: 50
        }
      )
    );
  });
}
