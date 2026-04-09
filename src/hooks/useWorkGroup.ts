import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getWorkGroups,
  getWorkGroup,
  createWorkGroup,
  updateWorkGroup,
  deleteWorkGroup,
  getWorkGroupMembers,
  addWorkGroupMembers,
  getWorkGroupMember,
  updateWorkGroupMember,
  deleteWorkGroupMember,
  WorkGroupsParams,
  WorkGroupMembersParams,
} from "@/services/workGroupService";
import type {
  CreateWorkGroupData,
  UpdateWorkGroupData,
  AddMembersData,
  UpdateMemberData,
} from "@/types/workGroup";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/utils/getApiError";

// Work Groups hooks
export const useWorkGroups = (params: WorkGroupsParams = {}) => {
  return useQuery({
    queryKey: ["work-groups", params],
    queryFn: () => getWorkGroups(params),
  });
};

export const useWorkGroup = (id: string) => {
  return useQuery({
    queryKey: ["work-groups", id],
    queryFn: () => getWorkGroup(id),
    enabled: !!id,
  });
};

export const useCreateWorkGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWorkGroupData) => createWorkGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-groups"] });
      toast.success("Work group created successfully");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to create work group"));
    },
  });
};

export const useUpdateWorkGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWorkGroupData }) =>
      updateWorkGroup(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["work-groups"] });
      queryClient.invalidateQueries({
        queryKey: ["work-groups", variables.id],
      });
      toast.success("Work group updated successfully");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to update work group"));
    },
  });
};

export const useDeleteWorkGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteWorkGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-groups"] });
      toast.success("Work group deleted successfully");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to delete work group"));
    },
  });
};

// Work Group Members hooks
export const useWorkGroupMembers = (
  workGroupId: string,
  params: WorkGroupMembersParams = {},
) => {
  return useQuery({
    queryKey: ["work-group-members", workGroupId, params],
    queryFn: () => getWorkGroupMembers(workGroupId, params),
    enabled: !!workGroupId,
  });
};

export const useWorkGroupMember = (workGroupId: string, memberId: string) => {
  return useQuery({
    queryKey: ["work-group-members", workGroupId, memberId],
    queryFn: () => getWorkGroupMember(workGroupId, memberId),
    enabled: !!workGroupId && !!memberId,
  });
};

export const useAddWorkGroupMembers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workGroupId,
      data,
    }: {
      workGroupId: string;
      data: AddMembersData;
    }) => addWorkGroupMembers(workGroupId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["work-group-members", variables.workGroupId],
      });
      toast.success("Members added successfully");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to add members"));
    },
  });
};

export const useUpdateWorkGroupMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workGroupId,
      memberId,
      data,
    }: {
      workGroupId: string;
      memberId: string;
      data: UpdateMemberData;
    }) => updateWorkGroupMember(workGroupId, memberId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["work-group-members", variables.workGroupId],
      });
      toast.success("Member updated successfully");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to update member"));
    },
  });
};

export const useDeleteWorkGroupMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workGroupId,
      memberId,
    }: {
      workGroupId: string;
      memberId: string;
    }) => deleteWorkGroupMember(workGroupId, memberId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["work-group-members", variables.workGroupId],
      });
      toast.success("Member removed successfully");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to remove member"));
    },
  });
};
