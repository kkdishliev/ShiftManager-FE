import { RoleSelectOpt } from "./roles";

export type EmployeeApiResponse = {
  data: Array<Employee>;
  meta: {
    totalRowCount: number;
  };
};

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
}

export interface EmployeeDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    employee: Employee,
    roles: { id: number; name: string }[]
  ) => Promise<void>;
  isEditing: boolean;
  initialData?: Employee;
  employeeRoles: RoleSelectOpt[];
}
