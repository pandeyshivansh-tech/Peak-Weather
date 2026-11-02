import { useEffect, useState, useRef, useCallback } from "react";
import { Search, MapPin, History, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { EASE_OUT, EASE_IN } from "../services/motion";

export default function SearchBar({ city, setCity, onSearch, onLocateMe, isLocating }) {
  const [inputValue, setInputValue] = useState(city);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem("peak_weather_history");
      return saved ? JSON.parse(saved) : ["Tokyo", "New York", "London", "Paris", "Mumbai"];
    } catch {
      return ["Tokyo", "New York", "London", "Paris", "Mumbai"];
    }
  });

  const searchContainerRef = useRef(null);

  const saveHistory = useCallback((cityName) => {
    if (!cityName || cityName.trim() === "") return;
    const cleanName = cityName.trim();
    setHistory((prev) => {
      const updated = [cleanName, ...prev.filter((h) => h.toLowerCase() !== cleanName.toLowerCase())].slice(0, 5);
      try {
        localStorage.setItem("peak_weather_history", JSON.stringify(updated));
      } catch (err) {
        console.warn("Could not save search history:", err);
      }
      return updated;
    });
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      if (inputValue && inputValue !== city) {
        saveHistory(inputValue);
        setCity(inputValue);
        onSearch(inputValue);
        setShowHistory(false);
      }
    }, 800);

    return () => clearTimeout(delay);
  }, [inputValue, city, setCity, onSearch, saveHistory]);

  // Click outside listener for history dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowHistory(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && inputValue.trim()) {
      saveHistory(inputValue.trim());
      setCity(inputValue.trim());
      onSearch(inputValue.trim());
      setShowHistory(false);
      e.target.blur();
    }
  };

  const handleSelectHistory = (selectedCity) => {
    setInputValue(selectedCity);
    setCity(selectedCity);
    onSearch(selectedCity);
    setShowHistory(false);
  };

  const handleClearHistoryItem = (e, itemToClear) => {
    e.stopPropagation();
    setHistory((prev) => {
      const updated = prev.filter((h) => h !== itemToClear);
      try {
        localStorage.setItem("peak_weather_history", JSON.stringify(updated));
      } catch (err) {
        console.warn("Could not update search history:", err);
      }
      return updated;
    });
  };

  return (
    <div className="search" ref={searchContainerRef}>
      <div className="search-field">
        <Search className="search-icon" size={18} aria-hidden="true" />
        <input
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowHistory(true)}
          placeholder="Search for a city"
          className="search-input"
          autoComplete="off"
          spellCheck="false"
          aria-label="Search for a city"
          enterKeyHint="search"
        />
        {inputValue && (
          <button
            type="button"
            className="icon-button"
            onClick={() => {
              setInputValue("");
              setCity("");
              setShowHistory(false);
            }}
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
        <button
          type="button"
          className="icon-button"
          onClick={() => {
            setShowHistory(false);
            onLocateMe();
          }}
          title="Use my location"
          aria-label="Use my location"
          disabled={isLocating}
        >
          <MapPin size={18} className={isLocating ? "pulse-icon" : ""} />
        </button>
      </div>

      <AnimatePresence>
        {showHistory && history.length > 0 && (
          <motion.div
            className="history"
            initial={{ opacity: 0, y: -8, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: EASE_OUT } }}
            exit={{ opacity: 0, y: -6, scale: 0.99, transition: { duration: 0.14, ease: EASE_IN } }}
          >
            <p className="history-title">
              <History size={14} aria-hidden="true" />
              Recent searches
            </p>
            <ul>
              {history.map((item) => (
                <li key={item} className="history-item">
                  <button type="button" className="history-pick" onClick={() => handleSelectHistory(item)}>
                    {item}
                  </button>
                  <button
                    type="button"
                    className="icon-button"
                    onClick={(e) => handleClearHistoryItem(e, item)}
                    aria-label={`Remove ${item} from recent searches`}
                  >
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
