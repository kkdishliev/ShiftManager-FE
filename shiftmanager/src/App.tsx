import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DrawerComponent from "./components/DrawerComponent";
import EmployeesPage from "./pages/Employees/EmployeesPage";
import CalendarPage from "./pages/Calendar/ShiftsPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import RolesPage from "./pages/Roles/RolesPage";

export default function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleDrawerOpen = () => {
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  const queryClient = new QueryClient();

  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <DrawerComponent
          open={drawerOpen}
          onDrawerOpen={handleDrawerOpen}
          onDrawerClose={handleDrawerClose}
        >
          <Routes>
            <Route path="/" element={<CalendarPage />} />
            <Route path="/pages/employees" element={<EmployeesPage />} />
            <Route path="/pages/roles" element={<RolesPage />} />
          </Routes>
        </DrawerComponent>
      </QueryClientProvider>
    </Router>
  );
}
