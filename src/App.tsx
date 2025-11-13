// App.tsx
import { HashRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/MainLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/Dashboard";
import WorkSessionPage from "./pages/WorkSession";
import { TimeProvider } from "./contexts/TimeContext";
import { MonitoringProvider } from "./contexts/MonitoringContext"; 
import Auth from "./components/Auth";

function App() {
  return (
    <TimeProvider>
      <MonitoringProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={
              <Auth auth={false}>
                <LoginPage />
              </Auth>} />
            <Route
              path="/dashboard"
              element={
                <Auth auth={true}>
                  <MainLayout>
                    <DashboardPage />
                  </MainLayout>
                </Auth>

              }
            />
            <Route
              path="/work-session/:subtaskId/:workDiaryId/:taskActivityId"
              element={
                <Auth auth={true}>
                  <MainLayout>
                    <WorkSessionPage />
                  </MainLayout>
                </Auth>
              }
            />
          </Routes>
        </HashRouter>
      </MonitoringProvider>
    </TimeProvider>
  );
}

export default App;
