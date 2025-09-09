import { type AxiosResponse } from "axios";
import type { IUserList } from "@/pages/Users/interface";
import api from "./axiosInterceptor";
import type { CreateUserFormData } from "@/pages/CreateUser/useCreateUser";
import type { IUserDetails } from "@/pages/UserDetails/interface";

export const getUsers = (): Promise<AxiosResponse<{ results: IUserList[] }>> =>
    api.get("/accounts/auth/users");

export const createUser = (user: CreateUserFormData): Promise<AxiosResponse<CreateUserFormData>> =>
    api.post("/accounts/auth/users", user);

export const getUserDetails = (id: string | number): Promise<AxiosResponse<IUserDetails>> =>
    api.get(`/accounts/auth/users/${id}`);

export const updateUser = ({ id, user }: { id: string | number, user: CreateUserFormData }): Promise<AxiosResponse<CreateUserFormData>> =>
    api.put(`/accounts/auth/users/${id}`, user);
