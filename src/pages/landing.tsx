import { useNavigate } from "react-router-dom";
import Button from "../components/button";
import { theme } from "../theme/theme";

function Landing() {
  const navigate = useNavigate();

  return (
    <main
      className={`min-h-screen flex flex-col ${theme.surface.page} ${theme.text.primary}`}
    >
      <div className="relative overflow-hidden flex-1 flex flex-col">
        <div
          className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-blue-100/70 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-blue-50 blur-3xl"
          aria-hidden="true"
        />

        {/* App name */}
        <div className="relative px-6 pt-14">
          <span className="text-lg font-extrabold tracking-tight">ParkingO</span>
        </div>

        {/* Heading + subheading, vertically centered in the remaining space */}
        <div className="relative flex-1 flex flex-col items-start justify-center px-6 text-left">
          <h1 className="text-[2.75rem] leading-[0.95] font-extrabold tracking-tight">
            Park
            <br /> 
            anywhere.
            <br />
            Host 
            <br />
            everywhere.
          </h1>
          <p className={`mt-4 text-base font-medium ${theme.text.secondary}`}>
            Find a spot in seconds, or turn your empty driveway into
            everyday income.
          </p>
        </div>

        {/* Actions, pinned toward the bottom */}
        <div className="relative px-6 pb-10 space-y-3">
          <Button type="button" onClick={() => navigate("/login")}>
            Log in
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/signup")}
          >
            Sign up
          </Button>
        </div>
      </div>

      <footer className="px-6 pb-6 text-center">
        <p className={`text-xs ${theme.text.muted}`}>
          © 2026 ParkingO. All rights reserved.
        </p>
      </footer>
    </main>
  );
}

export default Landing;