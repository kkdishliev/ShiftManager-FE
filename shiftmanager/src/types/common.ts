import { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";

export enum DialogMode {
  Add,
  Edit,
}

export type DeleteDialogProps = {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
  message: string;
};

export interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}
