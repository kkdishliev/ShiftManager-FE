import React, { useState, useMemo } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_ColumnFiltersState,
  type MRT_PaginationState,
  type MRT_SortingState,
} from "material-react-table";
import AddIcon from "@mui/icons-material/Add";

import {
  Button,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  Alert,
  Snackbar,
  Typography,
  Divider,
  Box,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import DeleteDialog from "../../components/dialogs/DeleteDialog";
import { FaUsersCog } from "react-icons/fa";
import RoleDialog from "./RoleDialog";
import { Role, RolesApiResponse } from "../../types/roles";

const RolesPage = () => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );

  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    []
  );
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRole, setCurrentRole] = useState<Role>({ id: 0, name: "" });
  const [formData, setFormData] = useState({ name: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const {
    data: { data = [], meta } = {},
    isError,
    isRefetching,
    isLoading,
    refetch,
  } = useQuery<RolesApiResponse>({
    queryKey: [
      "roles-list",
      { columnFilters, globalFilter, pagination, sorting },
    ],
    queryFn: async () => {
      const fetchURL = new URL(
        process.env.REACT_APP_API_URL + "/role",
        window.location.origin
      );

      fetchURL.searchParams.set(
        "start",
        `${pagination.pageIndex * pagination.pageSize}`
      );
      fetchURL.searchParams.set("size", `${pagination.pageSize}`);

      fetchURL.searchParams.set("filters", JSON.stringify(columnFilters ?? []));
      fetchURL.searchParams.set("globalFilter", globalFilter ?? "");

      fetchURL.searchParams.set("sorting", JSON.stringify(sorting ?? []));

      const response = await fetch(fetchURL.href);
      const json = await response.json();
      return json;
    },
    placeholderData: keepPreviousData,
  });

  const columns = useMemo<MRT_ColumnDef<Role>[]>(
    () => [
      {
        id: "actions",
        header: "Actions",
        Cell: ({ row }: any) => (
          <Tooltip title="Actions">
            <IconButton onClick={(e) => handleMenuClick(e, row.original)}>
              <MoreVertIcon />
            </IconButton>
          </Tooltip>
        ),
      },
      { accessorKey: "name", header: "Name" },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    muiToolbarAlertBannerProps: isError
      ? { color: "error", children: "Error loading data" }
      : undefined,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    renderTopToolbarCustomActions: () => (
      <Button
        variant="contained"
        size="small"
        color="success"
        onClick={handleAdd}
        startIcon={<AddIcon />}
      >
        New
      </Button>
    ),
    rowCount: meta?.totalRowCount ?? 0,
    initialState: { density: "compact" },
    state: {
      columnFilters,
      globalFilter,
      isLoading,
      pagination,
      showAlertBanner: isError,
      showProgressBars: isRefetching,
      sorting,
    },
  });

  const handleAdd = () => {
    setIsEditing(false);
    setFormData({ name: "" });
    setOpenDialog(true);
  };

  const handleEdit = (role: Role) => {
    setIsEditing(true);
    setCurrentRole(role);
    setFormData({ name: role.name });
    setOpenDialog(true);
  };

  const handleDelete = (roleId: number) => {
    fetch(`${process.env.REACT_APP_API_URL}/role/${roleId}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (response.ok) {
          refetch();
        } else {
          console.error("Failed to delete role");
        }
      })
      .catch((error) => console.error("Error deleting role", error));
    setOpenDeleteDialog(false);
  };

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    role: Role
  ) => {
    setAnchorEl(event.currentTarget);
    setCurrentRole(role);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleSubmit = async (role: Role) => {
    setIsSubmitting(true);

    const url = isEditing
      ? `${process.env.REACT_APP_API_URL}/role/${role?.id}`
      : `${process.env.REACT_APP_API_URL}/role`;

    const method = isEditing ? "PUT" : "POST";

    const roleData = {
      Id: role?.id,
      Name: role.name,
    };

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(roleData),
      });

      const responseBody = await response.text();

      if (!response.ok) {
        throw new Error(`Failed to save role data: ${response.status}`);
      }

      if (responseBody === "") {
        throw new Error("No content in response.");
      }

      if (isEditing) {
        setSnackbarMessage("Role updated successfully");
        setSnackbarSeverity("success");
      } else {
        setSnackbarMessage("Role created successfully");
        setSnackbarSeverity("success");
      }

      setOpenDialog(false);
      setFormData({ name: "" });
      refetch();
    } catch (error) {
      setSnackbarMessage("An error occurred while saving the name");
      setSnackbarSeverity("error");
      console.error("Error saving name:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Typography
        variant="h6"
        component="h1"
        gutterBottom
        sx={{
          display: "flex",
          alignItems: "center",
          textAlign: "left",
          fontWeight: "bold",
        }}
      >
        <FaUsersCog style={{ marginRight: "8px", fontSize: "1.5rem" }} />
        Roles
      </Typography>
      <Divider />
      <Box
        sx={{
          marginTop: "16px",
        }}
      >
        <MaterialReactTable table={table} />
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem
          onClick={() => {
            handleCloseMenu();
            handleEdit(currentRole!);
          }}
        >
          <ListItemIcon>
            <EditIcon />
          </ListItemIcon>
          Edit
        </MenuItem>
        <MenuItem onClick={() => setOpenDeleteDialog(true)}>
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>
      <RoleDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSubmit={handleSubmit}
        isEditing={isEditing}
        initialData={currentRole}
      />
      <DeleteDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onDelete={() => currentRole && handleDelete(currentRole.id)}
        message={`Are you sure you want to delete <strong>${currentRole?.name}</strong> ?`}
      />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default RolesPage;
