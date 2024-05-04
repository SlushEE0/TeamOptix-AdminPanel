export type t_TeamsObj = {
  num: number;
  name: string;
};

export type t_UserData = {
  _id: string;
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

export interface t_UsersTableData extends t_UserData, t_UserRecord {}
export interface t_CodesTableData extends t_Code {
  _id: string;
}

// Make tables modular

// export type t_DataTableColumn = {
//   key: string;
//   label: string;
//   allowsSorting?: boolean;
// };

// export type t_DataTableRow = (item: any) => any;
