import { Car, PersonStanding, Bus, Bike, Users, Package, BadgeInfo, Baby, Search } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useLanguage } from "../contexts/LanguageContext";
import { useCountry } from "../contexts/CountryContext";
import { LanguageSelector } from "./LanguageSelector";
import { CountrySelector } from "./CountrySelector";
import { VoiceCommandButton } from "./VoiceCommandButton";
import { AdBanner } from "./AdBanner";
import { AnakaboLogoFull } from "./AnakaboLogo";

export type TransportMode =
  | "car"
  | "pedestrian"
  | "transit"
  | "scooter"
  | "carpool"
  | "motorcycle"
  | "taxi"
  | "delivery"
  | "bike"
  | "tourist"
  | "parent";

interface HomeScreenProps {
  onSelectMode: (mode: TransportMode) => void;
}

const transportModeList: { id: TransportMode; icon: any; emoji: string }[] = [
  { id: "car", icon: Car, emoji: "🚗" },
  { id: "pedestrian", icon: PersonStanding, emoji: "🚶" },
  { id: "transit", icon: Bus, emoji: "🚌" },
  { id: "bike", icon: Bike, emoji: "🚲" },
  { id: "scooter", icon: Bike, emoji: "🛴" },
  { id: "carpool", icon: Users, emoji: "🚘" },
  { id: "motorcycle", icon: Car, emoji: "🏍️" },
  { id: "taxi", icon: Car, emoji: "🚕" },
  { id: "delivery", icon: Package, emoji: "📦" },
  { id: "tourist", icon: BadgeInfo, emoji: "🗺️" },
  { id: "parent", icon: Baby, emoji: "👶" },
];

export function HomeScreen({ onSelectMode }: HomeScreenProps) {
  const { t, speak } = useLanguage();
  const { selectedCountry } = useCountry();

  const handleModeSelect = (mode: TransportMode) => {
    speak(t(mode));
    onSelectMode(mode);
  };

  const handleVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();
    if (lowerCommand.includes("voiture") || lowerCommand.includes("car") || lowerCommand.includes("machin")) {
      handleModeSelect("car");
    } else if (lowerCommand.includes("vélo") || lowerCommand.includes("bike") || lowerCommand.includes("bisiklèt")) {
      handleModeSelect("bike");
    } else if (lowerCommand.includes("bus") || lowerCommand.includes("métro") || lowerCommand.includes("transport")) {
      handleModeSelect("transit");
    } else if (lowerCommand.includes("marche") || lowerCommand.includes("pied") || lowerCommand.includes("walk") || lowerCommand.includes("mache")) {
      handleModeSelect("pedestrian");
    } else if (lowerCommand.includes("scooter") || lowerCommand.includes("trotinette") || lowerCommand.includes("skoutè")) {
      handleModeSelect("scooter");
    } else if (lowerCommand.includes("taxi") || lowerCommand.includes("taksi")) {
      handleModeSelect("taxi");
    } else if (lowerCommand.includes("moto")) {
      handleModeSelect("motorcycle");
    }
  };

  return (
    <div className="h-screen w-full bg-[#f7f8fa] flex flex-col overflow-auto">

      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-5 py-3 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <AnakaboLogoFull />
        <div className="flex items-center gap-2">
          <VoiceCommandButton onCommand={handleVoiceCommand} />
          <CountrySelector />
          <LanguageSelector />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center px-5 py-6 max-w-2xl mx-auto w-full">

        {/* Free badge */}
        <Badge className="mb-6 bg-green-50 text-green-700 border border-green-200 px-4 py-1.5 font-normal text-sm">
          ✅ {t("free")}
        </Badge>

        {/* Search prompt — Waze style */}
        <button
          onClick={() => handleModeSelect("car")}
          className="w-full flex items-center gap-3 bg-white rounded-2xl shadow-md px-5 py-4 mb-6 border border-gray-100 hover:shadow-lg transition-shadow text-left group"
        >
          <div className="bg-blue-600 rounded-xl p-2.5 group-hover:bg-blue-700 transition-colors">
            <Search className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-base font-semibold text-gray-900">{t("destination")}</p>
            <p className="text-sm text-gray-400">{t("subtitle")}</p>
          </div>
        </button>

        {/* Country banner */}
        {selectedCountry && (
          <div className="w-full flex items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 mb-4">
            <span className="text-3xl">{selectedCountry.flag}</span>
            <div>
              <p className="font-semibold text-gray-900">{selectedCountry.name}</p>
              <p className="text-sm text-gray-400">{selectedCountry.nativeName}</p>
            </div>
          </div>
        )}


        {/* Transport modes */}
        <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">{t("chooseMode")}</p>
          <div className="grid grid-cols-4 gap-2">
            {transportModeList.map((mode) => (
              <button
                key={mode.id}
                onClick={() => handleModeSelect(mode.id)}
                className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl hover:bg-blue-50 active:bg-blue-100 transition-colors group"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">{mode.emoji}</span>
                <span className="text-xs text-gray-600 text-center leading-tight font-medium">{t(mode.id)}</span>
              </button>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <button
              onClick={() => handleModeSelect("car")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <span>{t("multimodal")}</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>

      <AdBanner position="bottom" />
    </div>
  );
}
