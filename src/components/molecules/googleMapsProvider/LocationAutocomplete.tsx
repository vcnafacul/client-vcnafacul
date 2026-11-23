import { useEffect, useRef, useState } from "react";
import { palette } from "@/lib/palette";

interface Props {
  onPlaceLoaded: (placeId: string) => void;
}

export function LocationAutocomplete({ onPlaceLoaded }: Props) {
  const debounceRef = useRef<number | null>(null);
  const sessionTokenRef =
    useRef<google.maps.places.AutocompleteSessionToken | null>(null);

  const [inputValue, setInputValue] = useState("");
  const [predictions, setPredictions] = useState<
    google.maps.places.AutocompleteSuggestion[]
  >([]);

  useEffect(() => {
    sessionTokenRef.current =
      new google.maps.places.AutocompleteSessionToken();
  }, []);

  const handleChange = async (value: string) => {
    setInputValue(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value.length < 5) return;

    debounceRef.current = window.setTimeout(async () => {
      const { AutocompleteSuggestion } =
        (await google.maps.importLibrary(
          "places"
        )) as google.maps.PlacesLibrary;

      const { suggestions } =
        await AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: value,
          includedPrimaryTypes: ["establishment"],
          includedRegionCodes: ["br"],
          sessionToken: sessionTokenRef.current!,
        });

      setPredictions(suggestions || []);
    }, 400);
  };

  const handleSelect = async (
    suggestion: google.maps.places.AutocompleteSuggestion
  ) => {
    const prediction = suggestion.placePrediction;
    const place = prediction?.toPlace();

    if (!prediction || !place) return;

    const main = prediction.mainText?.text ?? "";
    const secondary = prediction.secondaryText?.text ?? "";
    const label = secondary ? `${main}, ${secondary}` : main;

    setInputValue(label);

    onPlaceLoaded(place.id);

    sessionTokenRef.current =
      new google.maps.places.AutocompleteSessionToken();

    setPredictions([]);
  };
  return (
    <div className="py-2 px-1 w-full focus-within:border-cta rounded-md">
      <input
        type="text"
        className="fflex w-full rounded-md border border-input bg-transparent px-3 py-1 text-body shadow-sm transition-colors file:border-0 file:bg-transparent file:text-body file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 h-16 pt-4"
        value={inputValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Buscar localização"
        style={{ width: "100%", padding: "8px" }}
      />

      {predictions.length > 0 && (
        <ul
          style={{
            position: "absolute",
            width: "100%",
            background: "white",
            listStyle: "none",
            padding: 0,
            margin: 0,
            border: `1px solid ${palette.neutral[300]}`,
            zIndex: 10,
          }}
        >
          {predictions.map((suggestion) => (
            <li key={suggestion.placePrediction?.placeId}>
              <button
                type="button"
                style={{
                  padding: "8px",
                  cursor: "pointer",
                  width: "100%",
                  textAlign: "left",
                  background: "none",
                  border: 0,
                  font: "inherit",
                }}
                onClick={() => handleSelect(suggestion)}
              >
                {suggestion.placePrediction?.text.text}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}