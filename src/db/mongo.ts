import { Db, FindCursor, MongoClient, WithId, Document } from "mongodb";
import { BASE_FETCH_URL, MONGO_URL } from "../lib/config";
import { getCurrentUser } from "./firebase";
import { With_id, t_Code, t_MongoUserData } from "../lib/types";

const mongoUrl = MONGO_URL;
let mongoClient: MongoClient;

//mostly redundant

type mongoFunction<T> = (db: Db) => T;
export async function mongoReq<T>(mongoFunction: mongoFunction<T>) {
  await init_mongo();
  const db = (await mongoClient.connect()).db();

  const ret = await mongoFunction(db);

  //allows us to use the 'using' keyword
  return {
    ret,
    [Symbol.dispose]: () => {
      
    }
  };
}
export async function init_mongo() {
  let connectionUrl = mongoUrl;
  if (!connectionUrl) {
    connectionUrl = await updateMongoUrl();
  }

  mongoClient = !mongoClient
    ? new MongoClient(connectionUrl || "")
    : mongoClient;
}

export async function mongo_parseFindCursor<T>(cursor: FindCursor<WithId<Document>>) {
  // await mongoClient.connect();

  const data = (await cursor.toArray()).map((item) => {
    return {
      ...item,
      _id: item._id.toJSON()
    } as With_id<T>;
  })

  // mongoClient.close()

  return data
}

export async function mongo_parseDocId<T>(doc: WithId<Document>) {
  return doc ? {
    ...doc,
    _id: doc._id.toJSON()
  } as With_id<T> : null
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
  using usingCol = await mongoReq((db) => {
    return mongo_parseFindCursor(db.collection("users").find(
      {},
      {
        skip,
        limit
      }
    ))
  }); 
  
  return usingCol.ret;
}

export async function getCodesCol() {
  using usingCol = await (await mongoReq((db) => {
    return mongo_parseFindCursor<t_Code>(db.collection("settings").find({}));
  }));

  return usingCol.ret;
}

export async function createCode(code: t_Code) {
  using _ = await mongoReq((db) => {
    db.collection("settings").insertOne(code);
  });
}

export async function findAndDeleteCode(codeName: string) {
  using usingCol = await mongoReq((db) => {
    return db.collection("settings").findOneAndDelete({
      value: codeName
    });
  })


  return usingCol.ret ? mongo_parseDocId<t_Code>(usingCol.ret) : null;
}

export async function getUsersCol() {
  using usingCol = await mongoReq((db) => {
    return mongo_parseFindCursor<t_MongoUserData>(db.collection("users").find(
      {},
      {
        limit: 50
      }
    ));
  });

  return usingCol.ret;
}