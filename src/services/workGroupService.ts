import axiosInstance from "@/lib/axios";
import type {
  CreateWorkGroupData,
  UpdateWorkGroupData,
  WorkGroupsResponse,
  WorkGroupResponse,
  AddMembersData,
  UpdateMemberData,
  WorkGroupMembersResponse,
  WorkGroupMemberResponse,
} from "@/types/workGroup";

export interface WorkGroupsParams {
  page?: number;
  per_page?: number;
  search?: string;
  owner_id?: string;
  active?: boolean;
}

export interface WorkGroupMembersParams {
  page?: number;
  per_page?: number;
}

// Work Groups CRUD
export const getWorkGroups = async (
  params: WorkGroupsParams = {},
): Promise<WorkGroupsResponse> => {
  const response = await axiosInstance.get<WorkGroupsResponse>("/work-groups", {
    params,
  });
  return response.data;
};

export const getWorkGroup = async (
  id: string,
): Promise<WorkGroupResponse> => {
  const response = await axiosInstance.get<WorkGroupResponse>(
    `/work-groups/${id}`,
  );
  return response.data;
};

export const createWorkGroup = async (
  data: CreateWorkGroupData,
): Promise<WorkGroupResponse> => {
  const response = await axiosInstance.post<WorkGroupResponse>(
    "/work-groups",
    data,
  );
  return response.data;
};

export const updateWorkGroup = async (
  id: string,
  data: UpdateWorkGroupData,
): Promise<WorkGroupResponse> => {
  const response = await axiosInstance.patch<WorkGroupResponse>(
    `/work-groups/${id}`,
    data,
  );
  return response.data;
};

export const deleteWorkGroup = async (
  id: string,
): Promise<{ message: string }> => {
  const response = await axiosInstance.delete<{ message: string }>(
    `/work-groups/${id}`,
  );
  return response.data;
};

// Work Group Members CRUD
export const getWorkGroupMembers = async (
  workGroupId: string,
  params: WorkGroupMembersParams = {},
): Promise<WorkGroupMembersResponse> => {
  const response = await axiosInstance.get<WorkGroupMembersResponse>(
    `/work-groups/${workGroupId}/members`,
    { params },
  );
  return response.data;
};

export const addWorkGroupMembers = async (
  workGroupId: string,
  data: AddMembersData,
): Promise<WorkGroupMembersResponse> => {
  const response = await axiosInstance.post<WorkGroupMembersResponse>(
    `/work-groups/${workGroupId}/members`,
    data,
  );
  return response.data;
};

export const getWorkGroupMember = async (
  workGroupId: string,
  memberId: string,
): Promise<WorkGroupMemberResponse> => {
  const response = await axiosInstance.get<WorkGroupMemberResponse>(
    `/work-groups/${workGroupId}/members/${memberId}`,
  );
  return response.data;
};

export const updateWorkGroupMember = async (
  workGroupId: string,
  memberId: string,
  data: UpdateMemberData,
): Promise<WorkGroupMemberResponse> => {
  const response = await axiosInstance.patch<WorkGroupMemberResponse>(
    `/work-groups/${workGroupId}/members/${memberId}`,
    data,
  );
  return response.data;
};

export const deleteWorkGroupMember = async (
  workGroupId: string,
  memberId: string,
): Promise<{ message: string }> => {
  const response = await axiosInstance.delete<{ message: string }>(
    `/work-groups/${workGroupId}/members/${memberId}`,
  );
  return response.data;
};
