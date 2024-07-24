/* eslint-disable prettier/prettier */
export interface IUnionist {
  _id: string;
  id: string;
  name: string;
  email: string;
  permissions?: {
    _id: string;
    name: string;
    apiPath: string;
    module: string;
  }[];
  type: 'unionist';
}
