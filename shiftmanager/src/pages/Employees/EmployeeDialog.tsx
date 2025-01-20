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
import Select, { MultiValue } from "react-select";
import { Employee, EmployeeDialogProps } from "../../types/employees";
import { RoleSelectOpt, Role } from "../../types/roles";

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

const EmployeeDialog: React.FC<EmployeeDialogProps> = ({
  open,
  onClose,
  onSubmit,
  isEditing,
  initialData,
}) => {
  const [formData, setFormData] = useState<Employee>({
    id: 0,
    firstName: "",
    lastName: "",
  });
  const [roles, setRoles] = useState<RoleSelectOpt[]>([]);
  const [employeeRoles, setEmployeeRoles] = useState<RoleSelectOpt[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAllRoles = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/role/all`);
      if (response.ok) {
        const result = await response.json();
        const fetchedRoles: Role[] = result.data;
        const roleOptions = fetchedRoles.map((role) => ({
          value: role.id.toString(),
          label: role.name,
        }));
        setRoles(roleOptions);
      } else {
        console.error("Failed to fetch roles");
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  const fetchEmployeeRoles = async (employeeId: number) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/Role/employee?employeeId=${employeeId}`
      );
      if (response.ok) {
        const fetchedRoles: Role[] = await response.json();
        const roleOptions = fetchedRoles.map((role) => ({
          value: role.id.toString(),
          label: role.name,
        }));
        setEmployeeRoles(roleOptions);
      } else {
        console.error("Failed to fetch employee roles");
      }
    } catch (error) {
      console.error("Error fetching employee roles:", error);
    }
  };

  useEffect(() => {
    if (open) {
      fetchAllRoles();

      if (isEditing && initialData) {
        setFormData(initialData);
        fetchEmployeeRoles(initialData.id);
      } else {
        setFormData({ id: 0, firstName: "", lastName: "" });
        setEmployeeRoles([]);
      }
    }
  }, [open, isEditing, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRolesChange = (selectedOptions: MultiValue<RoleSelectOpt>) => {
    setEmployeeRoles(
      selectedOptions.map((option) => ({
        value: option.value,
        label: option.label,
      }))
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const rolesToSubmit = employeeRoles.map((role) => ({
      id: parseInt(role.value, 10),
      name: role.label,
    }));

    await onSubmit(formData, rolesToSubmit);
    setIsSubmitting(false);
  };

  return (
    <StyledDialog open={open} onClose={onClose}>
      <StyledDialogTitle sx={{ m: 0, p: 2 }}>
        {isEditing ? "Edit Employee" : "Add Employee"}
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
          label="First Name"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          size="small"
          label="Last Name"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <Select
          isMulti
          options={roles}
          value={employeeRoles}
          onChange={handleRolesChange}
          placeholder="Select Roles"
          menuPortalTarget={document.body}
          menuPosition={"fixed"}
          styles={{
            menuPortal: (provided: any) => ({ ...provided, zIndex: 9999 }),
            menu: (provided: any) => ({ ...provided, zIndex: 9999 }),
          }}
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

export default EmployeeDialog;
