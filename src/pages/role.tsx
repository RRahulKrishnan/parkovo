import Card from "../components/card";
import { useNavigate } from "react-router-dom";
import { theme } from "../theme/theme";
import { Car, Home } from "lucide-react";

function SelectRole() {

  const navigate = useNavigate();

  return (
    <main
      className={`min-h-screen flex flex-col ${theme.surface.page} ${theme.text.primary}`}
    >
      <div className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-blue-100/70 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative px-6 pt-14 pb-6 flex flex-col items-start text-left">
          <h2 className="text-[2.5rem] leading-[0.95] font-extrabold tracking-tight">
            What brings
            <br />
            you here?
          </h2>
          <p className={`mt-3 text-base font-medium ${theme.text.secondary}`}>
            You can always switch later
          </p>
        </div>
      </div>

      <section className="flex-1 px-6 pt-6 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <Card
            icon={<Car className="h-8 w-8" />}
            title="Park"
            description="Find and reserve a spot near where you're headed."
            onClick={()=> navigate("/find-parking")}
          />
          <Card
            icon={<Home className="h-8 w-8" />}
            title="Host"
            description="List your driveway or space and start earning."
            onClick={()=> navigate("/host-onboarding")}
          />
        </div>
      </section>

      <footer className="px-6 pb-6 text-center">
        <p className={`text-xs ${theme.text.muted}`}>
          © 2026 ParkingO. All rights reserved.
        </p>
      </footer>
    </main>
  );
}

export default SelectRole;