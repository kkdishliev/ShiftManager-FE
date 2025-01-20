import React from "react";
import {
  Dialog,
  DialogActions,
  DialogTitle,
  Button,
  Typography,
} from "@mui/material";
import { DeleteDialogProps } from "../../types/common";
import { FaRegTrashAlt } from "react-icons/fa";

const DeleteDialog: React.FC<DeleteDialogProps> = ({
  open,
  onClose,
  onDelete,
  message,
}) => {
  return (
    <Dialog
      fullWidth
      maxWidth="xs"
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiDialogTitle-root": {
          fontWeight: 600,
          fontSize: "1.2rem",
          color: "#333",
          paddingBottom: "16px",
        },
        "& .MuiDialogActions-root": {
          paddingTop: "16px",
          paddingBottom: "16px",
        },
      }}
    >
      <DialogTitle>
        <Typography
          variant="body1"
          component="span"
          dangerouslySetInnerHTML={{ __html: message }}
          sx={{ fontSize: "1rem", color: "#555" }}
        />
      </DialogTitle>
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
          onClick={onDelete}
          color="error"
          size="small"
          sx={{
            textTransform: "none",
            fontSize: "0.875rem",
            padding: "6px 16px",
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
      </DialogActions>
    </Dialog>
  );
};

export default DeleteDialog;
