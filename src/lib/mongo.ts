import { Db, MongoClient } from "mongodb";
import { baseFetchURL, mongoURL } from "./config";
import { getCurrentUser } from "./firebase";

const mongoUrl = mongoURL;
let mongoClient: MongoClient;

//mostly redundant
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

  const new_mongoUrl: string = await fetch(baseFetchURL + "/api/db", {
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

type mongoFunction = (client: Db) => any;
export async function getMongoData(mongoFunction: mongoFunction) {
  let data: any;
  let client: MongoClient;

  try {
    await init_mongo();
    // console.log(mongoClient)
    client = await mongoClient.connect();

    const db = await mongoClient.db();
    data = await mongoFunction(db);

    await client.close();
  } catch (err) {
    console.warn(err);
  } finally {
    return data;
  }
}

async function init_mongo() {
  let connectionUrl = mongoUrl;
  if (!connectionUrl) {
    connectionUrl = await updateMongoUrl();
  }

  mongoClient = new MongoClient(connectionUrl || "");
}
