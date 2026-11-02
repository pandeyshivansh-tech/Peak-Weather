import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Mountain, Sparkles, Volume2, VolumeX, LogOut, Key } from "lucide-react";
import { getWeather, getCoordinates, getCityFromCoords } from "./services/api";
import SearchBar from "./components/SearchBar";
import WeatherCard from "./components/WeatherCard";
import PopularCities from "./components/PopularCities";
import WeatherEffectsCanvas from "./components/WeatherEffectsCanvas";
import SkeletonCard from "./components/SkeletonCard";
import AnimeVaultModal from "./components/AnimeVaultModal";
import RainGlassBackground from "./components/RainGlassBackground";
import { getMood, paintScene } from "./services/scene";
import "./styles/vault.css";
import "./styles/app.css";

const ANIME_TITLES = {
  toji: "Toji Fushiguro",
  gojo: "Gojo Satoru",
  sukuna: "Ryomen Sukuna",
  jjk: "Jujutsu Kaisen",
  sololeveling: "Solo Leveling",
  chainsawman: "Chainsaw Man",
  onepiece: "One Piece",
  shanks: "Red-Haired Shanks",
  aot: "Attack on Titan",
  deathnote: "Death Note",
  naruto: "Naruto Shippuden",
  madara: "Madara Uchiha",
  boruto: "Boruto",
  bleach: "Bleach",
  bluelock: "Blue Lock",
  berserk: "Berserk",
  baki: "Baki Hanma",
  tokyoghoul: "Tokyo Ghoul",
  dbz: "Dragon Ball Z",
  opm: "One Punch Man",
  dandadan: "Dandadan",
  fmab: "Fullmetal Alchemist",
  demonslayer: "Demon Slayer",
  hxh: "Hunter x Hunter",
  mha: "My Hero Academia",
  jojo: "JoJo's Bizarre Adventure",
  kaiju: "Kaiju No. 8",
  gachiakuta: "Gachiakuta",
  fireforce: "Fire Force",
  blackclover: "Black Clover",
  drstone: "Dr. Stone",
  windbreaker: "Wind Breaker",
  codegeass: "Code Geass",
  monster: "Monster",
  frieren: "Frieren: Beyond Journey's End",
  apothecary: "The Apothecary Diaries",
  rezero: "Re:Zero",
  mushoku: "Mushoku Tensei",
  slime: "That Time I Got Reincarnated as a Slime",
  spyxfamily: "Spy x Family",
  dressupdarling: "My Dress-Up Darling",
  cote: "Classroom of the Elite",
  kaguyasama: "Kaguya-sama: Love is War",
  highschooldxd: "High School DxD",
  gintama: "Gintama",
  haikyuu: "Haikyu!!",
  yourname: "Your Name",
  suzume: "Suzume",
  silentvoice: "A Silent Voice",
  pancreas: "I Want to Eat Your Pancreas",
  yourlie: "Your Lie in April",
  graveoffireflies: "Grave of the Fireflies",
  fairytail: "Fairy Tail",
  sevendeadlysins: "Seven Deadly Sins",
  assassinationclassroom: "Assassination Classroom",
  sentencedhero: "Sentenced to Be a Hero",
  lookback: "Look Back",
  weathering: "Weathering With You",
  mobpsycho: "Mob Psycho 100",
  pakistan: "Nuclear Blast",
};

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState("");
  const [unit, setUnit] = useState(() => {
    return localStorage.getItem("peak_weather_unit") || "C";
  });
  const [easterEggType, setEasterEggTypeState] = useState(null);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef(null);

  const [discoveredAnime, setDiscoveredAnime] = useState(() => {
    try {
      const saved = localStorage.getItem("peak_weather_discovered_anime");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn("Storage read error:", e);
    }
    return [];
  });

  const [isVaultUnlocked, setIsVaultUnlocked] = useState(() => {
    try {
      return localStorage.getItem("peak_weather_vault_master_unlocked") === "true";
    } catch {
      return false;
    }
  });

  const [isNewDiscovery, setIsNewDiscovery] = useState(false);
  const [showMilestoneToast, setShowMilestoneToast] = useState(false);
  const [prevStandardCount, setPrevStandardCount] = useState(() => {
    try {
      const saved = localStorage.getItem("peak_weather_discovered_anime");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((id) => !["toji", "gojo", "sukuna", "madara", "shanks"].includes(id)).length;
        }
      }
    } catch {}
    return 0;
  });

  // Auto-collapse discovery badge back to just title after 3 seconds
  useEffect(() => {
    if (isNewDiscovery) {
      const timer = setTimeout(() => {
        setIsNewDiscovery(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isNewDiscovery]);

  // Check if standard discoveries just reached 10
  useEffect(() => {
    const standardCount = discoveredAnime.filter(
      (id) => !["toji", "gojo", "sukuna", "madara", "shanks"].includes(id)
    ).length;

    const hasSeen10Milestone = localStorage.getItem("peak_weather_milestone_10_notified") === "true";

    if (standardCount >= 10 && (!hasSeen10Milestone || (prevStandardCount < 10 && standardCount >= 10))) {
      setShowMilestoneToast(true);
      try {
        localStorage.setItem("peak_weather_milestone_10_notified", "true");
      } catch {}

      const timer = setTimeout(() => {
        setShowMilestoneToast(false);
      }, 10000);

      return () => clearTimeout(timer);
    }
    setPrevStandardCount(standardCount);
  }, [discoveredAnime, prevStandardCount]);

  // Sync discoveries to localStorage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem("peak_weather_discovered_anime", JSON.stringify(discoveredAnime));
    } catch (e) {
      console.warn("Storage sync error:", e);
    }
  }, [discoveredAnime]);

  // Handle ESC key to exit active anime edit
  useEffect(() => {
    if (!easterEggType) return;

    const handleGlobalKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setEasterEggType(null);
        setCity("");
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [easterEggType]);

  const markDiscovered = (id) => {
    if (!id || id === "pakistan") return;
    setDiscoveredAnime((prev) => {
      if (!prev.includes(id)) {
        setIsNewDiscovery(true);
        return [...prev, id];
      }
      setIsNewDiscovery(false);
      return prev;
    });
  };

  const setEasterEggType = (id) => {
    setEasterEggTypeState(id);
    if (id && id !== "pakistan") {
      markDiscovered(id);
    } else {
      setIsNewDiscovery(false);
    }
  };

  const toggleUnit = () => {
    const nextUnit = unit === "C" ? "F" : "C";
    setUnit(nextUnit);
    localStorage.setItem("peak_weather_unit", nextUnit);
  };

  const convertTemp = (tempInC) => {
    if (tempInC === undefined || tempInC === null) return "--";
    if (unit === "F") {
      return Math.round((tempInC * 9) / 5 + 32);
    }
    return Math.round(tempInC);
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted, easterEggType]);

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setError("This browser can't share your location.");
      return;
    }
    setIsLocating(true);
    setLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const place = await getCityFromCoords(latitude, longitude);
          const detectedCity = place.name;
          const weatherData = await getWeather(latitude, longitude);

          setCity(detectedCity);
          setWeather({
            name: detectedCity,
            countryCode: place.countryCode,
            current: weatherData.current,
            daily: weatherData.daily,
            hourly: weatherData.hourly,
          });
        } catch {
          setError("The forecast for your location didn't load.");
        } finally {
          setLoading(false);
          setIsLocating(false);
        }
      },
      () => {
        setError("We couldn't get your location.");
        setLoading(false);
        setIsLocating(false);
      },
      { timeout: 10000 }
    );
  }; // 'onepiece' | 'aot' | 'naruto' | 'boruto' | 'sololeveling' | 'deathnote' | 'jjk' | 'chainsawman' | 'gojo' | 'bluelock' | 'vinlandsaga' | 'bleach' | 'demonslayer' | 'fmab' | 'opm' | 'dandadan' | 'dbz' | 'haikyu' | 'gintama' | 'highschooldxd' | 'hxh' | 'mha' | 'jojo' | 'kaiju' | 'gachiakuta' | 'mushoku' | 'rezero' | 'blackclover' | 'drstone' | 'fireforce' | 'windbreaker' | 'spyxfamily' | 'slime' | 'suzume' | 'yourname' | 'silentvoice' | 'cote' | 'dressupdarling' | 'codegeass' | 'frieren' | 'monster' | 'apothecary' | 'pancreas' | 'yourlieinapril' | 'baki' | 'berserk' | 'fairytail' | 'sentencedhero' | 'kaguyasama' | 'graveoffireflies' | 'madara' | 'shanks' | 'toji' | 'tokyoghoul' | 'sevendeadlysins' | 'assassinationclassroom' | null

  const handleSearch = async (searchCity) => {
    if (!searchCity) return;

    // Easter Egg Check
    const normalizedSearch = searchCity.toLowerCase().replace(/[^a-z0-9]/g, "");

    // Pakistan / Nuclear Easter Egg
    if (
      normalizedSearch.includes("pakistan") ||
      normalizedSearch.includes("lahore") ||
      normalizedSearch.includes("islamabad") ||
      normalizedSearch.includes("karachi") ||
      normalizedSearch.includes("rawalpindi") ||
      normalizedSearch.includes("peshawar") ||
      normalizedSearch.includes("quetta") ||
      normalizedSearch.includes("multan") ||
      normalizedSearch.includes("faisalabad") ||
      normalizedSearch.includes("sialkot")
    ) {
      setEasterEggType("pakistan");
      return;
    }

    if (
      normalizedSearch.includes("frieren") ||
      new RegExp("\\bfern\\b", "i").test(searchCity) ||
      new RegExp("\\bstark\\b", "i").test(searchCity) ||
      normalizedSearch.includes("himmel") ||
      normalizedSearch.includes("heiter") ||
      normalizedSearch.includes("eisen")
    ) {
      setEasterEggType("frieren");
      return;
    }

    if (
      normalizedSearch.includes("shanks") ||
      normalizedSearch.includes("redhair") ||
      normalizedSearch.includes("akagami") ||
      normalizedSearch.includes("haki")
    ) {
      setEasterEggType("shanks");
      return;
    }

    if (
      normalizedSearch.includes("onepiece") ||
      normalizedSearch.includes("gear5") ||
      normalizedSearch.includes("luffy") ||
      (new RegExp("\\bpeak\\b", "i").test(searchCity) && !["weather", "district", "mountain", "peakweather", "pikes"].some(w => normalizedSearch.includes(w)))
    ) {
      setEasterEggType("onepiece");
      return;
    }

    if (
      normalizedSearch.includes("attackontitan") ||
      normalizedSearch.includes("aot") ||
      new RegExp("\\beren\\b", "i").test(searchCity)
    ) {
      setEasterEggType("aot");
      return;
    }

    if (
      normalizedSearch.includes("boruto") ||
      normalizedSearch.includes("momoshiki") ||
      normalizedSearch.includes("kawaki") ||
      new RegExp("\\bsarada\\b", "i").test(searchCity) ||
      normalizedSearch.includes("mitsuki") ||
      normalizedSearch.includes("nextgenerations") ||
      normalizedSearch.includes("uzumakiboruto") ||
      new RegExp("\\bkarma\\b", "i").test(searchCity)
    ) {
      setEasterEggType("boruto");
      return;
    }

    if (
      normalizedSearch.includes("naruto") ||
      normalizedSearch.includes("sasuke") ||
      normalizedSearch.includes("shinobi") ||
      normalizedSearch.includes("konoha")
    ) {
      setEasterEggType("naruto");
      return;
    }

    if (
      normalizedSearch.includes("sololeveling") ||
      normalizedSearch.includes("sungjinwoo") ||
      normalizedSearch.includes("arise") ||
      normalizedSearch.includes("jinwoo")
    ) {
      setEasterEggType("sololeveling");
      return;
    }

    if (
      normalizedSearch.includes("deathnote") ||
      (new RegExp("\\bkira\\b", "i").test(searchCity) && !normalizedSearch.includes("kiratpur")) ||
      normalizedSearch.includes("ryuk") ||
      (new RegExp("\\blight\\b", "i").test(searchCity) && !["rain", "snow", "cloud", "shower", "forecast", "weather"].some(w => searchCity.toLowerCase().includes(w)))
    ) {
      setEasterEggType("deathnote");
      return;
    }

    if (
      normalizedSearch.includes("sukuna") ||
      normalizedSearch.includes("ryomen") ||
      normalizedSearch.includes("ryomensukuna") ||
      normalizedSearch.includes("fukumamizushi")
    ) {
      setEasterEggType("sukuna");
      return;
    }

    if (
      normalizedSearch.includes("toji") ||
      normalizedSearch.includes("sorcererkiller") ||
      normalizedSearch.includes("papaguro") ||
      normalizedSearch.includes("heavenlyrestriction") ||
      (normalizedSearch.includes("fushiguro") && normalizedSearch.includes("toji")) ||
      (normalizedSearch.includes("zenin") && normalizedSearch.includes("toji"))
    ) {
      setEasterEggType("toji");
      return;
    }

    if (
      normalizedSearch.includes("jjk") ||
      normalizedSearch.includes("jujutsukaisen") ||
      new RegExp("\\bjudas\\b", "i").test(searchCity)
    ) {
      setEasterEggType("jjk");
      return;
    }

    if (
      normalizedSearch.includes("gojo") ||
      normalizedSearch.includes("satoru") ||
      normalizedSearch.includes("gojosatoru") ||
      normalizedSearch.includes("muryokusho")
    ) {
      setEasterEggType("gojo");
      return;
    }

    if (
      normalizedSearch.includes("chainsawman") ||
      normalizedSearch.includes("csm") ||
      normalizedSearch.includes("denji") ||
      normalizedSearch.includes("reze") ||
      normalizedSearch.includes("bombdevil") ||
      normalizedSearch.includes("pochita") ||
      normalizedSearch.includes("akihayakawa")
    ) {
      setEasterEggType("chainsawman");
      return;
    }

    if (
      normalizedSearch.includes("mydressupdarling") ||
      normalizedSearch.includes("dressupdarling") ||
      normalizedSearch.includes("marin") ||
      normalizedSearch.includes("kitagawa") ||
      normalizedSearch.includes("wakanagi")
    ) {
      setEasterEggType("dressupdarling");
      return;
    }

    if (
      normalizedSearch.includes("bluelock") ||
      (new RegExp("\\brin\\b", "i").test(searchCity) && !normalizedSearch.includes("tohsaka")) ||
      normalizedSearch.includes("isagi") ||
      (new RegExp("\\bego\\b", "i").test(searchCity) && !normalizedSearch.includes("oregon"))
    ) {
      setEasterEggType("bluelock");
      return;
    }

    if (
      normalizedSearch.includes("vinland") ||
      normalizedSearch.includes("thorfinn") ||
      normalizedSearch.includes("askeladd")
    ) {
      setEasterEggType("vinlandsaga");
      return;
    }

    if (
      normalizedSearch.includes("bleach") ||
      normalizedSearch.includes("ichigo") ||
      normalizedSearch.includes("bankai") ||
      normalizedSearch.includes("aizen")
    ) {
      setEasterEggType("bleach");
      return;
    }

    if (
      normalizedSearch.includes("demonslayer") ||
      normalizedSearch.includes("tanjiro") ||
      normalizedSearch.includes("nezuko") ||
      normalizedSearch.includes("rengoku") ||
      normalizedSearch.includes("hashira") ||
      normalizedSearch.includes("muzan")
    ) {
      setEasterEggType("demonslayer");
      return;
    }

    if (
      normalizedSearch.includes("fullmetalalchemist") ||
      normalizedSearch.includes("fmab") ||
      normalizedSearch.includes("edward") ||
      normalizedSearch.includes("alphonse") ||
      normalizedSearch.includes("elric")
    ) {
      setEasterEggType("fmab");
      return;
    }

    if (
      normalizedSearch.includes("onepunchman") ||
      normalizedSearch.includes("opm") ||
      (normalizedSearch.includes("saitama") && !["japan", "city", "weather", "prefecture"].some(w => normalizedSearch.includes(w))) ||
      normalizedSearch.includes("garou") ||
      normalizedSearch.includes("genos")
    ) {
      setEasterEggType("opm");
      return;
    }

    if (
      normalizedSearch.includes("dandadan") ||
      normalizedSearch.includes("okarun") ||
      new RegExp("\\bmomo\\b", "i").test(searchCity) ||
      new RegExp("\\bayase\\b", "i").test(searchCity) ||
      normalizedSearch.includes("turbogranny")
    ) {
      setEasterEggType("dandadan");
      return;
    }

    if (
      normalizedSearch.includes("dragonball") ||
      new RegExp("\\bdragon\\b", "i").test(searchCity) ||
      normalizedSearch.includes("dbz") ||
      normalizedSearch.includes("goku") ||
      normalizedSearch.includes("vegeta") ||
      normalizedSearch.includes("gohan") ||
      normalizedSearch.includes("saiyan")
    ) {
      setEasterEggType("dbz");
      return;
    }

    if (
      normalizedSearch.includes("haikyu") ||
      (new RegExp("\\bhinata\\b", "i").test(searchCity) && !normalizedSearch.includes("hyuga")) ||
      normalizedSearch.includes("kageyama") ||
      normalizedSearch.includes("karasuno") ||
      normalizedSearch.includes("volleyball")
    ) {
      setEasterEggType("haikyuu");
      return;
    }

    if (
      normalizedSearch.includes("gintama") ||
      normalizedSearch.includes("gintoki") ||
      normalizedSearch.includes("yorozuya") ||
      normalizedSearch.includes("shinpachi") ||
      normalizedSearch.includes("kagura")
    ) {
      setEasterEggType("gintama");
      return;
    }

    if (
      normalizedSearch.includes("highschooldxd") ||
      normalizedSearch.includes("dxd") ||
      normalizedSearch.includes("issei") ||
      normalizedSearch.includes("rias") ||
      normalizedSearch.includes("gremory") ||
      normalizedSearch.includes("akeno")
    ) {
      setEasterEggType("highschooldxd");
      return;
    }

    if (
      normalizedSearch.includes("hunterxhunter") ||
      normalizedSearch.includes("hxh") ||
      new RegExp("\\bgon\\b", "i").test(searchCity) ||
      normalizedSearch.includes("killua") ||
      normalizedSearch.includes("hisoka") ||
      normalizedSearch.includes("kurapika")
    ) {
      setEasterEggType("hxh");
      return;
    }

    if (
      normalizedSearch.includes("myheroacademia") ||
      normalizedSearch.includes("mha") ||
      normalizedSearch.includes("deku") ||
      normalizedSearch.includes("midoriya") ||
      normalizedSearch.includes("bakugo") ||
      normalizedSearch.includes("todoroki") ||
      normalizedSearch.includes("allmight")
    ) {
      setEasterEggType("mha");
      return;
    }

    if (
      normalizedSearch.includes("jojo") ||
      normalizedSearch.includes("jotaro") ||
      new RegExp("\\bdio\\b", "i").test(searchCity) ||
      new RegExp("\\bstand\\b", "i").test(searchCity) ||
      normalizedSearch.includes("starplatinum") ||
      normalizedSearch.includes("bizarre") ||
      normalizedSearch.includes("zaawarudo")
    ) {
      setEasterEggType("jojo");
      return;
    }

    if (
      normalizedSearch.includes("kaiju") ||
      normalizedSearch.includes("kafka") ||
      normalizedSearch.includes("hibino") ||
      new RegExp("\\bmina\\b", "i").test(searchCity) ||
      normalizedSearch.includes("ashiro") ||
      normalizedSearch.includes("kikoru") ||
      (new RegExp("\\breno\\b", "i").test(searchCity) && (normalizedSearch.includes("kaiju") || normalizedSearch.includes("anime") || normalizedSearch.includes("ichikawa"))) ||
      normalizedSearch.includes("hoshina")
    ) {
      setEasterEggType("kaiju");
      return;
    }

    if (
      normalizedSearch.includes("gachiakuta") ||
      normalizedSearch.includes("rudo") ||
      normalizedSearch.includes("engine") ||
      normalizedSearch.includes("jinki") ||
      normalizedSearch.includes("zanka")
    ) {
      setEasterEggType("gachiakuta");
      return;
    }

    if (
      normalizedSearch.includes("mushoku") ||
      normalizedSearch.includes("tensei") ||
      normalizedSearch.includes("rudeus") ||
      normalizedSearch.includes("sylphiette") ||
      normalizedSearch.includes("eris") ||
      normalizedSearch.includes("roxy") ||
      normalizedSearch.includes("jobless")
    ) {
      setEasterEggType("mushoku");
      return;
    }

    if (
      normalizedSearch.includes("rezero") ||
      normalizedSearch.includes("subaru") ||
      normalizedSearch.includes("emilia") ||
      new RegExp("\\brem\\b", "i").test(searchCity) ||
      new RegExp("\\bram\\b", "i").test(searchCity) ||
      normalizedSearch.includes("echidna") ||
      normalizedSearch.includes("beatrice")
    ) {
      setEasterEggType("rezero");
      return;
    }

    if (
      normalizedSearch.includes("blackclover") ||
      new RegExp("\\basta\\b", "i").test(searchCity) ||
      normalizedSearch.includes("yuno") ||
      normalizedSearch.includes("yami") ||
      normalizedSearch.includes("noelle") ||
      normalizedSearch.includes("wizardking") ||
      normalizedSearch.includes("antimagic")
    ) {
      setEasterEggType("blackclover");
      return;
    }

    if (
      normalizedSearch.includes("drstone") ||
      normalizedSearch.includes("senku") ||
      normalizedSearch.includes("taiju") ||
      normalizedSearch.includes("yuzuriha") ||
      normalizedSearch.includes("tsukasa") ||
      normalizedSearch.includes("chrome") ||
      normalizedSearch.includes("kohaku")
    ) {
      setEasterEggType("drstone");
      return;
    }

    if (
      normalizedSearch.includes("fireforce") ||
      normalizedSearch.includes("shinra") ||
      normalizedSearch.includes("arthur") ||
      (new RegExp("\\bmaki\\b", "i").test(searchCity) && !normalizedSearch.includes("zenin")) ||
      normalizedSearch.includes("tamaki") ||
      new RegExp("\\bobi\\b", "i").test(searchCity) ||
      normalizedSearch.includes("hinawa") ||
      normalizedSearch.includes("enennoshouboutai")
    ) {
      setEasterEggType("fireforce");
      return;
    }

    if (
      normalizedSearch.includes("iwanttoeatyourpancreas") ||
      normalizedSearch.includes("eatyourpancreas") ||
      normalizedSearch.includes("pancreas") ||
      normalizedSearch.includes("sakura") ||
      normalizedSearch.includes("yamauchi") ||
      normalizedSearch.includes("haruki") ||
      normalizedSearch.includes("shiga") ||
      normalizedSearch.includes("sakurayamauchi")
    ) {
      setEasterEggType("pancreas");
      return;
    }

    if (
      normalizedSearch.includes("windbreaker") ||
      normalizedSearch.includes("haruka") ||
      normalizedSearch.includes("sakuraharuka") ||
      normalizedSearch.includes("harukasakura") ||
      normalizedSearch.includes("umemiya") ||
      normalizedSearch.includes("suo") ||
      normalizedSearch.includes("nirei")
    ) {
      setEasterEggType("windbreaker");
      return;
    }

    if (
      normalizedSearch.includes("spyxfamily") ||
      normalizedSearch.includes("anya") ||
      normalizedSearch.includes("loid") ||
      (new RegExp("\\byor\\b", "i").test(searchCity) && !normalizedSearch.includes("york")) ||
      normalizedSearch.includes("forger") ||
      new RegExp("\\bbond\\b", "i").test(searchCity) ||
      normalizedSearch.includes("twilight") ||
      normalizedSearch.includes("thornprincess")
    ) {
      setEasterEggType("spyxfamily");
      return;
    }

    if (
      normalizedSearch.includes("slime") ||
      normalizedSearch.includes("rimuru") ||
      normalizedSearch.includes("tempest") ||
      normalizedSearch.includes("milim") ||
      normalizedSearch.includes("shion") ||
      normalizedSearch.includes("veldora") ||
      normalizedSearch.includes("reincarnatedasaslime")
    ) {
      setEasterEggType("slime");
      return;
    }

    if (
      normalizedSearch.includes("suzume") ||
      normalizedSearch.includes("souta") ||
      normalizedSearch.includes("iwato") ||
      normalizedSearch.includes("munakata") ||
      normalizedSearch.includes("daijin")
    ) {
      setEasterEggType("suzume");
      return;
    }

    if (
      normalizedSearch.includes("yourname") ||
      normalizedSearch.includes("taki") ||
      normalizedSearch.includes("mitsuha") ||
      normalizedSearch.includes("kiminonawa") ||
      normalizedSearch.includes("tachibana") ||
      normalizedSearch.includes("miyamizu")
    ) {
      setEasterEggType("yourname");
      return;
    }

    if (
      normalizedSearch.includes("asilentvoice") ||
      normalizedSearch.includes("silentvoice") ||
      normalizedSearch.includes("shoya") ||
      normalizedSearch.includes("ishida") ||
      normalizedSearch.includes("shoko") ||
      normalizedSearch.includes("nishimiya") ||
      normalizedSearch.includes("koenokatachi")
    ) {
      setEasterEggType("silentvoice");
      return;
    }

    if (
      normalizedSearch.includes("classroomoftheelite") ||
      new RegExp("\\bcote\\b", "i").test(searchCity) ||
      normalizedSearch.includes("ayanokoji") ||
      normalizedSearch.includes("kiyotaka") ||
      normalizedSearch.includes("horikita") ||
      normalizedSearch.includes("suzune") ||
      normalizedSearch.includes("karuizawa") ||
      new RegExp("\\bkei\\b", "i").test(searchCity)
    ) {
      setEasterEggType("cote");
      return;
    }


    if (
      normalizedSearch.includes("codegeass") ||
      normalizedSearch.includes("lelouch") ||
      normalizedSearch.includes("lamperouge") ||
      normalizedSearch.includes("suzaku") ||
      normalizedSearch.includes("kururugi") ||
      normalizedSearch.includes("c2") ||
      normalizedSearch.includes("cc") ||
      normalizedSearch.includes("zero")
    ) {
      setEasterEggType("codegeass");
      return;
    }

    if (
      normalizedSearch.includes("monster") ||
      normalizedSearch.includes("johan") ||
      normalizedSearch.includes("liebert") ||
      normalizedSearch.includes("tenma") ||
      normalizedSearch.includes("kenzo") ||
      normalizedSearch.includes("nina") ||
      normalizedSearch.includes("fortner")
    ) {
      setEasterEggType("monster");
      return;
    }

    if (
      normalizedSearch.includes("yourlieinapril") ||
      normalizedSearch.includes("ylia") ||
      normalizedSearch.includes("arimakousei") ||
      normalizedSearch.includes("kousei") ||
      new RegExp("\\bkaori\\b", "i").test(searchCity) ||
      normalizedSearch.includes("miyazono") ||
      normalizedSearch.includes("kaorimiyazono") ||
      normalizedSearch.includes("tsubaki") ||
      normalizedSearch.includes("watari")
    ) {
      setEasterEggType("yourlie");
      return;
    }

    if (
      normalizedSearch.includes("bakihanma") ||
      normalizedSearch.includes("baki") ||
      normalizedSearch.includes("yujiro") ||
      normalizedSearch.includes("hanma") ||
      normalizedSearch.includes("ogre") ||
      normalizedSearch.includes("pickles")
    ) {
      setEasterEggType("baki");
      return;
    }

    if (
      normalizedSearch.includes("theapothecarydiaries") ||
      normalizedSearch.includes("apothecarydiaries") ||
      normalizedSearch.includes("maomao") ||
      normalizedSearch.includes("jinshi") ||
      normalizedSearch.includes("kusuriya")
    ) {
      setEasterEggType("apothecary");
      return;
    }




    if (
      normalizedSearch.includes("berserk") ||
      normalizedSearch.includes("guts") ||
      normalizedSearch.includes("griffith") ||
      normalizedSearch.includes("casca") ||
      normalizedSearch.includes("behelit") ||
      normalizedSearch.includes("eclipse") ||
      normalizedSearch.includes("brandofsacrifice")
    ) {
      setEasterEggType("berserk");
      return;
    }

    if (
      normalizedSearch.includes("fairytail") ||
      normalizedSearch.includes("natsu") ||
      normalizedSearch.includes("lucy") ||
      normalizedSearch.includes("erza") ||
      normalizedSearch.includes("grayfullbuster") ||
      normalizedSearch.includes("dragonslayer") ||
      normalizedSearch.includes("zeref") ||
      normalizedSearch.includes("mavis")
    ) {
      setEasterEggType("fairytail");
      return;
    }

    if (
      normalizedSearch.includes("sentencedtobeahero") ||
      normalizedSearch.includes("zaiakutonohero") ||
      normalizedSearch.includes("zaiaku") ||
      normalizedSearch.includes("herosentencing")
    ) {
      setEasterEggType("sentencedhero");
      return;
    }

    if (
      normalizedSearch.includes("kaguyasama") ||
      normalizedSearch.includes("loveiswar") ||
      normalizedSearch.includes("kaguya") ||
      new RegExp("\\bmiyuki\\b", "i").test(searchCity) ||
      new RegExp("\\bchika\\b", "i").test(searchCity) ||
      normalizedSearch.includes("ishigami") ||
      normalizedSearch.includes("hayasaka")
    ) {
      setEasterEggType("kaguyasama");
      return;
    }

    if (
      normalizedSearch.includes("graveofthefireflies") ||
      normalizedSearch.includes("fireflies") ||
      normalizedSearch.includes("hotarunohaka") ||
      new RegExp("\\bseita\\b", "i").test(searchCity) ||
      new RegExp("\\bsetsuko\\b", "i").test(searchCity)
    ) {
      setEasterEggType("graveoffireflies");
      return;
    }

    if (
      normalizedSearch.includes("madara") ||
      normalizedSearch.includes("ghostofuchiha") ||
      (normalizedSearch.includes("uchiha") && normalizedSearch.includes("madara")) ||
      normalizedSearch.includes("sharingan") ||
      normalizedSearch.includes("rinnegan")
    ) {
      setEasterEggType("madara");
      return;
    }

    if (
      normalizedSearch.includes("tokyoghoul") ||
      normalizedSearch.includes("kaneki") ||
      normalizedSearch.includes("kenkaneki") ||
      normalizedSearch.includes("touka") ||
      normalizedSearch.includes("anteiku") ||
      normalizedSearch.includes("ghoul") ||
      normalizedSearch.includes("haise") ||
      normalizedSearch.includes("sasakihaise") ||
      normalizedSearch.includes("oneneighedghoul")
    ) {
      setEasterEggType("tokyoghoul");
      return;
    }

    if (
      normalizedSearch.includes("sevendeadlysins") ||
      normalizedSearch.includes("nanatsunotaizai") ||
      normalizedSearch.includes("sds") ||
      normalizedSearch.includes("meliodas") ||
      normalizedSearch.includes("escanor") ||
      new RegExp("\\bban\\b", "i").test(searchCity) ||
      normalizedSearch.includes("merlin") ||
      normalizedSearch.includes("gowther") ||
      normalizedSearch.includes("kingharlequin") ||
      normalizedSearch.includes("elizabethliones") ||
      normalizedSearch.includes("zeldris")
    ) {
      setEasterEggType("sevendeadlysins");
      return;
    }

    if (
      normalizedSearch.includes("assassinationclassroom") ||
      normalizedSearch.includes("ansatsukyoushitsu") ||
      normalizedSearch.includes("korosensei") ||
      normalizedSearch.includes("nagisa") ||
      normalizedSearch.includes("karmaakabane") ||
      (normalizedSearch.includes("akabane") && (normalizedSearch.includes("karma") || normalizedSearch.includes("anime") || normalizedSearch.includes("classroom"))) ||
      normalizedSearch.includes("assassination")
    ) {
      setEasterEggType("assassinationclassroom");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const geoData = await getCoordinates(searchCity);

      if (!geoData.results || geoData.results.length === 0) {
        setError(`We couldn't find "${searchCity}".`);
        setLoading(false);
        return;
      }

      const { latitude, longitude, name, country, country_code, admin1 } = geoData.results[0];
      const weatherData = await getWeather(latitude, longitude);

      setWeather({
        name,
        countryCode: country_code || null,
        region: [admin1, country].filter((part) => part && part !== name).slice(-1)[0],
        current: weatherData.current,
        daily: weatherData.daily,
        hourly: weatherData.hourly,
      });
    } catch {
      setError("The forecast didn't load.");
    } finally {
      setLoading(false);
    }
  };

  const mood = useMemo(
    () => getMood(weather, import.meta.env.DEV ? new URLSearchParams(location.search).get("effect") : null),
    [weather]
  );
  const sceneSrc = useMemo(() => paintScene(mood), [mood]);

  // A new place starts at the top, with its temperature in view.
  useEffect(() => {
    if (weather) window.scrollTo({ top: 0 });
  }, [weather]);

  if (easterEggType) {
    const videoSrc = `/${easterEggType}.mp4`;

    return (
      <div className="easter-egg-container">
        <div className="easter-egg-top-bar">
          <div className="easter-egg-info">
            <span className="live-dot"></span>
            <span className="easter-egg-title">
              {ANIME_TITLES[easterEggType] || easterEggType.toUpperCase()}
            </span>
            <AnimatePresence>
              {isNewDiscovery && (
                <motion.div
                  className="easter-egg-badge-wrapper"
                  initial={{ width: 0, opacity: 0, marginLeft: 0 }}
                  animate={{ width: "auto", opacity: 1, marginLeft: 8 }}
                  exit={{ width: 0, opacity: 0, marginLeft: 0 }}
                  transition={{ duration: 0.58, ease: [0.16, 1, 0.3, 1] }}
                >
                  <span className="easter-egg-discovery-text">
                    <span className="discovery-dot-sep">•</span>
                    <Sparkles size={13} className="discovery-sparkle-gold" />
                    <span className="discovery-gradient-words">New find, added to the vault</span>
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="easter-egg-actions">
            <button
              type="button"
              className="easter-egg-control-btn"
              onClick={() => {
                const nextState = !isMuted;
                setIsMuted(nextState);
                if (videoRef.current) {
                  videoRef.current.muted = nextState;
                  if (!nextState) {
                    videoRef.current.volume = 1;
                    videoRef.current.play().catch(() => {});
                  }
                }
              }}
              title={isMuted ? "Unmute Audio" : "Mute Audio"}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              <span>{isMuted ? "Unmute" : "Mute"}</span>
            </button>
            <button
              type="button"
              className="close-easter-egg"
              onClick={() => {
                setEasterEggType(null);
                setCity(""); // Reset to default
              }}
              title="Exit Peak (Esc)"
            >
              <LogOut size={16} />
              <span>Exit Peak</span>
            </button>
          </div>
        </div>
        <video
          ref={videoRef}
          src={videoSrc}
          autoPlay loop muted={isMuted} playsInline
          className="easter-egg-iframe"
        />
      </div>
    );
  }

  const goHome = () => {
    setWeather(null);
    setError("");
    setCity("");
  };

  return (
    <div className="app" style={{ "--tint": mood.tint, "--sky": mood.sky[1] }}>
      <RainGlassBackground src={sceneSrc} rain={mood.rain} drops={mood.drops} fogAmount={mood.fogAmount} fog={mood.fog} />

      <WeatherEffectsCanvas effect={mood.effect} thunder={mood.thunder} />

      <header className="topbar">
        <a
          className="wordmark"
          href="/"
          onClick={(e) => {
            e.preventDefault();
            goHome();
          }}
        >
          <span className="wordmark-mark">
            <Mountain size={24} strokeWidth={2.25} aria-hidden="true" />
          </span>
          Peak Weather
        </a>

        <SearchBar
          key={weather ? "with-weather" : "home"}
          city={city}
          setCity={setCity}
          onSearch={handleSearch}
          onLocateMe={handleLocateMe}
          isLocating={isLocating}
        />

        <div className="units" role="group" aria-label="Temperature unit">
          <button type="button" aria-pressed={unit === "C"} onClick={() => unit !== "C" && toggleUnit()}>
            °C
          </button>
          <button type="button" aria-pressed={unit === "F"} onClick={() => unit !== "F" && toggleUnit()}>
            °F
          </button>
        </div>
      </header>

      <main className="stage">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" exit={{ opacity: 0 }}>
              <SkeletonCard />
            </motion.div>
          ) : error ? (
            <motion.section
              key="error"
              className="notice"
              role="alert"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <h1 className="notice-title">{error}</h1>
              <p>Search for a city by name, check the spelling, or try a nearby larger town. If you are offline, reconnect first.</p>
              <button type="button" className="button-primary" onClick={goHome}>
                Back to the start
              </button>
            </motion.section>
          ) : weather ? (
            <motion.div key={`weather-${weather.name}`} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}>
              <WeatherCard weather={weather} unit={unit} convertTemp={convertTemp} />
            </motion.div>
          ) : (
            <motion.div key="home" exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}>
              <PopularCities
                unit={unit}
                convertTemp={convertTemp}
                onLocateMe={handleLocateMe}
                isLocating={isLocating}
                onCityClick={(selectedCity) => {
                  setCity(selectedCity);
                  handleSearch(selectedCity);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Mystery Anime Vault Button & Milestone Popup (Fixed Bottom-Right) */}
      <div className="floating-vault-container">
        <AnimatePresence>
          {showMilestoneToast && (
            <motion.div
              className="vault-milestone-toast"
              onClick={() => {
                setIsVaultOpen(true);
                setShowMilestoneToast(false);
              }}
              initial={{ opacity: 0, x: 60, scale: 0.4 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.2 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="milestone-toast-icon-wrap">
                <Key size={16} className="milestone-toast-key" />
              </div>
              <div className="milestone-toast-text">
                <strong>Master key unlocked</strong>
                <span>10 anime found</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          className="floating-vault-fab"
          onClick={() => setIsVaultOpen(true)}
          aria-label="Secret Anime Vault"
          title="Secret anime vault"
          whileHover={{ scale: 1.12, rotate: 8 }}
          whileTap={{ scale: 0.92 }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 350, damping: 22 }}
        >
          <Sparkles size={24} className="fab-sparkle-icon" />
          {discoveredAnime.length > 0 && (
            <span className="fab-discovery-badge">
              {discoveredAnime.length}
            </span>
          )}
        </motion.button>
      </div>

      <AnimeVaultModal
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
        onSelectAnime={(animeId) => setEasterEggType(animeId)}
        discoveredAnime={discoveredAnime}
        isVaultUnlocked={isVaultUnlocked}
        onUnlockVault={() => {
          setIsVaultUnlocked(true);
          try {
            localStorage.setItem("peak_weather_vault_master_unlocked", "true");
          } catch {}
        }}
        onLockVault={() => {
          setIsVaultUnlocked(false);
          try {
            localStorage.setItem("peak_weather_vault_master_unlocked", "false");
          } catch {}
        }}
        onResetProgress={() => {
          setDiscoveredAnime([]);
          setIsVaultUnlocked(false);
          setShowMilestoneToast(false);
          setPrevStandardCount(0);
          try {
            localStorage.removeItem("peak_weather_discovered_anime");
            localStorage.removeItem("peak_weather_vault_master_unlocked");
            localStorage.removeItem("peak_weather_milestone_10_notified");
          } catch {}
        }}
      />

      <footer className="footer">
        <div className="footer-credits">
          <p className="footer-maker">
            Made by <strong>Shivansh Pandey</strong>
          </p>
          <p className="footer-app">Peak Weather</p>
        </div>
        <nav className="socials" aria-label="Shivansh Pandey elsewhere">
          <a href="https://github.com/pandeyshivansh-tech" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><i className="fab fa-github" aria-hidden="true"></i></a>
          <a href="https://www.linkedin.com/in/shivansh-pandey-87bab5373" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><i className="fab fa-linkedin" aria-hidden="true"></i></a>
          <a href="https://x.com/itshivanshere" target="_blank" rel="noopener noreferrer" aria-label="X"><i className="fa-brands fa-x-twitter" aria-hidden="true"></i></a>
          <a href="https://www.instagram.com/itshivanshere?igsh=b3FsZWh3ZnlydDd5" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><i className="fab fa-instagram" aria-hidden="true"></i></a>
        </nav>
        <p className="footer-source">
          Forecast data from
          <a className="source-chip" href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">
            Open-Meteo <ArrowUpRight size={11} aria-hidden="true" />
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;