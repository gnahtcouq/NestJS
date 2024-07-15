/* eslint-disable prettier/prettier */
export interface IUser {
  _id: string;
  name: string;
  email: string;
  permissions?: {
    _id: string;
    name: string;
    apiPath: string;
    module: string;
  }[];
}
