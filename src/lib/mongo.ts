import { CursorFlag, Db, FindCursor, MongoClient, WithId } from "mongodb";
import { BASE_FETCH_URL, MONGO_URL } from "./config";
import { getCurrentUser } from "./firebase";

const mongoUrl = MONGO_URL;
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

type mongoFunction = (client: MongoClient) => any;
export async function mongo_rawRequest(mongoFunction: mongoFunction) {
  let ret: any;

  await init_mongo();
  const client = await mongoClient.connect();

  ret = await mongoFunction(client);

  //will eventually make using work...

  return {
    ret,
    [Symbol.dispose]: async () => {
      await setTimeout(async () => await mongoClient.close(), 0);
    }
  };
}

export async function mongo_getLimitedUsersCol(limit: number, skip = 0) {
  return mongo_rawRequest((client) => {
    return client.db().collection("users").find(
      {},
      {
        limit
      }
    );
  });
}

export async function mongo_cursorToJSON(cursor: FindCursor<WithId<Document>>) {
  return (await cursor.toArray()).map((item) => {
    return {
      ...item,
      _id: item._id.toJSON()
    };
  });
}

async function init_mongo() {
  let connectionUrl = mongoUrl;
  if (!connectionUrl) {
    connectionUrl = await updateMongoUrl();
  }

  mongoClient = !mongoClient
    ? new MongoClient(connectionUrl || "")
    : mongoClient;
}

export class MongoPaginatedResults {
  $db;
  $searched: number = 0;
  $resultsPerPage;
  $pages: any[] = [];
  $currentPage = -1;

  constructor(db: Db, resultsPerPage: number) {
    this.$db = db;
    this.$resultsPerPage = resultsPerPage;
  }

  async getPage(pageNumber: number) {
    pageNumber -= 1;
    if (pageNumber < 0) pageNumber = 0;

    this.$currentPage = pageNumber;

    if (pageNumber < this.$pages.length) {
      return mongo_cursorToJSON(this.$pages[pageNumber]);
    }

    const ret = await mongo_getLimitedUsersCol(
      this.$resultsPerPage,
      this.$searched
    );

    this.$searched += this.$resultsPerPage;
    this.$pages[pageNumber] = ret.ret;

    return mongo_cursorToJSON(ret.ret);
  }
}
