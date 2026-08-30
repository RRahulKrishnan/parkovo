import { NavLink } from "react-router-dom";
import { Compass, CalendarCheck, Warehouse, User } from "lucide-react";
import { theme } from "../theme/theme";

const NAV_ITEMS = [
  { to: "/find-parking", label: "Explore", icon: Compass },
  { to: "/bookings", label: "Bookings", icon: CalendarCheck },
  { to: "/hostings", label: "Hostings", icon: Warehouse },
  { to: "/profile", label: "Profile", icon: User },
] as const;

function BottomNav() {
  return (
    <nav
      className={`fixed inset-x-0 bottom-0 z-40 border-t ${theme.border.default} ${theme.surface.page}`}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-md items-stretch justify-between px-2">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium transition ${
                isActive ? "text-blue-600" : `${theme.text.muted} hover:text-slate-600`
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default BottomNav;