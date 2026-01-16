import React, { createContext, useContext } from "react";
import { useMonitoring as useMonitoringHook } from "@/hooks/useMonitoring";

type MonitoringHookReturn = ReturnType<typeof useMonitoringHook>;

const MonitoringContext = createContext<MonitoringHookReturn | null>(null);

export const MonitoringProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const monitoring = useMonitoringHook();
  return (
    <MonitoringContext.Provider value={monitoring}>
      {children}
    </MonitoringContext.Provider>
  );
};

export const useMonitoringContext = (): MonitoringHookReturn => {
  const ctx = useContext(MonitoringContext);
  if (!ctx) {
    throw new Error("useMonitoringContext must be used within a MonitoringProvider");
  }
  return ctx;
};
