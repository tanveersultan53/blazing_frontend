import { type AxiosResponse } from "axios";
import type { IUserList } from "@/pages/Users/interface";
import api from "./axiosInterceptor";
import type { CreateUserFormData } from "@/pages/CreateUser/useCreateUser";
import type { ICallToAction, IEmailSettings, INewsletterInfo, IServiceSettings, ISettings, IUserDetails } from "@/pages/UserDetails/interface";
import type { ISocials } from "@/pages/UserDetails/interface";

export const getUsers = (): Promise<AxiosResponse<{ results: IUserList[] }>> =>
    api.get("/accounts/auth/users");

export const createUser = (user: CreateUserFormData): Promise<AxiosResponse<CreateUserFormData>> =>
    api.post("/accounts/auth/users", user);

export const getUserDetails = (id: string | number): Promise<AxiosResponse<IUserDetails>> =>
    api.get(`/accounts/auth/users/${id}`);

export const updateUser = ({ id, user }: { id: string | number, user: CreateUserFormData }): Promise<AxiosResponse<CreateUserFormData>> =>
    api.put(`/accounts/auth/users/${id}`, user);

export const getSocials = (id: string | number): Promise<AxiosResponse<ISocials>> =>
    api.get(`/accounts/admin/users/${id}/socials`);

export const updateSocials = ({ id, socials }: { id: string | number, socials: ISocials }): Promise<AxiosResponse<ISocials>> =>
    api.put(`/accounts/admin/users/${id}/socials`, socials);

export const getNewsletter = (id: string | number): Promise<AxiosResponse<INewsletterInfo>> =>
    api.get(`/accounts/admin/users/${id}/newsletter-info`);

export const updateNewsletter = ({ id, newsletter }: { id: string | number, newsletter: INewsletterInfo }): Promise<AxiosResponse<INewsletterInfo>> =>
    api.put(`/accounts/admin/users/${id}/newsletter-info`, newsletter);

export const getCallToAction = (id: string | number): Promise<AxiosResponse<ICallToAction>> =>
    api.get(`/accounts/admin/users/${id}/call-to-action`);

export const updateCallToAction = ({ id, callToAction }: { id: string | number, callToAction: ICallToAction }): Promise<AxiosResponse<ICallToAction>> =>
    api.put(`/accounts/admin/users/${id}/call-to-action`, callToAction);

export const getEmailSettings = (id: string | number): Promise<AxiosResponse<IEmailSettings>> =>
    api.get(`/accounts/admin/users/${id}/email-settings`);

export const updateEmailSettings = ({ id, emailSettings }: { id: string | number, emailSettings: IEmailSettings }): Promise<AxiosResponse<IEmailSettings>> =>
    api.put(`/accounts/admin/users/${id}/email-settings`, emailSettings);

export const getSettings = (id: string | number): Promise<AxiosResponse<ISettings>> =>
    api.get(`/accounts/admin/users/${id}/settings`);


export const getServiceSettings = (id: string | number): Promise<AxiosResponse<IServiceSettings>> =>
    api.get(`/accounts/admin/users/${id}/service-settings`);
