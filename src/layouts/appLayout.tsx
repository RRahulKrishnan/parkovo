import { Outlet } from "react-router-dom";
import BottomNav from "../components/bottomNav.tsx";

/**
 * Wraps every screen that shares the bottom nav (Explore, Bookings,
 * Hostings, Profile). Auth and onboarding screens (Landing, Login,
 * Signup, Role select, Host onboarding) are NOT nested under this
 * layout, so they render full-screen without the nav.
 *
 * Pages rendered inside here should add bottom padding (e.g. pb-24) to
 * their scrollable content so the last item isn't hidden behind the
 * fixed nav bar.
 */
function AppLayout() {
  return (
    <div className="min-h-screen">
      <Outlet />
      <BottomNav />
    </div>
  );
}

export default AppLayout;