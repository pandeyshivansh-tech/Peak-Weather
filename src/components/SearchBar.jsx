import { useEffect, useState, useRef, useCallback } from "react";
import { Search, MapPin, History, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
    <motion.div 
      className="search-container"
      ref={searchContainerRef}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="search-input-wrapper">
        <Search className="search-icon" size={20} />
        <input
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowHistory(true)}
          placeholder="Search city or anime..."
          className="search-input"
          autoComplete="off"
          spellCheck="false"
        />
        {inputValue && (
          <button
            type="button"
            className="clear-search-btn"
            onClick={() => { setInputValue(""); setCity(""); setShowHistory(false); }}
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
        <button
          type="button"
          className={`locate-me-btn ${isLocating ? 'locating' : ''}`}
          onClick={() => {
            setShowHistory(false);
            onLocateMe();
          }}
          title="Use my current location"
          aria-label="Use my current location"
        >
          <MapPin size={20} />
        </button>
      </div>

      <AnimatePresence>
        {showHistory && history.length > 0 && (
          <motion.div
            className="history-dropdown glass"
            initial={{ opacity: 0, y: -10, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -15, scaleY: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="history-header">
              <History size={14} />
              <span>Recent Searches</span>
            </div>
            {history.map((item) => (
              <div
                key={item}
                className="history-item"
                onClick={() => handleSelectHistory(item)}
              >
                <span>{item}</span>
                <button
                  type="button"
                  className="remove-history-btn"
                  onClick={(e) => handleClearHistoryItem(e, item)}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}