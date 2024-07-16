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

export type t_UserRecord = {
  uid: string;
  email: string;
  emailVerified: boolean;
  phoneNumber?: string;
  photoURL?: string;
  customClaims?: {
    [key: string]: any;
  };
  displayName: string;
};

export type t_Code = {
  value: string;
  key: "checkInPassword" | "checkOutPassword" | "attendanceOverride";
};

export interface t_UserData extends t_MongoUserData, t_UserRecord {}

export enum AuthStates {
  AUTHORIZED,
  UNAUTHORIZED,
  UNKNOWN,
  ERROR
}

// Make tables modular

// export type t_DataTableColumn = {
//   key: string;
//   label: string;
//   allowsSorting?: boolean;
// };

// export type t_DataTableRow = (item: any) => any;
