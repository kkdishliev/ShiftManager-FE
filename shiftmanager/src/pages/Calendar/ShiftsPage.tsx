import React, { useState, useEffect, useMemo } from "react";
import { Box, Typography, IconButton, Snackbar, Alert } from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
import { Dayjs } from "dayjs";
import AddEditShiftDialog from "./AddEditShiftDialog";
import { FaPlus } from "react-icons/fa6";
import {
  MaterialReactTable,
  MRT_Cell,
  useMaterialReactTable,
} from "material-react-table";
import { Role } from "../../types/roles";
import { DialogMode } from "../../types/common";
import { Shift, Shifts } from "../../types/shifts";

const ShiftsPage: React.FC = () => {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(new Date());
  const [currentWeek, setCurrentWeek] = useState<Date[]>([]);
  const [shifts, setShifts] = useState<Shifts>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null
  );
  const [selectedEmployeeName, setSelectedEmployeeName] = useState<
    string | null
  >(null);
  const [selectedStartTime, setSelectedStartTime] = useState<string | null>(
    null
  );
  const [selectedEndTime, setSelectedEndTime] = useState<string | null>(null);
  const [selectedShiftId, setSelectedShiftId] = useState<number>();
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );
  const [shiftDialogMode, setShiftDialogMode] = useState<DialogMode>(
    DialogMode.Add
  );
  const fetchRoles = async (employeeId: number) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/Role/employee?employeeId=${employeeId}`
      );
      if (response.ok) {
        const fetchedRoles = await response.json();
        setRoles(fetchedRoles);
      } else {
        console.error("Failed to fetch roles");
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  const fetchShiftsForWeek = async (startOfWeek: Date, endOfWeek: Date) => {
    try {
      const startDate = startOfWeek.toISOString().split("T")[0];
      const endDate = endOfWeek.toISOString().split("T")[0];
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/shift/week?startOfWeek=${startDate}&endOfWeek=${endDate}`
      );
      if (response.ok) {
        const fetchedShifts = await response.json();
        const transformedShifts: Shifts = {};

        fetchedShifts.forEach((employee: any) => {
          const { id, firstName, lastName, shifts } = employee;
          const fullName = `${firstName} ${lastName}`;
          transformedShifts[fullName] = {
            employeeId: id,
            shifts: {},
          };

          shifts.forEach((shift: Shift) => {
            const dayKey = shift.startDate;
            if (!transformedShifts[fullName].shifts[dayKey]) {
              transformedShifts[fullName].shifts[dayKey] = [];
            }
            transformedShifts[fullName].shifts[dayKey].push({
              id: shift.id,
              roleId: shift.roleId,
              employeeId: shift.employeeId,
              startDate: shift.startDate,
              startTime: shift.startTime,
              endDate: shift.endDate,
              endTime: shift.endTime,
              role: shift.role,
            });
          });
        });
        setShifts(transformedShifts);
      } else {
        console.error("Error fetching shifts:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching shifts:", error);
    }
  };

  const getStartAndEndOfWeek = (referenceDate: Date = new Date()) => {
    const startOfWeek = new Date(
      referenceDate.setDate(
        referenceDate.getDate() - referenceDate.getDay() + 1
      )
    );
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    return { startOfWeek, endOfWeek };
  };

  useEffect(() => {
    const { startOfWeek, endOfWeek } = getStartAndEndOfWeek(currentWeekStart);
    setCurrentWeek(
      Array.from({ length: 7 }, (_, i) => {
        const date = new Date(startOfWeek);
        date.setDate(date.getDate() + i);
        return date;
      })
    );
    fetchShiftsForWeek(startOfWeek, endOfWeek);
  }, [currentWeekStart]);

  const handleWeekChange = (direction: "prev" | "next"): void => {
    const offset = direction === "prev" ? -7 : 7;
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(newWeekStart.getDate() + offset);
    setCurrentWeekStart(newWeekStart);
  };

  const handleOpenDialog = async (
    dialogMode: DialogMode,
    employeeId: number,
    employeeName: string,
    day: string,
    shift?: Shift
  ): Promise<void> => {
    if (!employeeId || !day) {
      console.error("Invalid employee or day:", { employeeId, day });
      return;
    }

    setRoles([]);
    setSelectedRole(null);
    setEditingShift(null);
    setSelectedStartTime(null);
    setSelectedEndTime(null);

    try {
      setShiftDialogMode(dialogMode);
      setSelectedEmployeeId(employeeId.toString());
      setSelectedEmployeeName(employeeName);
      setSelectedDay(day);
      setSelectedStartTime(shift?.startTime || null);
      setSelectedEndTime(shift?.endTime || null);
      setSelectedShiftId(shift?.id);
      if (shift) {
        setEditingShift(shift);
        setSelectedRole(shift.roleId);
      }

      await fetchRoles(employeeId);

      setDialogOpen(true);
    } catch (error) {
      console.error("Error opening dialog:", error);
    }
  };

  const handleCloseDialog = (): void => {
    setDialogOpen(false);
    setSelectedRole(null);
  };

  const formatWeekRange = () => {
    if (currentWeek.length === 0) return "Loading...";
    const startDate = `${currentWeek[0].toLocaleDateString("en-US", {
      weekday: "long",
    })}, ${currentWeek[0].getDate()} ${currentWeek[0].toLocaleDateString(
      "en-US",
      {
        month: "long",
      }
    )}, ${currentWeek[0].getFullYear()}`;

    const endDate = `${currentWeek[6].toLocaleDateString("en-US", {
      weekday: "long",
    })}, ${currentWeek[6].getDate()} ${currentWeek[6].toLocaleDateString(
      "en-US",
      {
        month: "long",
      }
    )}, ${currentWeek[6].getFullYear()}`;

    return `${startDate} - ${endDate}`;
  };
  const handleSaveShift = async (
    roleId: number,
    startTime: Dayjs | null,
    endTime: Dayjs | null
  ): Promise<string | null> => {
    if (!selectedEmployeeId || !selectedDay || !roleId) {
      console.error("Missing required data");
      return "Missing required data";
    }

    const payload = {
      id: editingShift ? editingShift.id : 0,
      employeeId: parseInt(selectedEmployeeId, 10),
      startDate: selectedDay,
      startTime: startTime?.format("HH:mm"),
      endDate: selectedDay,
      endTime: endTime?.format("HH:mm"),
      roleId: roleId,
    };

    try {
      const url = editingShift
        ? `${process.env.REACT_APP_API_URL}/shift/${editingShift.id}`
        : `${process.env.REACT_APP_API_URL}/shift`;
      const method = editingShift ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (response.ok && result.isSuccess) {
        const { startOfWeek, endOfWeek } =
          getStartAndEndOfWeek(currentWeekStart);
        await fetchShiftsForWeek(startOfWeek, endOfWeek);
        setSnackbarMessage(result.message);
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        handleCloseDialog();
        return null;
      } else {
        return result.errors?.join(", ") || "Failed to save shift";
      }
    } catch (error) {
      return `Error saving shift: ${error}`;
    }
  };

  const handleDelete = (shiftId: number) => {
    fetch(`${process.env.REACT_APP_API_URL}/shift/${shiftId}`, {
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
          const { startOfWeek, endOfWeek } =
            getStartAndEndOfWeek(currentWeekStart);
          fetchShiftsForWeek(startOfWeek, endOfWeek);
          setSnackbarMessage(result.message || "Shift deleted successfully");
          setSnackbarSeverity("success");
        } else {
          setSnackbarMessage(result.message || "Failed to delete shift");
          setSnackbarSeverity("error");
        }
        setSnackbarOpen(true);
      })
      .catch((error) => {
        setSnackbarMessage(error.message || "Error deleting shift");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        console.error("Error deleting shift", error);
      });
    handleCloseDialog();
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "employee",
        header: "Employee",
        enableColumnFilter: true,
      },
      ...currentWeek.map((date) => ({
        accessorKey: date.toISOString().split("T")[0],
        header: date.toLocaleDateString("en-US", {
          weekday: "short",
          day: "numeric",
          month: "short",
        }),
        enableColumnFilter: false,
        Cell: ({ cell, row }: { cell: MRT_Cell<any>; row: any }) => {
          const dayKey = cell.column.id;
          const employeeShifts = shifts[row.original.employee];
          const shiftForDay = employeeShifts?.shifts[dayKey] || [];
          return (
            <Box>
              {shiftForDay.map((shift) => (
                <Box
                  key={shift.id}
                  onClick={() =>
                    handleOpenDialog(
                      DialogMode.Edit,
                      parseInt(employeeShifts.employeeId),
                      row.original.employee,
                      dayKey,
                      shift
                    )
                  }
                  sx={{
                    cursor: "pointer",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid #1976d2",
                    marginBottom: "4px",
                    background: "linear-gradient(135deg, #e3f2fd, #bbdefb)",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                    "&:hover": {
                      transform: "scale(1.03)",
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)",
                    },
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ color: "#0d47a1", fontWeight: "bold" }}
                  >
                    {shift.role}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#0d47a1" }}>
                    {shift.startTime} - {shift.endTime}
                  </Typography>
                </Box>
              ))}
              <IconButton
                color="success"
                size="small"
                onClick={() =>
                  handleOpenDialog(
                    DialogMode.Add,
                    parseInt(employeeShifts.employeeId),
                    row.original.employee,
                    dayKey
                  )
                }
              >
                <FaPlus fontSize={15} />
              </IconButton>
            </Box>
          );
        },
      })),
    ],
    [shifts, currentWeek, handleOpenDialog]
  );

  const data = useMemo(() => {
    return Object.entries(shifts).map(([employee, employeeShifts]) => ({
      employee,
      ...Object.fromEntries(
        currentWeek.map((date) => {
          const dayKey = date.toISOString().split("T")[0];
          return [dayKey, employeeShifts.shifts[dayKey] || []];
        })
      ),
    }));
  }, [shifts, currentWeek]);

  const table = useMaterialReactTable({
    columns,
    data,
    enableGlobalFilter: false,
    enableColumnResizing: true,
    enableGrouping: true,
    enableColumnPinning: true,
    muiTableBodyCellProps: {
      sx: {
        border: "1px solid #ccc",
      },
    },
    muiTableHeadCellProps: {
      sx: {
        border: "1px solid #ccc",
      },
    },
  });
  return (
    <Box sx={{ padding: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
        <IconButton
          color="primary"
          onClick={() => handleWeekChange("prev")}
          size="small"
        >
          <ArrowBack />
        </IconButton>
        <Box sx={{ mx: 2 }}>
          <Typography variant="h6">{formatWeekRange()}</Typography>
        </Box>
        <IconButton
          color="primary"
          onClick={() => handleWeekChange("next")}
          size="small"
        >
          <ArrowForward />
        </IconButton>
      </Box>

      <AddEditShiftDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onDelete={handleDelete}
        shiftId={selectedShiftId}
        dialogMode={shiftDialogMode}
        employeeId={selectedEmployeeId}
        employeeName={selectedEmployeeName}
        selectedDay={selectedDay}
        roles={roles}
        startTimeVal={selectedStartTime}
        endTimeVal={selectedEndTime}
        currentRole={selectedRole}
        onSave={handleSaveShift}
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
      <MaterialReactTable table={table} />
    </Box>
  );
};

export default ShiftsPage;
