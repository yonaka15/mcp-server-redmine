/**
 * Project Membership type definitions
 */
export interface RedmineMembershipRole {
  id: number;
  name: string;
  inherited?: boolean;
}

export interface RedmineMembership {
  id: number;
  project: {
    id: number;
    name: string;
  };
  user?: {
    id: number;
    name: string;
  };
  group?: {
    id: number;
    name: string;
  };
  roles: RedmineMembershipRole[];
}

export interface RedmineMembershipsResponse {
  memberships: RedmineMembership[];
  total_count: number;
  offset: number;
  limit: number;
}

export interface RedmineMembershipCreate {
  user_id: number;
  role_ids: number[];
}

export interface RedmineMembershipUpdate {
  role_ids: number[];
}
