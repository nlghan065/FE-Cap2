import { createContext, useContext, useState } from "react";

const DashboardRefreshContext = createContext();

export function DashboardRefreshProvider({ children }) {
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshDashboard = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <DashboardRefreshContext.Provider value={{ refreshKey, refreshDashboard }}>
      {children}
    </DashboardRefreshContext.Provider>
  );
}

export const useDashboardRefresh = () => useContext(DashboardRefreshContext);
