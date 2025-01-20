import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  CircularProgress,
  styled,
  Box,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import DeleteDialog from "../../components/dialogs/DeleteDialog";
import { DialogMode } from "../../types/common";
import { AddEditShiftDialogProps } from "../../types/shifts";
import { FaRegTrashAlt } from "react-icons/fa";

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

const AddEditShiftDialog: React.FC<AddEditShiftDialogProps> = ({
  open,
  onClose,
  onDelete,
  dialogMode,
  shiftId,
  employeeName,
  selectedDay,
  roles,
  startTimeVal,
  endTimeVal,
  currentRole,
  onSave,
}) => {
  const [newRole, setNewRole] = useState<number | null>(currentRole);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [startTime, setStartTime] = useState<Dayjs | null>(null);
  const [endTime, setEndTime] = useState<Dayjs | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setStartTime(
        startTimeVal ? dayjs(`${selectedDay}T${startTimeVal}`) : null
      );
      setEndTime(endTimeVal ? dayjs(`${selectedDay}T${endTimeVal}`) : null);
      setNewRole(currentRole);
    }
  }, [open, selectedDay, startTimeVal, endTimeVal, currentRole]);

  const handleSave = async () => {
    if (newRole && startTime && endTime) {
      setIsSubmitting(true);
      const error = await onSave(newRole, startTime, endTime);
      setIsSubmitting(false);

      if (error) {
        setErrorMessage(error);
      } else {
        setErrorMessage(null);
      }
    }
  };

  const isSaveDisabled =
    !newRole || !startTime || !endTime || endTime.isBefore(startTime);

  return (
    <>
      <StyledDialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <StyledDialogTitle sx={{ m: 0, p: 2 }}>
          {dialogMode == DialogMode.Add ? "Add Shift" : "Edit Shift"} - [
          {employeeName} : {selectedDay}]
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
          {errorMessage && (
            <Box sx={{ marginBottom: 2 }}>
              <Alert severity="error">{errorMessage}</Alert>
            </Box>
          )}
          <FormControl fullWidth>
            <InputLabel id="role-select-label">Role</InputLabel>
            <Select
              labelId="role-select-label"
              value={newRole}
              onChange={(e) => setNewRole(Number(e.target.value))}
            >
              {roles.map((role) => (
                <MenuItem key={role.id} value={role.id}>
                  {role.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ mt: 1, display: "flex", width: "100%" }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <TimePicker
                value={startTime}
                onChange={(newValue) => setStartTime(newValue)}
                ampm={false}
                label="Start time"
                sx={{ flex: 1, mr: 2 }}
              />
              <TimePicker
                value={endTime}
                onChange={(newValue) => setEndTime(newValue)}
                ampm={false}
                label="End time"
                sx={{ flex: 1 }}
              />
            </LocalizationProvider>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={onClose}
            color="inherit"
            sx={{
              textTransform: "none",
              fontSize: "0.875rem",
              padding: "6px 16px",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => setOpenDeleteDialog(true)}
            color="error"
            size="small"
            sx={{
              textTransform: "none",
              fontSize: "0.875rem",
              padding: "5px 12px",
              color: "#ffffff",
              backgroundColor: "#ff0066",
              "&:hover": {
                backgroundColor: "#ff0066",
              },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FaRegTrashAlt style={{ marginRight: "8px" }} />
            Delete
          </Button>
          <SaveButton
            size="small"
            onClick={handleSave}
            disabled={isSubmitting || isSaveDisabled}
            startIcon={
              isSubmitting ? <CircularProgress size={16} /> : <SaveIcon />
            }
          >
            {isSubmitting ? "Saving..." : "Save"}
          </SaveButton>
        </DialogActions>
      </StyledDialog>
      <DeleteDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onDelete={() => {
          onDelete(Number(shiftId));
          setOpenDeleteDialog(false);
        }}
        message={`Are you sure you want to delete this shift?`}
      />
    </>
  );
};

export default AddEditShiftDialog;
