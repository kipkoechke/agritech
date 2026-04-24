export interface WorkGroup {
  id: string;
  code: string;
  name: string;
  description: string;
  active: boolean | null;
  members: number;
  owner_id: string;
  plucker_rate?: number;
  supervisor_rate?: number;
  owner?: {
    id: string;
    name: string;
  };
  cluster?: {
    id: string;
    name: string;
    code?: string;
  };
  farm?: {
    id: string;
    name: string;
  };
  date?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateWorkGroupData {
  name: string;
  description: string;
  active: boolean;
  owner_id: string;
  plucker_rate?: number;
  supervisor_rate?: number;
  cluster_id?: string;
}

export interface UpdateWorkGroupData {
  name?: string;
  description?: string;
  active?: boolean;
  owner_id?: string;
  plucker_rate?: number;
  supervisor_rate?: number;
  cluster_id?: string;
}

export interface WorkGroupPagination {
  current_page: number;
  next_page: number | null;
  per_page: number;
  first_page: number;
  last_page: number;
  total_pages: number;
  total_items: number;
}

export interface WorkGroupsResponse {
  data: WorkGroup[];
  pagination: WorkGroupPagination;
}

export interface WorkGroupResponse {
  data: WorkGroup;
}

export interface WorkGroupMember {
  id: string;
  active: boolean;
  work_group_id: string;
  farm_worker: {
    id: string;
    name: string;
    phone: string;
  };
  created_at: string;
  updated_at: string;
}

export interface AddMembersData {
  members: string[];
}

export interface UpdateMemberData {
  role?: string;
}

export interface WorkGroupMembersResponse {
  data: WorkGroupMember[];
  pagination: WorkGroupPagination;
}

export interface WorkGroupMemberResponse {
  data: WorkGroupMember;
}
