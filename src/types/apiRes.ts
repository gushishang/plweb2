// @ts-nocheck
// i WILL finish it one day
interface ApiMap {}

type ApiRes<Status extends number, T> = Status extends 200
  ? { Status: Status; Data: T; Message: string }
  : {
      Status: number;
      Data: null;
      Message: string;
    };
