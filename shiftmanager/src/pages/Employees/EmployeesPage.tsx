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
import EmployeeDialog from "./EmployeeDialog";
import { FaUsers } from "react-icons/fa";
import { Employee, EmployeeApiResponse } from "../../types/employees";

const EmployeesPage = () => {
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
  const [currentEmployee, setCurrentEmployee] = useState<Employee>({
    id: 0,
    firstName: "",
    lastName: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const {
    data: { data = [], meta } = {},
    isError,
    isRefetching,
    isLoading,
    refetch,
  } = useQuery<EmployeeApiResponse>({
    queryKey: [
      "employees-list",
      { columnFilters, globalFilter, pagination, sorting },
    ],
    queryFn: async () => {
      const fetchURL = new URL(
        process.env.REACT_APP_API_URL + "/employee",
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
      const json = (await response.json()) as EmployeeApiResponse;
      return json;
    },
    placeholderData: keepPreviousData,
  });

  const columns = useMemo<MRT_ColumnDef<Employee>[]>(
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
      { accessorKey: "firstName", header: "First Name" },
      { accessorKey: "lastName", header: "Last Name" },
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

  const handleEdit = (employee: Employee) => {
    setIsEditing(true);
    setCurrentEmployee(employee);
    setCurrentEmployee({
      id: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
    });
    setOpenDialog(true);
  };

  const handleDelete = (employeeId: number) => {
    fetch(`${process.env.REACT_APP_API_URL}/employee/${employeeId}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else if (response.status === 404) {
          return response.json().then((result) => {
            throw new Error(result.message || "Employee not found");
          });
        } else {
          return response.json().then((result) => {
            throw new Error(result.message || "Failed to delete employee");
          });
        }
      })
      .then((result) => {
        if (result.isSuccess) {
          refetch();
          setSnackbarMessage(result.message || "Employee deleted successfully");
          setSnackbarSeverity("success");
        } else {
          setSnackbarMessage(result.message || "Failed to delete employee");
          setSnackbarSeverity("error");
        }
        setSnackbarOpen(true);
      })
      .catch((error) => {
        setSnackbarMessage(error.message || "Error deleting employee");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        console.error("Error deleting employee", error);
      });

    setOpenDeleteDialog(false);
  };

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    employee: Employee
  ) => {
    setAnchorEl(event.currentTarget);
    setCurrentEmployee(employee);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleAdd = () => {
    setIsEditing(false);
    setCurrentEmployee({ id: 0, firstName: "", lastName: "" });
    setOpenDialog(true);
  };

  const handleSubmit = async (
    employee: Employee,
    roles: { id: number; name: string }[]
  ) => {
    setIsSubmitting(true);

    const url = isEditing
      ? `${process.env.REACT_APP_API_URL}/employee/${employee?.id}`
      : `${process.env.REACT_APP_API_URL}/employee`;

    const method = isEditing ? "PUT" : "POST";

    const employeeData: {
      FirstName: string;
      LastName: string;
      Id?: number;
      Roles: { id: number; name: string }[];
    } = {
      FirstName: employee.firstName.trim(),
      LastName: employee.lastName.trim(),
      Roles: roles,
    };

    if (isEditing && employee.id !== undefined) {
      employeeData.Id = employee.id;
    }

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(employeeData),
      });

      const responseBody = await response.json();

      if (!response.ok) {
        throw new Error(
          `Failed to save employee data: ${responseBody.message}`
        );
      }

      if (isEditing) {
        setSnackbarMessage("Employee updated successfully");
      } else {
        setSnackbarMessage("Employee created successfully");
      }

      setSnackbarSeverity("success");
      setOpenDialog(false);
      setCurrentEmployee({ id: 0, firstName: "", lastName: "" });
      refetch();
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarMessage("An error occurred while saving the employee");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      console.error("Error saving employee:", error);
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
        <FaUsers style={{ marginRight: "8px", fontSize: "1.5rem" }} />
        Employees
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
            handleEdit(currentEmployee!);
          }}
        >
          <ListItemIcon>
            <EditIcon />
          </ListItemIcon>
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleCloseMenu();
            setOpenDeleteDialog(true);
          }}
        >
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>

      <EmployeeDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSubmit={handleSubmit}
        isEditing={isEditing}
        initialData={currentEmployee}
        employeeRoles={[]}
      />
      <DeleteDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onDelete={() => currentEmployee && handleDelete(currentEmployee.id)}
        message={`Are you sure you want to delete <strong>${currentEmployee?.firstName} ${currentEmployee?.lastName}</strong> ?`}
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

export default EmployeesPage;
