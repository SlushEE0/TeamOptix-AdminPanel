import mongoose, { connect, Schema, model, disconnect, Model } from "mongoose";
import { MONGO_URL } from "../lib/config";
import { t_Code, t_MongoUserData } from "../lib/types";

connect(MONGO_URL || "").catch((err) => {
  console.error("Error connecting to MongoDB:");
  console.error(err);
});

// Schema.ObjectId.get((id) => (!id ? id : id.toString()));

const schema_Users = new Schema<t_MongoUserData>({
  uid: String,
  lastCheckIn: Number,
  seconds: Number,
  meetingCount: Number
});

const schema_Codes = new Schema<t_Code>({
  key: String,
  value: String
});

const models = {
  User: null as any as Model<t_MongoUserData>,
  Code: null as any as Model<t_Code>
};

// model("MODELNAME") throws error if model does not exist
try {
  models.User = model<t_MongoUserData>("User");
  models.Code = model<t_Code>("Code");
} catch (err) {
  models.User = model("User", schema_Users);
  models.Code = model("Code", schema_Codes);
}

export default models;

export async function mongoDisconnect() {
  disconnect();
}

// async function updateMongoUrl(userToken?: string) {
//   let cpy_userToken = userToken || "";

//   if (!userToken) {
//     const user = await getCurrentUser();

//     if (!user) {
//       console.error("Attempted to call updateMongoUrl with no logged in user");
//       return;
//     }

//     cpy_userToken = await user.getIdToken();
//   }

//   const new_mongoUrl: string = await fetch(BASE_FETCH_URL + "/api/db", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json"
//     },

//     body: JSON.stringify({
//       auth: cpy_userToken
//     })
//   }).then((res) => res.json());

//   console.log(new_mongoUrl);

//   return new_mongoUrl;
// }
