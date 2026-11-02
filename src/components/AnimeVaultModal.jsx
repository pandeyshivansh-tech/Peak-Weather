import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EASE_OUT, EASE_IN } from "../services/motion";
import {
  X,
  Search,
  Play,
  Lock,
  Sparkles,
  Key,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  ShieldAlert,
  Flame,
  Database,
  Crown,
} from "lucide-react";

export const ANIME_CHARACTERS = [
  // ==========================================
  // SPECIAL HONOURABLE CHARACTERS (5 OPs)
  // ==========================================
  { id: "toji", name: "Toji Fushiguro", anime: "Jujutsu Kaisen", category: "honourable" },
  { id: "gojo", name: "Gojo Satoru", anime: "Jujutsu Kaisen", category: "honourable" },
  { id: "sukuna", name: "Ryomen Sukuna", anime: "Jujutsu Kaisen", category: "honourable" },
  { id: "madara", name: "Madara Uchiha", anime: "Naruto Shippuden", category: "honourable" },
  { id: "shanks", name: "Red-Haired Shanks", anime: "One Piece", category: "honourable" },

  // ==========================================
  // ALL ANIME (55+ Full Anime Roster)
  // ==========================================
  { id: "jjk", name: "Jujutsu Kaisen", anime: "Jujutsu Kaisen", category: "action" },
  { id: "sololeveling", name: "Solo Leveling", anime: "Sung Jin-Woo", category: "hype" },
  { id: "chainsawman", name: "Chainsaw Man", anime: "Denji & Reze", category: "action" },
  { id: "onepiece", name: "One Piece", anime: "Luffy", category: "hype" },
  { id: "aot", name: "Attack on Titan", anime: "Eren Yeager", category: "dark" },
  { id: "deathnote", name: "Death Note", anime: "Light & L", category: "dark" },
  { id: "naruto", name: "Naruto Shippuden", anime: "Naruto & Sasuke", category: "action" },
  { id: "boruto", name: "Boruto", anime: "Two Blue Vortex", category: "action" },
  { id: "bleach", name: "Bleach", anime: "Ichigo Kurosaki", category: "hype" },
  { id: "bluelock", name: "Blue Lock", anime: "Isagi & Rin", category: "hype" },
  { id: "berserk", name: "Berserk", anime: "Guts", category: "dark" },
  { id: "baki", name: "Baki Hanma", anime: "Baki & Yujiro", category: "hype" },
  { id: "tokyoghoul", name: "Tokyo Ghoul", anime: "Ken Kaneki", category: "dark" },
  { id: "dbs", name: "Dragon Ball Super", anime: "Goku & Vegeta", category: "hype" },
  { id: "opm", name: "One Punch Man", anime: "Saitama", category: "hype" },
  { id: "dandadan", name: "Dandadan", anime: "Momo & Okarun", category: "action" },
  { id: "fmab", name: "Fullmetal Alchemist", anime: "Edward Elric", category: "action" },
  { id: "demonslayer", name: "Demon Slayer", anime: "Tanjiro & Rengoku", category: "action" },
  { id: "hxh", name: "Hunter x Hunter", anime: "Gon & Killua", category: "action" },
  { id: "mha", name: "My Hero Academia", anime: "Deku & All Might", category: "action" },
  { id: "jojo", name: "JoJo's Bizarre Adventure", anime: "Jotaro & Dio", category: "hype" },
  { id: "kaiju", name: "Kaiju No. 8", anime: "Kafka Hibino", category: "action" },
  { id: "gachiakuta", name: "Gachiakuta", anime: "Rudo", category: "action" },
  { id: "fireforce", name: "Fire Force", anime: "Shinra Kusakabe", category: "action" },
  { id: "blackclover", name: "Black Clover", anime: "Asta & Yuno", category: "action" },
  { id: "drstone", name: "Dr. Stone", anime: "Senku Ishigami", category: "action" },
  { id: "windbreaker", name: "Wind Breaker", anime: "Haruka Sakura", category: "action" },
  { id: "codegeass", name: "Code Geass", anime: "Lelouch", category: "dark" },
  { id: "monster", name: "Monster", anime: "Johan Liebert", category: "dark" },
  { id: "frieren", name: "Frieren: Beyond Journey's End", anime: "Frieren", category: "drama" },
  { id: "apothecary", name: "The Apothecary Diaries", anime: "Maomao", category: "drama" },
  { id: "rezero", name: "Re:Zero", anime: "Subaru & Emilia", category: "dark" },
  { id: "mushoku", name: "Mushoku Tensei", anime: "Rudeus Greyrat", category: "action" },
  { id: "slime", name: "That Time I Got Reincarnated as a Slime", anime: "Rimuru Tempest", category: "action" },
  { id: "spyxfamily", name: "Spy x Family", anime: "Anya & Forgers", category: "drama" },
  { id: "dressupdarling", name: "My Dress-Up Darling", anime: "Marin Kitagawa", category: "drama" },
  { id: "cote", name: "Classroom of the Elite", anime: "Kiyotaka Ayanokoji", category: "dark" },
  { id: "kaguyasama", name: "Kaguya-sama: Love is War", anime: "Kaguya & Miyuki", category: "drama" },
  { id: "highschooldxd", name: "High School DxD", anime: "Issei & Rias", category: "hype" },
  { id: "gintama", name: "Gintama", anime: "Gintoki Sakata", category: "action" },
  { id: "haikyuu", name: "Haikyu!!", anime: "Hinata & Kageyama", category: "hype" },
  { id: "vinlandsaga", name: "Vinland Saga", anime: "Thorfinn", category: "drama" },
  { id: "mobpsycho", name: "Mob Psycho 100", anime: "Mob & Reigen", category: "action" },
  { id: "yourname", name: "Your Name", anime: "Taki & Mitsuha", category: "drama" },
  { id: "suzume", name: "Suzume", anime: "Suzume & Souta", category: "drama" },
  { id: "weathering", name: "Weathering With You", anime: "Hodaka & Hina", category: "drama" },
  { id: "silentvoice", name: "A Silent Voice", anime: "Shoya & Shoko", category: "drama" },
  { id: "lookback", name: "Look Back", anime: "Fujino & Kyomoto", category: "drama" },
  { id: "pancreas", name: "I Want to Eat Your Pancreas", anime: "Sakura & Haruki", category: "drama" },
  { id: "yourlie", name: "Your Lie in April", anime: "Kousei & Kaori", category: "drama" },
  { id: "graveoffireflies", name: "Grave of the Fireflies", anime: "Studio Ghibli", category: "drama" },
  { id: "fairytail", name: "Fairy Tail", anime: "Natsu Dragneel", category: "action" },
  { id: "sevendeadlysins", name: "Seven Deadly Sins", anime: "Meliodas & Escanor", category: "hype" },
  { id: "assassinationclassroom", name: "Assassination Classroom", anime: "Koro-sensei", category: "drama" },
  { id: "sentencedhero", name: "Sentenced to Be a Hero", anime: "Hero", category: "dark" },
];

const HONOURABLE_IDS = ["toji", "gojo", "sukuna", "madara", "shanks"];

export default function AnimeVaultModal({
  isOpen,
  onClose,
  onSelectAnime,
  discoveredAnime = [],
  isVaultUnlocked = false,
  onUnlockVault,
  onLockVault,
  onResetProgress,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [shakingCardId, setShakingCardId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [showPromptBanner, setShowPromptBanner] = useState(true);

  const searchInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const origOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = origOverflow;
      };
    }
  }, [isOpen]);

  // Global modal keyboard shortcuts: ESC to close, / to search
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "/" && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Standard non-honourable discoveries count (milestone is 10)
  const standardDiscoveredCount = useMemo(() => {
    return discoveredAnime.filter((id) => !HONOURABLE_IDS.includes(id)).length;
  }, [discoveredAnime]);

  const honourableDiscoveredCount = useMemo(() => {
    return discoveredAnime.filter((id) => HONOURABLE_IDS.includes(id)).length;
  }, [discoveredAnime]);

  const totalDiscoveredCount = discoveredAnime.length;
  const canMasterUnlock = standardDiscoveredCount >= 10;
  const progressPercent = Math.min(Math.round((standardDiscoveredCount / 10) * 100), 100);

  const categoryCounts = useMemo(() => {
    return {
      all: ANIME_CHARACTERS.filter((c) => c.category !== "honourable").length,
      action: ANIME_CHARACTERS.filter((c) => c.category === "action").length,
      hype: ANIME_CHARACTERS.filter((c) => c.category === "hype").length,
      dark: ANIME_CHARACTERS.filter((c) => c.category === "dark").length,
      drama: ANIME_CHARACTERS.filter((c) => c.category === "drama").length,
    };
  }, []);

  const categories = useMemo(() => [
    { id: "all", label: "All", count: categoryCounts.all },
    { id: "discovered", label: "Found", count: totalDiscoveredCount },
    { id: "honourable", label: "Honourables", count: 5, special: true },
    { id: "action", label: "Action", count: categoryCounts.action },
    { id: "hype", label: "Hype", count: categoryCounts.hype },
    { id: "dark", label: "Dark", count: categoryCounts.dark },
    { id: "drama", label: "Drama", count: categoryCounts.drama },
  ], [totalDiscoveredCount, categoryCounts]);

  // Enter in search bar to play first matching playable anime
  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter" && filteredCharacters.length > 0) {
      const firstPlayable = filteredCharacters.find(
        (c) => isVaultUnlocked || discoveredAnime.includes(c.id)
      );
      if (firstPlayable) {
        onSelectAnime(firstPlayable.id);
        onClose();
      }
    }
  };

  const filteredCharacters = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return ANIME_CHARACTERS.filter((char) => {
      const isDiscovered = discoveredAnime.includes(char.id);

      const matchesSearch =
        !query ||
        char.name.toLowerCase().includes(query) ||
        char.anime.toLowerCase().includes(query) ||
        char.category.toLowerCase().includes(query);

      let matchesCategory = false;
      if (selectedCategory === "all") {
        matchesCategory = char.category !== "honourable";
      } else if (selectedCategory === "discovered") {
        matchesCategory = isDiscovered;
      } else {
        matchesCategory = char.category === selectedCategory;
      }

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, discoveredAnime]);

  const handleCardClick = (char) => {
    const isDiscovered = discoveredAnime.includes(char.id);
    const isUnlocked = isVaultUnlocked || isDiscovered;

    if (isUnlocked) {
      onSelectAnime(char.id);
      onClose();
    } else {
      // Shaking feedback and hint toast
      setShakingCardId(char.id);
      setTimeout(() => setShakingCardId(null), 500);

      const isHonourable = char.category === "honourable";
      setToastMessage(
        isHonourable
          ? "Search this character in the search bar to unlock"
          : "Search for this anime in the search bar to unlock"
      );

      setTimeout(() => {
        setToastMessage(null);
      }, 3000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="vault-backdrop"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.28, ease: EASE_OUT } }}
          exit={{ opacity: 0, transition: { duration: 0.18, ease: EASE_IN, delay: 0.04 } }}
        >
          <motion.div
            className="vault-modal" role="dialog" aria-modal="true" aria-labelledby="vault-title"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.42, ease: EASE_OUT } }}
            exit={{ opacity: 0, scale: 0.98, y: 6, transition: { duration: 0.18, ease: EASE_IN } }}
          >
            {/* Header */}
            <div className="vault-header">
              <div className="vault-title-box">
                <div className="vault-title-row">
                  <h2 id="vault-title">Anime vault</h2>
                  <span className="vault-count-badge">
                    {totalDiscoveredCount} of 55 found
                  </span>
                  {!isVaultUnlocked && (
                    canMasterUnlock ? (
                      <span className="vault-status-chip ready">
                        <Key size={13} /> Key unlocked
                      </span>
                    ) : (
                      <span className="vault-status-chip tracking">
                        <Flame size={13} /> {standardDiscoveredCount} of 10 for the key
                      </span>
                    )
                  )}
                </div>
              </div>

              <div className="vault-header-right">
                {canMasterUnlock && !isVaultUnlocked && (
                  <button
                    className="vault-action-btn unlock-btn"
                    onClick={() => onUnlockVault?.()}
                    title="Unlock the whole vault"
                  >
                    <Key size={14} />
                    <span>Unlock vault</span>
                  </button>
                )}
                {isVaultUnlocked && onLockVault && (
                  <button
                    className="vault-action-btn relock-btn"
                    onClick={() => onLockVault()}
                    title="Lock Vault to continue discovering manually"
                  >
                    <Lock size={13} />
                    <span>Lock again</span>
                  </button>
                )}
                <button className="vault-close-btn" onClick={onClose} aria-label="Close">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Progression Bar — dedicated purely to the initial 10 anime hunt */}
            {!canMasterUnlock && !isVaultUnlocked && (
              <div className="vault-progression-panel">
                <div className="vault-progress-bar-wrap">
                  <div className="vault-progress-header">
                    <span className="progress-text">
                      Find 10 anime to earn the master key
                    </span>
                    <span className="progress-count-pill">
                      <strong>{standardDiscoveredCount}</strong> / 10
                    </span>
                  </div>
                  <div className="vault-progress-track">
                    <div
                      className="vault-progress-fill"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Controls: Search & Category Pills */}
            <div className="vault-controls">
              <div className="vault-search-wrapper">
                <Search size={16} className="vault-search-icon" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search anime or character"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                />
                {searchQuery ? (
                  <button
                    className="vault-clear-search"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search"
                  >
                    <X size={13} />
                  </button>
                ) : (
                  <span className="vault-search-kbd" title="Press / to search">/</span>
                )}
              </div>

              <div className="vault-category-tabs" role="tablist">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    role="tab"
                    aria-selected={selectedCategory === cat.id}
                    className={`vault-cat-pill ${cat.special ? "honourable-tab" : ""} ${
                      selectedCategory === cat.id ? "active" : ""
                    }`}
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    <span className="cat-pill-label">{cat.label}</span>
                    <span className="cat-pill-badge">{cat.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Floating Toast Notification */}
            <AnimatePresence>
              {toastMessage && (
                <motion.div
                  className="vault-toast"
                  initial={{ opacity: 0, y: 12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: EASE_OUT } }}
                  exit={{ opacity: 0, y: 6, scale: 0.97, transition: { duration: 0.16, ease: EASE_IN } }}
                >
                  <Sparkles size={14} className="vault-toast-icon" />
                  <span>{toastMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Cards Grid */}
            <div className="vault-grid">
              {filteredCharacters.length > 0 ? (
                filteredCharacters.map((char) => {
                  const isDiscovered = discoveredAnime.includes(char.id);
                  const isUnlocked = isVaultUnlocked || isDiscovered;
                  const isHonourable = char.category === "honourable";
                  const isShaking = shakingCardId === char.id;

                  return (
                    <div
                      key={char.id}
                      className={`vault-card ${isHonourable ? "honourable-card" : ""} ${
                        !isUnlocked ? "locked-card" : "unlocked-card"
                      } ${isShaking ? "shake-locked" : ""}`}
                      onClick={() => handleCardClick(char)}
                      title={
                        isUnlocked
                          ? `Play ${char.name}`
                          : `Search in weather bar to unlock`
                      }
                    >
                      <div className="vault-card-body">
                        {isUnlocked ? (
                          <>
                            <div className="vault-card-title-row">
                              <h4 className="vault-card-name" title={char.name}>
                                {char.name}
                              </h4>
                              {isHonourable && (
                                <span className="honourable-badge"><Crown size={12} aria-hidden="true" /> OP</span>
                              )}
                              {isDiscovered && isVaultUnlocked && !isHonourable && (
                                <span className="discovered-badge" title="Discovered">
                                  <Sparkles size={11} /> Found
                                </span>
                              )}
                            </div>
                            <p className="vault-card-anime" title={char.anime}>{char.anime}</p>
                          </>
                        ) : (
                          <>
                            <div className="vault-card-title-row">
                              <span className={`locked-genre-pill ${isHonourable ? "honourable-pill" : ""}`}>
                                {isHonourable ? "OP" : char.category}
                              </span>
                              <h4 className={`vault-card-name locked-name ${isHonourable ? "honourable-name" : ""}`}>
                                {isHonourable ? "Secret Honourable" : "Mystery Anime"}
                              </h4>
                            </div>
                            <p className="vault-card-anime locked-hint">
                              Search its name to reveal
                            </p>
                          </>
                        )}
                      </div>

                      <div
                        className={`vault-card-play-icon ${
                          isHonourable ? "honourable-play-icon" : ""
                        } ${!isUnlocked ? "locked-icon-badge" : ""}`}
                      >
                        {isUnlocked ? (
                          <Play size={13} fill="currentColor" />
                        ) : (
                          <Lock size={13} className="lock-icon" />
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="vault-empty">
                  {selectedCategory === "discovered" ? (
                    <div className="vault-empty-discovered">
                      <HelpCircle size={28} className="vault-empty-icon" />
                      <p>No anime discovered yet in your browser.</p>
                      <span className="vault-empty-sub">
                        Type anime names like <strong>Luffy</strong>,{" "}
                        <strong>Gojo</strong>, or <strong>Eren</strong> into the weather search bar!
                      </span>
                    </div>
                  ) : (
                    <p>No results for "{searchQuery}"</p>
                  )}
                </div>
              )}

              {/* Red Reset Button at the bottom of scrolling cards */}
              {onResetProgress && (
                <div className="vault-reset-section">
                  <button
                    type="button"
                    className="vault-danger-reset-btn"
                    onClick={() => {
                      if (window.confirm("Reset all discovered anime and progress? This cannot be undone.")) {
                        onResetProgress();
                      }
                    }}
                    title="Reset all progress and lock vault"
                  >
                    <RotateCcw size={13} />
                    <span>Reset all progress</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
