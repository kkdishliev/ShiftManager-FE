import { Dayjs } from "dayjs";
import { DialogMode } from "./common";
import { Role } from "./roles";

export interface AddEditShiftDialogProps {
  open: boolean;
  onClose: () => void;
  onDelete: (shiftId: number) => void;
  dialogMode: DialogMode;
  shiftId?: number;
  employeeId: string | null;
  employeeName: string | null;
  selectedDay: string;
  roles: Role[];
  startTimeVal: string | null;
  endTimeVal: string | null;
  currentRole: number | null;
  onSave: (
    role: number,
    startTime: Dayjs | null,
    endTime: Dayjs | null
  ) => Promise<string | null>;
}

export interface Shift {
  id: number;
  roleId: number;
  employeeId: number;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  role: string;
}

export interface Shifts {
  [employee: string]: {
    employeeId: string;
    shifts: {
      [day: string]: Shift[];
    };
  };
}
