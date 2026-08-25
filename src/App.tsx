import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SelectRole from "./pages/role";
import Login from "./pages/login";
import SignUp from "./pages/signup";
import HostOnboarding from "./pages/hostOnboarding";
import Landing from "./pages/landing";
import FindParking from "./pages/findParking";
import ParkingSpotDetail from "./pages/parkingSpotDetail"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/role" element={<SelectRole />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/host-onboarding" element={<HostOnboarding />} />
        <Route path="/find-parking" element={<FindParking />}/>
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/find-parking/:id" element={<ParkingSpotDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;