import { useCallback, useEffect, useRef, useState } from "react";
import { X, MapPin, Loader2, Search, Navigation } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Button from "./button";
import { theme } from "../theme/theme";

export interface LocationResult {
  label: string;
  lat: number;
  lng: number;
}

interface LocationPickerProps {
  initialCenter?: { lat: number; lng: number };
  onClose: () => void;
  onConfirm: (result: LocationResult) => void;
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
}

// Falls back to Bengaluru, matching the mock spot data elsewhere in the app.
const DEFAULT_CENTER = { lat: 12.9716, lng: 77.5946 };
const DEFAULT_ZOOM = 14;

function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delayMs: number
) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  return useCallback(
    (...args: Args) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => callback(...args), delayMs);
    },
    [callback, delayMs]
  );
}

function LocationPicker({ initialCenter, onClose, onConfirm }: LocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const pendingCenterRef = useRef(initialCenter ?? DEFAULT_CENTER);

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [label, setLabel] = useState("Move the map to choose a spot");
  const [isResolvingLabel, setIsResolvingLabel] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Initialize the map once, on mount.
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const center = initialCenter ?? DEFAULT_CENTER;
    const map = L.map(mapContainerRef.current, {
      center: [center.lat, center.lng],
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reverseGeocode = useDebouncedCallback(async (lat: number, lng: number) => {
    setIsResolvingLabel(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16`
      );
      const data = await res.json();
      setLabel(data.display_name ?? "Selected location");
    } catch (err) {
      console.error("Reverse geocode failed:", err);
      setLabel("Selected location");
    } finally {
      setIsResolvingLabel(false);
    }
  }, 500);

  // Track the map center on every move, and resolve it to a readable
  // address once dragging settles.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleMoveEnd = () => {
      const center = map.getCenter();
      pendingCenterRef.current = { lat: center.lat, lng: center.lng };
      reverseGeocode(center.lat, center.lng);
    };

    map.on("moveend", handleMoveEnd);
    return () => {
      map.off("moveend", handleMoveEnd);
    };
  }, [reverseGeocode]);

  const runSearch = useDebouncedCallback(async (value: string) => {
    if (value.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=5`
      );
      const data: NominatimResult[] = await res.json();
      setSuggestions(data);
    } catch (err) {
      console.error("Location search failed:", err);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  }, 400);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    runSearch(value);
  };

  const handleSelectSuggestion = (result: NominatimResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    pendingCenterRef.current = { lat, lng };
    setLabel(result.display_name);
    setSuggestions([]);
    setQuery("");
    mapRef.current?.setView([lat, lng], DEFAULT_ZOOM);
  };

  const handleUseCurrentLocation = () => {
    if (!("geolocation" in navigator)) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        mapRef.current?.setView([latitude, longitude], DEFAULT_ZOOM);
        setIsLocating(false);
      },
      () => setIsLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleConfirm = () => {
    onConfirm({
      label,
      lat: pendingCenterRef.current.lat,
      lng: pendingCenterRef.current.lng,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Header: search bar */}
      <div className={`relative z-10 border-b ${theme.border.default} px-4 py-3`}>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={handleQueryChange}
              placeholder="Search for an area or address"
              className={`h-10 w-full rounded-full border ${theme.border.default} pl-9 pr-3 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600`}
            />
          </div>
        </div>

        {suggestions.length > 0 && (
          <div
            className={`absolute inset-x-4 top-full z-20 mt-1 max-h-64 overflow-y-auto rounded-xl border ${theme.border.default} bg-white shadow-lg`}
          >
            {suggestions.map((result) => (
              <button
                key={`${result.lat}-${result.lon}`}
                type="button"
                onClick={() => handleSelectSuggestion(result)}
                className="block w-full px-4 py-3 text-left text-sm hover:bg-slate-50"
              >
                {result.display_name}
              </button>
            ))}
          </div>
        )}
        {isSearching && <p className={`mt-1 pl-11 text-xs ${theme.text.muted}`}>Searching…</p>}
      </div>

      {/* Map */}
      <div className="relative flex-1">
        <div ref={mapContainerRef} className="absolute inset-0" />

        {/* Fixed center pin — the map moves underneath it, not the pin */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-[400] -translate-x-1/2 -translate-y-full">
          <MapPin className="h-9 w-9 text-blue-600 drop-shadow-md" fill="#3b82f6" strokeWidth={1.5} />
        </div>

        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          aria-label="Use current location"
          className="absolute bottom-4 right-4 z-[400] flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md transition hover:bg-slate-50"
        >
          {isLocating ? (
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          ) : (
            <Navigation className="h-5 w-5 text-blue-600" />
          )}
        </button>
      </div>

      {/* Footer: resolved address + confirm */}
      <div className={`border-t ${theme.border.default} px-4 py-4`}>
        <p className={`mb-3 truncate text-sm font-medium ${theme.text.primary}`}>
          {isResolvingLabel ? "Finding address…" : label}
        </p>
        <Button type="button" onClick={handleConfirm} disabled={isResolvingLabel}>
          Confirm location
        </Button>
      </div>
    </div>
  );
}

export default LocationPicker;