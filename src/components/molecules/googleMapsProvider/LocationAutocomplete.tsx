import { useEffect, useRef, useState } from "react";

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
    <div className="py-2 px-1 w-full focus-within:border-orange rounded-md">
      <input
        type="text"
        className="fflex w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50 h-16 pt-4 focus-visible:ring-orange"
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
            background: "#fff",
            listStyle: "none",
            padding: 0,
            margin: 0,
            border: "1px solid #ccc",
            zIndex: 10,
          }}
        >
          {predictions.map((suggestion) => (
            <li
              key={suggestion.placePrediction?.placeId}
              style={{ padding: "8px", cursor: "pointer" }}
              onClick={() => handleSelect(suggestion)}
            >
              {suggestion.placePrediction?.text.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}