import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Play } from "lucide-react";

export const ANIME_CHARACTERS = [
  // ==========================================
  // SPECIAL HONOURABLE CHARACTERS (5 GOATs)
  // ==========================================
  { id: "toji", name: "Toji Fushiguro", anime: "Jujutsu Kaisen", category: "honourable" },
  { id: "gojo", name: "Gojo Satoru", anime: "Jujutsu Kaisen", category: "honourable" },
  { id: "sukuna", name: "Ryomen Sukuna", anime: "Jujutsu Kaisen", category: "honourable" },
  { id: "madara", name: "Madara Uchiha", anime: "Naruto Shippuden", category: "honourable" },
  { id: "shanks", name: "Red-Haired Shanks", anime: "One Piece", category: "honourable" },

  // ==========================================
  // ALL ANIME (50+ Full Anime Roster)
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
  { id: "dbz", name: "Dragon Ball Z", anime: "Goku & Vegeta", category: "hype" },
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

const CATEGORIES = [
  { id: "all", label: "All Anime" },
  { id: "honourable", label: "👑 Honourables", special: true },
  { id: "action", label: "Action" },
  { id: "hype", label: "Hype" },
  { id: "dark", label: "Dark" },
  { id: "drama", label: "Drama / Romance" },
];

export default function AnimeVaultModal({ isOpen, onClose, onSelectAnime }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    if (isOpen) {
      const origOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = origOverflow;
      };
    }
  }, [isOpen]);

  const filteredCharacters = useMemo(() => {
    return ANIME_CHARACTERS.filter((char) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        char.name.toLowerCase().includes(query) ||
        char.anime.toLowerCase().includes(query);

      let matchesCategory = false;
      if (selectedCategory === "all") {
        // Special Honourable characters do not appear in All Anime
        matchesCategory = char.category !== "honourable";
      } else {
        matchesCategory = char.category === selectedCategory;
      }

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="vault-backdrop"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="vault-modal glass"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header */}
            <div className="vault-header">
              <div className="vault-title-box">
                <h2>Anime Vault</h2>
                <p>Select any anime or character to play</p>
              </div>
              <button className="vault-close-btn glass" onClick={onClose} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            {/* Controls */}
            <div className="vault-controls">
              <div className="vault-search-wrapper glass">
                <Search size={18} className="vault-search-icon" />
                <input
                  type="text"
                  placeholder="Search anime or character..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button className="vault-clear-search" onClick={() => setSearchQuery("")}>
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="vault-category-tabs">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    className={`vault-cat-pill glass ${cat.special ? "honourable-tab" : ""} ${selectedCategory === cat.id ? "active" : ""}`}
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Cards Grid */}
            <div className="vault-grid">
              {filteredCharacters.length > 0 ? (
                filteredCharacters.map((char) => (
                  <div
                    key={char.id}
                    className={`vault-card ${char.category === "honourable" ? "honourable-card" : ""}`}
                    onClick={() => {
                      onSelectAnime(char.id);
                      onClose();
                    }}
                  >
                    <div className="vault-card-body">
                      <div className="vault-card-title-row">
                        <h4 className="vault-card-name">{char.name}</h4>
                        {char.category === "honourable" && (
                          <span className="honourable-badge">👑 GOAT</span>
                        )}
                      </div>
                      <p className="vault-card-anime">{char.anime}</p>
                    </div>
                    <div className={`vault-card-play-icon ${char.category === "honourable" ? "honourable-play-icon" : ""}`}>
                      <Play size={14} fill="currentColor" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="vault-empty">
                  <p>No results for "{searchQuery}"</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
