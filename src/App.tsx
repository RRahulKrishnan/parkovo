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
import AppLayout from "./layouts/appLayout";
import BookingConfirmation from "./pages/bookingConfirmation";
import { RequireAuth, RequireCheckout } from "./components/routeGuards";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/role" element={<SelectRole />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/host-onboarding" element={<RequireAuth><HostOnboarding /></RequireAuth>} />
        <Route path="/host-onboarding/:id" element={<RequireAuth><HostOnboarding /></RequireAuth>} />

        <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
          <Route path="/find-parking" element={<FindParking />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/hostings" element={<Hostings />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route path="/find-parking/:id" element={<RequireAuth><ParkingSpotDetail /></RequireAuth>} />
        <Route path="/booking/confirm" element={<RequireAuth><RequireCheckout><BookingConfirmation /></RequireCheckout></RequireAuth>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
