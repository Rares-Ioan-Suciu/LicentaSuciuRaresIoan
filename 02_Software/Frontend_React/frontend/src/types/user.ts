export type UserRole = "student" | "teacher";

export interface User {
  id: string;
  full_name: string;
  sub: string;
  role: UserRole;
  is_active: boolean;
  avatar_color?: string;

}
