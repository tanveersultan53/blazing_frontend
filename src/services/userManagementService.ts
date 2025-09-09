import { type AxiosResponse } from "axios";
import type { IUserList } from "@/pages/Users/interface";
import api from "./axiosInterceptor";

export const getUsers = (): Promise<AxiosResponse<{results: IUserList[]}>> => 
    api.get("/accounts/auth/users");