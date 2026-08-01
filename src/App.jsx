import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Mountain } from "lucide-react";
import { getWeather, getCoordinates, getCityFromCoords } from "./services/api";
import SearchBar from "./components/SearchBar";
import WeatherCard from "./components/WeatherCard";
import PopularCities from "./components/PopularCities";
import FloatingElements from "./components/FloatingElements";
import WeatherEffectsCanvas from "./components/WeatherEffectsCanvas";
import SkeletonCard from "./components/SkeletonCard";
import "./App.css";

const getBackgroundGradient = (code) => {
  // Clear
  if (code === 0) return "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)";
  // Partly Cloudy
  if (code >= 1 && code <= 3) return "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)";
  // Foggy
  if (code >= 45 && code <= 48) return "linear-gradient(135deg, #8e9eab 0%, #eef2f3 100%)";
  // Drizzle / Rain
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "linear-gradient(135deg, #2b5876 0%, #4e4376 100%)";
  // Snow
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return "linear-gradient(135deg, #e6e9f0 0%, #eef1f5 100%)";
  // Thunderstorm
  if (code >= 95 && code <= 99) return "linear-gradient(135deg, #141e30 0%, #243b55 100%)";

  // Default dark nice gradient
  return "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)";
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
  const [easterEggType, setEasterEggType] = useState(null);

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

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setIsLocating(true);
    setLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const detectedCity = await getCityFromCoords(latitude, longitude);
          const weatherData = await getWeather(latitude, longitude);

          setCity(detectedCity);
          setWeather({
            name: detectedCity,
            current: weatherData.current,
            daily: weatherData.daily,
            hourly: weatherData.hourly,
          });
        } catch {
          setError("Unable to fetch weather for your location.");
        } finally {
          setLoading(false);
          setIsLocating(false);
        }
      },
      () => {
        setError("Location permission denied or unavailable.");
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
      normalizedSearch.includes("pakistan") ||
      normalizedSearch.includes("lahore") ||
      normalizedSearch.includes("karachi") ||
      normalizedSearch.includes("islamabad")
    ) {
      setEasterEggType("pakistan");
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
        setError("City not found. Please try again.");
        setLoading(false);
        return;
      }

      const { latitude, longitude, name } = geoData.results[0];
      const weatherData = await getWeather(latitude, longitude);

      setWeather({
        name,
        current: weatherData.current,
        daily: weatherData.daily,
        hourly: weatherData.hourly,
      });
    } catch {
      setError("Failed to fetch weather data.");
    } finally {
      setLoading(false);
    }
  };

  const bgGradient = weather?.current
    ? getBackgroundGradient(weather.current.weather_code)
    : "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)";

  if (easterEggType) {
    let videoSrc = "";
    let isMuted = false;

    if (easterEggType === "onepiece") {
      videoSrc = "/onepiece.mp4";
    } else if (easterEggType === "aot") {
      videoSrc = "/aot.mp4";
    } else if (easterEggType === "naruto") {
      videoSrc = "/naruto.mp4";
    } else if (easterEggType === "sololeveling") {
      videoSrc = "/sololeveling.mp4";
    } else if (easterEggType === "deathnote") {
      videoSrc = "/deathnote.mp4";
    } else if (easterEggType === "jjk") {
      videoSrc = "/jjk.mp4";
    } else if (easterEggType === "sukuna") {
      videoSrc = "/sukuna.mp4";
    } else if (easterEggType === "chainsawman") {
      videoSrc = "/chainsawman.mp4";
    } else if (easterEggType === "gojo") {
      videoSrc = "/gojo.mp4";
    } else if (easterEggType === "bluelock") {
      videoSrc = "/bluelock.mp4";
    } else if (easterEggType === "vinlandsaga") {
      videoSrc = "/vinlandsaga.mp4";
    } else if (easterEggType === "bleach") {
      videoSrc = "/bleach.mp4";
    } else if (easterEggType === "demonslayer") {
      videoSrc = "/demonslayer.mp4";
    } else if (easterEggType === "fmab") {
      videoSrc = "/fmab.mp4";
    } else if (easterEggType === "opm") {
      videoSrc = "/opm.mp4";
    } else if (easterEggType === "dandadan") {
      videoSrc = "/dandadan.mp4";
    } else if (easterEggType === "dbz") {
      videoSrc = "/dbz.mp4";
    } else if (easterEggType === "haikyuu") {
      videoSrc = "/haikyuu.mp4";
    } else if (easterEggType === "gintama") {
      videoSrc = "/gintama.mp4";
    } else if (easterEggType === "highschooldxd") {
      videoSrc = "/highschooldxd.mp4";
    } else if (easterEggType === "pakistan") {
      videoSrc = "/pakistan.mp4";
    } else if (easterEggType === "hxh") {
      videoSrc = "/hxh.mp4";
    } else if (easterEggType === "mha") {
      videoSrc = "/mha.mp4";
    } else if (easterEggType === "jojo") {
      videoSrc = "/jojo.mp4";
    } else if (easterEggType === "kaiju") {
      videoSrc = "/kaiju.mp4";
    } else if (easterEggType === "gachiakuta") {
      videoSrc = "/gachiakuta.mp4";
    } else if (easterEggType === "mushoku") {
      videoSrc = "/mushoku.mp4";
    } else if (easterEggType === "rezero") {
      videoSrc = "/rezero.mp4";
    } else if (easterEggType === "blackclover") {
      videoSrc = "/blackclover.mp4";
    } else if (easterEggType === "drstone") {
      videoSrc = "/drstone.mp4";
    } else if (easterEggType === "fireforce") {
      videoSrc = "/fireforce.mp4";
    } else if (easterEggType === "windbreaker") {
      videoSrc = "/windbreaker.mp4";
    } else if (easterEggType === "spyxfamily") {
      videoSrc = "/spyxfamily.mp4";
    } else if (easterEggType === "slime") {
      videoSrc = "/slime.mp4";
    } else if (easterEggType === "suzume") {
      videoSrc = "/suzume.mp4";
    } else if (easterEggType === "yourname") {
      videoSrc = "/yourname.mp4";
    } else if (easterEggType === "silentvoice") {
      videoSrc = "/silentvoice.mp4";
    } else if (easterEggType === "cote") {
      videoSrc = "/cote.mp4";
    } else if (easterEggType === "dressupdarling") {
      videoSrc = "/dressupdarling.mp4";
    } else if (easterEggType === "codegeass") {
      videoSrc = "/codegeass.mp4";
    } else if (easterEggType === "frieren") {
      videoSrc = "/frieren.mp4";
    } else if (easterEggType === "monster") {
      videoSrc = "/monster.mp4";
    } else if (easterEggType === "apothecary") {
      videoSrc = "/apothecary.mp4";
    } else if (easterEggType === "pancreas") {
      videoSrc = "/pancreas.mp4";
    } else if (easterEggType === "yourlie") {
      videoSrc = "/yourlie.mp4";
    } else if (easterEggType === "baki") {
      videoSrc = "/baki.mp4";
    } else if (easterEggType === "berserk") {
      videoSrc = "/berserk.mp4";
    } else if (easterEggType === "fairytail") {
      videoSrc = "/fairytail.mp4";
    } else if (easterEggType === "boruto") {
      videoSrc = "/boruto.mp4";
    } else if (easterEggType === "sentencedhero") {
      videoSrc = "/sentencedhero.mp4";
    } else if (easterEggType === "kaguyasama") {
      videoSrc = "/kaguyasama.mp4";
    } else if (easterEggType === "graveoffireflies") {
      videoSrc = "/graveoffireflies.mp4";
    } else if (easterEggType === "madara") {
      videoSrc = "/madara.mp4";
    } else if (easterEggType === "shanks") {
      videoSrc = "/shanks.mp4";
    } else if (easterEggType === "toji") {
      videoSrc = "/toji.mp4";
    } else if (easterEggType === "tokyoghoul") {
      videoSrc = "/tokyoghoul.mp4";
    } else if (easterEggType === "sevendeadlysins") {
      videoSrc = "/sevendeadlysins.mp4";
    } else if (easterEggType === "assassinationclassroom") {
      videoSrc = "/assassinationclassroom.mp4";
    }

    return (
      <div className="easter-egg-container">
        <button
          className="close-easter-egg glass"
          onClick={() => {
            setEasterEggType(null);
            setCity(""); // Reset to default
          }}
        >
          Exit Peak
        </button>
        <video
          src={videoSrc}
          autoPlay loop muted={isMuted} playsInline
          className="easter-egg-iframe"
        />
      </div>
    );
  }

  return (
    <div className="app-container">
      <div
        className={`bg-wrapper ${!weather ? 'home-bg' : ''}`}
        style={weather ? { background: bgGradient } : {}}
      />

      {weather?.current && (
        <WeatherEffectsCanvas weatherCode={weather.current.weather_code} />
      )}

      <div className="content-wrapper">
        <motion.div
          className="title-container"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
        >
          <h1>
            <Mountain className="title-icon" size={40} />
            Peak Weather
          </h1>
          <button
            type="button"
            className="unit-toggle-pill glass"
            onClick={toggleUnit}
            title="Toggle °C / °F"
            aria-label="Toggle Celsius and Fahrenheit"
          >
            <span className={unit === "C" ? "active-unit" : ""}>°C</span>
            <span className="unit-divider">|</span>
            <span className={unit === "F" ? "active-unit" : ""}>°F</span>
          </button>
        </motion.div>

        <SearchBar
          city={city}
          setCity={setCity}
          onSearch={handleSearch}
          onLocateMe={handleLocateMe}
          isLocating={isLocating}
        />

        <AnimatePresence mode="wait">
          {loading && <SkeletonCard key="loading" />}

          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ color: "#fca5a5", fontSize: "1.2rem", fontWeight: "500" }}
            >
              {error}
            </motion.div>
          )}

          {!loading && !error && weather && (
            <motion.div
              key="weather"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.5 }}
              style={{ width: "100%" }}
            >
              <WeatherCard
                weather={weather}
                unit={unit}
                convertTemp={convertTemp}
              />
            </motion.div>
          )}

          {!loading && !error && !weather && (
            <PopularCities
              onCityClick={(selectedCity) => {
                setCity(selectedCity);
                handleSearch(selectedCity);
              }}
            />
          )}
        </AnimatePresence>
      </div>

      {!weather && <FloatingElements />}

      <footer>
        <p>© 2026 Peak Weather — By Shivansh Pandey. All Rights Reserved.</p>
        <div className="socials">
          <a href="https://github.com/pandeyshivansh-tech" target="_blank" rel="noopener noreferrer"><i className="fab fa-github"></i></a>
          <a href="https://www.linkedin.com/in/shivansh-pandey-87bab5373" target="_blank" rel="noopener noreferrer"><i className="fab fa-linkedin"></i></a>
          <a href="https://x.com/itshivanshere" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-x-twitter"></i></a>
          <a href="https://www.instagram.com/itshivanshere?igsh=b3FsZWh3ZnlydDd5" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram"></i></a>
        </div>
      </footer>
    </div>
  );
}

export default App;