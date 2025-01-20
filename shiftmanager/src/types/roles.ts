export type RolesApiResponse = {
  data: Array<Role>;
  meta: {
    totalRowCount: number;
  };
};

export interface Role {
  id: number;
  name: string;
}

export interface RoleSelectOpt {
  value: string;
  label: string;
}
