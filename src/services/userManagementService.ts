import { type AxiosResponse } from "axios";
import type { IUserList } from "@/pages/Users/interface";
import api from "./axiosInterceptor";
import type { CreateUserFormData } from "@/pages/CreateUser/useCreateUser";

export const getUsers = (): Promise<AxiosResponse<{results: IUserList[]}>> => 
    api.get("/accounts/auth/users");

export const createUser = (user: CreateUserFormData): Promise<AxiosResponse<CreateUserFormData>> => 
    api.post("/accounts/auth/users", user);