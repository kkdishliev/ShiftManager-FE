import React, { useState, useEffect } from "react";
import {
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  styled,
  IconButton,
  Dialog,
  DialogTitle,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";

interface Role {
  id: number;
  name: string;
}

interface RoleDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (role: Role) => Promise<void>;
  isEditing: boolean;
  initialData?: Role;
}

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
    borderTop: `1px solid ${theme.palette.primary.main}`,
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  "& .MuiIconButton-root": {
    color: theme.palette.common.white,
  },
}));

const SaveButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.success.main,
  color: theme.palette.common.white,
  textTransform: "none",
  padding: "6px 16px",
  "&:hover": {
    backgroundColor: theme.palette.success.dark,
  },
}));

const RoleDialog: React.FC<RoleDialogProps> = ({
  open,
  onClose,
  onSubmit,
  isEditing,
  initialData,
}) => {
  const [formData, setFormData] = useState<Role>({
    id: 0,
    name: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      if (isEditing && initialData) {
        setFormData(initialData);
      } else {
        setFormData({ id: 0, name: "" });
      }
    }
  }, [open, isEditing, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await onSubmit(formData);
    setIsSubmitting(false);
  };

  return (
    <StyledDialog open={open} onClose={onClose}>
      <StyledDialogTitle sx={{ m: 0, p: 2 }}>
        {isEditing ? "Edit Role" : "Add Role"}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
      </StyledDialogTitle>
      <DialogContent dividers>
        <TextField
          size="small"
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button
          sx={{ textTransform: "none" }}
          onClick={onClose}
          color="secondary"
        >
          Cancel
        </Button>
        <SaveButton
          sx={{ textTransform: "none" }}
          size="small"
          onClick={handleSubmit}
          disabled={isSubmitting}
          startIcon={
            isSubmitting ? <CircularProgress size={16} /> : <SaveIcon />
          }
        >
          {isSubmitting ? "Saving..." : "Save"}
        </SaveButton>
      </DialogActions>
    </StyledDialog>
  );
};

export default RoleDialog;
