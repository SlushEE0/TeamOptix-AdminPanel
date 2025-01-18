import { UserRecord } from "firebase-admin/lib/auth/user-record";

export type With_id<t> = t & {
  _id: string;
};

export type t_TeamsObj = {
  num: number;
  name: string;
};

export type t_MongoUserData = {
  uid: string;
  lastCheckIn: number;
  seconds: number;
  meetingCount: number;
};

export type t_Code = {
  value: string;
  key: t_CodeType;
  startTimeMS: number;
  endTimeMS: number;
};

export type t_AccountCode = {
  code: string;
  type: "create";
};

export type t_CodeType =
  | "checkInPassword"
  | "checkOutPassword"
  | "attendanceOverride";

export type t_Role = "certified" | "member" | "admin" | "unknown";

export interface t_UserData
  extends t_MongoUserData,
    Omit<UserRecord, "toJSON"> {
  uid: string;
  role: t_Role;
  _id: string;
}

export enum AuthStates {
  ADMIN_AUTHORIZED,
  USER_AUTHORIZED,
  UNAUTHORIZED,
  UNKNOWN,
  ERROR,
  WRONG_PASSWORD
}

export enum AccountCreationStates {
  SUCCESS,
  IN_USE,
  INVALID_CODE,
  PASSWORD_MISMATCH,
  ERROR
}

export enum SessionStates {
  ADMIN,
  USER,
  EXPIRED
}

export enum CodeValidationStates {
  ERROR,
  SESSION_START,
  INVALID,
  SESSION_END,
  NO_SESSION,
  WRONG_TIME,
  ALREADY_STARTED
}

export enum PasswordResetStates {
  SUCCESS,
  NO_ACCOUNT,
  INVALID_EMAIL,
  ERROR
}

// Make tables modular

// export type t_DataTableColumn = {
//   key: string;
//   label: string;
//   allowsSorting?: boolean;
// };

// export type t_DataTableRow = (item: any) => any;
