import type { AxiosResponse } from "axios";
import api from "./axiosInterceptor";
import type { AddPersonFormData } from "@/pages/AddPerson/interface";

export const createContact = (details: AddPersonFormData): Promise<AxiosResponse<AddPersonFormData>> =>
    api.post("/customer/api/contacts", details);

export const getContacts = ( type: string ): Promise<AxiosResponse<any>> =>
    api.get("/customer/api/contacts?type=" + type);

export const deleteContact = ( id: string ): Promise<AxiosResponse<any>> =>
    api.delete("/customer/api/contacts/" + id);