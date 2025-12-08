import { useEffect, useRef, useState } from "react";
import { AutoComplete } from "antd";
import { useGooglePlaces } from "@/hooks/useGooglePlaces";

export interface AddressData {
  location: {
    lat: number;
    lng: number;
  };
  address_formatted: string;
}

interface AddressAutocompleteProps {
  value?: string;
  onChange?: (value: string) => void;
  onSelect?: (addressData: AddressData) => void;
  placeholder?: string;
}

interface PredictionOption {
  value: string;
  label: string;
  placeId: string;
}

/**
 * Reusable Google Places Autocomplete component
 * Provides address search with location data extraction
 */
const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  onChange,
  onSelect,
  placeholder = "Type to search address",
}) => {
  const { isLoaded, error } = useGooglePlaces();
  const [options, setOptions] = useState<PredictionOption[]>([]);
  const [searchValue, setSearchValue] = useState(value || "");
  const autocompleteService =
    useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Initialize services when Google Maps is loaded
  useEffect(() => {
    if (isLoaded && window.google?.maps?.places) {
      autocompleteService.current =
        new google.maps.places.AutocompleteService();

      // PlacesService requires a DOM element, create a hidden div
      const div = document.createElement("div");
      placesService.current = new google.maps.places.PlacesService(div);
    }
  }, [isLoaded]);

  // Sync searchValue with external value prop
  useEffect(() => {
    if (value !== undefined && value !== searchValue) {
      setSearchValue(value);
    }
  }, [value]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  // Handle search input with debouncing
  const handleSearch = (searchText: string) => {
    setSearchValue(searchText);
    onChange?.(searchText);

    // Clear previous debounce timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!searchText || !autocompleteService.current) {
      setOptions([]);
      return;
    }

    // Set new debounce timer (500ms delay)
    debounceTimer.current = setTimeout(() => {
      // Get predictions from Google Places
      autocompleteService.current!.getPlacePredictions(
        {
          input: searchText,
        },
        (predictions, status) => {
          if (
            status === google.maps.places.PlacesServiceStatus.OK &&
            predictions
          ) {
            const newOptions: PredictionOption[] = predictions.map(
              (prediction) => ({
                value: prediction.description,
                label: prediction.description,
                placeId: prediction.place_id,
              })
            );
            setOptions(newOptions);
          } else {
            setOptions([]);
          }
        }
      );
    }, 500);
  };

  // Handle address selection
  const handleSelectAddress = (selectedValue: string) => {
    const selectedOption = options.find((opt) => opt.value === selectedValue);

    if (!selectedOption || !placesService.current) {
      return;
    }

    // Get place details to extract coordinates
    placesService.current.getDetails(
      {
        placeId: selectedOption.placeId,
        fields: ["geometry", "formatted_address"],
      },
      (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          const lat = place.geometry?.location?.lat();
          const lng = place.geometry?.location?.lng();
          const formattedAddress = place.formatted_address;

          if (lat !== undefined && lng !== undefined && formattedAddress) {
            const addressData: AddressData = {
              location: {
                lat,
                lng,
              },
              address_formatted: formattedAddress,
            };

            // Update internal state to reflect the selected address
            setSearchValue(formattedAddress);
            onChange?.(formattedAddress);

            onSelect?.(addressData);
          }
        }
      }
    );
  };

  if (error) {
    console.error("Google Places API error:", error);
  }

  return (
    <AutoComplete
      value={searchValue}
      options={options}
      onSearch={handleSearch}
      onSelect={handleSelectAddress}
      placeholder={isLoaded ? placeholder : "Loading Google Maps..."}
      disabled={!!error}
      notFoundContent={isLoaded ? "No addresses found" : "Loading..."}
    />
  );
};

export default AddressAutocomplete;
