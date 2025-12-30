export type BasicUser = {
  id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  status?: "ACTIVE" | "BLOCKED" | "PENDING" | string;
  is_verified?: boolean;
};
