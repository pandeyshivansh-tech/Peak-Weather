import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { motion } from "framer-motion";

function SearchBar({ city, setCity, onSearch }) {
  const [inputValue, setInputValue] = useState(city);

  useEffect(() => {
    const delay = setTimeout(() => {
      if (inputValue && inputValue !== city) {
        setCity(inputValue);
        onSearch(inputValue);
      }
    }, 800);

    return () => clearTimeout(delay);
  }, [inputValue, city, setCity, onSearch]);

  return (
    <motion.div 
      className="search-container"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Search className="search-icon" size={20} />
      <input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Search city..."
        className="search-input"
        autoComplete="off"
        spellCheck="false"
      />
    </motion.div>
  );
}

export default SearchBar;