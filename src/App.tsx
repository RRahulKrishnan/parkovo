import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SelectRole from "./pages/role";
import Login from "./pages/login";
import SignUp from "./pages/signup";
import HostOnboarding from "./pages/hostOnboarding";
import Landing from "./pages/landing";
import FindParking from "./pages/findParking";
import ParkingSpotDetail from "./pages/parkingSpotDetail";
import Bookings from "./pages/bookings";
import Hostings from "./pages/hostings";
import Profile from "./pages/profile";
import EditHosting from "./pages/editHosting";
import AppLayout from "./layouts/appLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/role" element={<SelectRole />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/host-onboarding" element={<HostOnboarding />} />

        <Route element={<AppLayout />}>
          <Route path="/find-parking" element={<FindParking />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/hostings" element={<Hostings />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route path="/find-parking/:id" element={<ParkingSpotDetail />} />
        <Route path="/hostings/:id/edit" element={<EditHosting />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;