import { useEffect, useState } from "react";

interface UseGooglePlacesReturn {
  isLoaded: boolean;
  error: Error | null;
}

export const useGooglePlaces = (): UseGooglePlacesReturn => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Check if script is already loaded (by this hook or @react-google-maps/api)
    if (window.google?.maps?.places) {
      setIsLoaded(true);
      return;
    }

    // Check if script element already exists (loaded by @react-google-maps/api or this hook)
    const existingScript = document.querySelector(
      'script[src*="maps.googleapis.com/maps/api/js"]'
    );

    if (existingScript) {
      // Script exists but places might not be loaded, wait for it
      const checkPlaces = setInterval(() => {
        if (window.google?.maps?.places) {
          clearInterval(checkPlaces);
          setIsLoaded(true);
        }
      }, 100);

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkPlaces);
        if (!window.google?.maps?.places) {
          setError(new Error("Google Places API failed to load"));
        }
      }, 10000);

      return () => clearInterval(checkPlaces);
    }

    // Only load if no script exists at all
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    if (!apiKey) {
      setError(new Error("Google API key not found"));
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => setIsLoaded(true);
    script.onerror = () =>
      setError(new Error("Failed to load Google Maps script"));

    document.head.appendChild(script);

    return () => {};
  }, []);

  return { isLoaded, error };
};
