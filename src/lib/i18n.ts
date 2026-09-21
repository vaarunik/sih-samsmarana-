// SAMSMARANA — language + voice architecture
//
// Languages (region and language are INDEPENDENT):
//   English, Kannada, Hindi, Tamil, Telugu  (existing)
//   Assamese, Bengali, Manipuri/Meitei, Khasi, Mizo  (NER — required)
//
// Each language has:
//   - code        : ISO-ish identifier
//   - name        : English display name
//   - native      : native-script display name
//   - speechLocale: BCP-47 locale for Web Speech API (TTS/STT). Some NER
//                   languages have no stable browser voice; we still list
//                   the locale and gracefully fall back to English when the
//                   platform has no voice.

export type LanguageCode =
  | "en"
  | "kn"
  | "hi"
  | "ta"
  | "te"
  | "as" // Assamese
  | "bn" // Bengali
  | "mni" // Manipuri / Meitei
  | "kh" // Khasi
  | "lus"; // Mizo

export interface LanguageDef {
  code: LanguageCode;
  name: string;
  native: string;
  speechLocale: string;
  /** true if most browsers ship a voice for this locale */
  voiceLikely: boolean;
  /** group used for badges / ordering */
  group: "common" | "ner";
}

export const LANGUAGES: LanguageDef[] = [
  { code: "en", name: "English", native: "English", speechLocale: "en-IN", voiceLikely: true, group: "common" },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ", speechLocale: "kn-IN", voiceLikely: true, group: "common" },
  { code: "hi", name: "Hindi", native: "हिन्दी", speechLocale: "hi-IN", voiceLikely: true, group: "common" },
  { code: "ta", name: "Tamil", native: "தமிழ்", speechLocale: "ta-IN", voiceLikely: true, group: "common" },
  { code: "te", name: "Telugu", native: "తెలుగు", speechLocale: "te-IN", voiceLikely: true, group: "common" },
  { code: "as", name: "Assamese", native: "অসমীয়া", speechLocale: "as-IN", voiceLikely: false, group: "ner" },
  { code: "bn", name: "Bengali", native: "বাংলা", speechLocale: "bn-IN", voiceLikely: true, group: "ner" },
  { code: "mni", name: "Manipuri / Meitei", native: "মৈতৈ লোন্", speechLocale: "mni-IN", voiceLikely: false, group: "ner" },
  { code: "kh", name: "Khasi", native: "Khasi", speechLocale: "kha-IN", voiceLikely: false, group: "ner" },
  { code: "lus", name: "Mizo", native: "Mizo ṭawng", speechLocale: "lus-IN", voiceLikely: false, group: "ner" },
];

export function languageDef(code: LanguageCode): LanguageDef {
  return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];
}

export function speechLocaleFor(code: LanguageCode): string {
  return languageDef(code).speechLocale;
}

type Dict = Record<string, string>;

const en: Dict = {
  "app.tagline": "Memory & Cognitive Engagement",
  "nav.home": "Home",
  "nav.activities": "Activities",
  "nav.reminders": "Reminders",
  "nav.progress": "Progress",
  "nav.profile": "Profile",
  "nav.family": "Family",
  "nav.caregiver": "Caregiver",
  "nav.overview": "Overview",
  "nav.history": "Activity History",
  "nav.performance": "Performance",
  "nav.recommendations": "Recommendations",
  "nav.settings": "Settings",
  "action.back": "Back",
  "action.continue": "Continue",
  "action.getStarted": "Get Started",
  "action.explore": "Explore Samsmarana",
  "action.startActivity": "Start Activity",
  "action.submit": "Submit",
  "action.next": "Next",
  "action.finish": "Finish",
  "action.retry": "Try Again",
  "action.standardActivity": "Continue with Standard Activity",
  "elder.welcome": "Welcome",
  "elder.whatNow": "What can I do now?",
  "voice.listen": "Listen",
  "voice.speak": "Speak your answer",
  "voice.listening": "Listening…",
  "voice.heard": "I heard",
  "voice.tryAgain": "Try Again",
  "voice.speed": "Voice speed",
  "voice.slow": "Slow",
  "voice.normal": "Normal",
  "video.preparing": "Preparing…",
  "video.generating": "Generating…",
  "video.almostReady": "Almost ready…",
  "video.unavailable":
    "Video generation is temporarily unavailable. You can continue with a standard activity.",
  "video.comingSoon": "Coming Soon",
  "video.watchPrompt": "Watch the short scene, then answer the questions.",
  "offline.offline": "Offline",
  "offline.syncing": "Syncing…",
  "offline.synced": "Synced",
  "offline.pending": "Sync pending. We'll retry when you're connected.",
};

const kn: Dict = {
  "app.tagline": "ಸ್ಮರಣೆ ಮತ್ತು ಜ್ಞಾನಾತ್ಮಕ ತೊಡಗಿಸುವಿಕೆ",
  "nav.home": "ಮುಖಪುಟ",
  "nav.activities": "ಚಟುವಟಿಕೆಗಳು",
  "nav.reminders": "ಜ್ಞಾಪನೆಗಳು",
  "nav.progress": "ಪ್ರಗತಿ",
  "nav.profile": "ಪ್ರೊಫೈಲ್",
  "nav.family": "ಕುಟುಂಬ",
  "nav.caregiver": "ಆರೈಕೆದಾರ",
  "action.getStarted": "ಪ್ರಾರಂಭಿಸಿ",
  "action.continue": "ಮುಂದುವರಿಸಿ",
  "action.back": "ಹಿಂದೆ",
  "elder.welcome": "ಸ್ವಾಗತ",
  "elder.whatNow": "ಈಗ ನಾನು ಏನು ಮಾಡಬಹುದು?",
  "voice.listen": "ಆಲಿಸಿ",
  "voice.speak": "ನಿಮ್ಮ ಉತ್ತರ ಹೇಳಿ",
  "voice.listening": "ಆಲಿಸುತ್ತಿದ್ದೇನೆ…",
  "voice.heard": "ನಾನು ಕೇಳಿದ್ದು",
  "offline.offline": "ಆಫ್‌ಲೈನ್",
  "offline.syncing": "ಸಿಂಕ್ ಆಗುತ್ತಿದೆ…",
  "offline.synced": "ಸಿಂಕ್ ಆಯಿತು",
};

const hi: Dict = {
  "app.tagline": "स्मृति और संज्ञानात्मक संलग्नता",
  "nav.home": "होम",
  "nav.activities": "गतिविधियाँ",
  "nav.reminders": "रिमाइंडर",
  "nav.progress": "प्रगति",
  "nav.profile": "प्रोफ़ाइल",
  "nav.family": "परिवार",
  "nav.caregiver": "देखभाल करने वाला",
  "action.getStarted": "शुरू करें",
  "action.continue": "जारी रखें",
  "action.back": "वापस",
  "elder.welcome": "स्वागत है",
  "elder.whatNow": "अभी मैं क्या कर सकता हूँ?",
  "voice.listen": "सुनें",
  "voice.speak": "अपना उत्तर बोलें",
  "voice.listening": "सुन रहा हूँ…",
  "voice.heard": "मैंने सुना",
  "offline.offline": "ऑफ़लाइन",
  "offline.syncing": "सिंक हो रहा है…",
  "offline.synced": "सिंक हो गया",
};

const ta: Dict = {
  "app.tagline": "நினைவு & அறிவாற்றல் ஈடுபாடு",
  "nav.home": "முகப்பு",
  "nav.activities": "செயல்பாடுகள்",
  "nav.reminders": "நினைவூட்டல்கள்",
  "nav.progress": "முன்னேற்றம்",
  "nav.profile": "சுயவிவரம்",
  "nav.family": "குடும்பம்",
  "nav.caregiver": "பராமரிப்பாளர்",
  "action.getStarted": "தொடங்குக",
  "action.continue": "தொடரவும்",
  "action.back": "பின்செல்",
  "elder.welcome": "வரவேற்கிறோம்",
  "elder.whatNow": "இப்போது நான் என்ன செய்யலாம்?",
  "voice.listen": "கேளுங்கள்",
  "voice.speak": "உங்கள் பதிலைச் சொல்லுங்கள்",
  "voice.listening": "கேட்கிறேன்…",
  "voice.heard": "நான் கேட்டது",
  "offline.offline": "ஆஃப்லைன்",
  "offline.synced": "ஒத்திசைக்கப்பட்டது",
};

const te: Dict = {
  "app.tagline": "జ్ఞాపక & జ్ఞానాత్మక నిమగ్నత",
  "nav.home": "హోమ్",
  "nav.activities": "కార్యకలాపాలు",
  "nav.reminders": "రిమైండర్‌లు",
  "nav.progress": "పురోగతి",
  "nav.profile": "ప్రొఫైల్",
  "nav.family": "కుటుంబం",
  "nav.caregiver": "సంరక్షకుడు",
  "action.getStarted": "ప్రారంభించండి",
  "action.continue": "కొనసాగించు",
  "action.back": "వెనుకకు",
  "elder.welcome": "స్వాగతం",
  "elder.whatNow": "ఇప్పుడు నేను ఏమి చేయగలను?",
  "voice.listen": "వినండి",
  "voice.speak": "మీ సమాధానం చెప్పండి",
  "voice.listening": "వింటున్నాను…",
  "voice.heard": "నేను విన్నది",
  "offline.offline": "ఆఫ్‌లైన్",
  "offline.synced": "సమకాలీకరించబడింది",
};

// NER languages — partial dictionaries with English fallback.
// (The architecture is complete; full translations can be added per locale.)
const as: Dict = {
  "app.tagline": "স্মৃতি আৰু জ্ঞানাত্মক সংলগ্নতা",
  "nav.home": "ঘৰ",
  "nav.activities": "কাৰ্য্য",
  "nav.reminders": "স্মাৰক",
  "action.getStarted": "আৰম্ভ কৰক",
  "action.back": "উভতি যাওক",
  "elder.welcome": "স্বাগতম",
  "voice.listen": "শুনক",
  "voice.speak": "আপোনাৰ উত্তৰ কওক",
  "voice.listening": "শুনি আছোঁ…",
  "offline.offline": "অফলাইন",
  "offline.synced": "ছিংক হ'ল",
};
const bn: Dict = {
  "app.tagline": "স্মৃতি ও জ্ঞানাত্মক সংযোজন",
  "nav.home": "হোম",
  "nav.activities": "কার্যকলাপ",
  "nav.reminders": "রিমাইন্ডার",
  "action.getStarted": "শুরু করুন",
  "action.back": "ফিরে যান",
  "elder.welcome": "স্বাগতম",
  "voice.listen": "শুনুন",
  "voice.speak": "আপনার উত্তর বলুন",
  "voice.listening": "শুনছি…",
  "offline.offline": "অফলাইন",
  "offline.synced": "সিঙ্ক হয়েছে",
};
const mni: Dict = {
  "app.tagline": "Memory & Cognitive Engagement",
  "nav.home": "Home",
  "action.getStarted": "Start",
  "action.back": "Back",
  "elder.welcome": "Welcome",
  "voice.listen": "Listen",
  "voice.speak": "Speak your answer",
  "voice.listening": "Listening…",
  "offline.offline": "Offline",
};
const kh: Dict = {
  "app.tagline": "Memory & Cognitive Engagement",
  "nav.home": "Home",
  "action.getStarted": "Start",
  "action.back": "Back",
  "elder.welcome": "Welcome",
  "voice.listen": "Listen",
  "voice.speak": "Speak your answer",
  "voice.listening": "Listening…",
  "offline.offline": "Offline",
};
const lus: Dict = {
  "app.tagline": "Memory & Cognitive Engagement",
  "nav.home": "Home",
  "action.getStarted": "Start",
  "action.back": "Back",
  "elder.welcome": "Welcome",
  "voice.listen": "Listen",
  "voice.speak": "Speak your answer",
  "voice.listening": "Listening…",
  "offline.offline": "Offline",
};

const DICTS: Record<LanguageCode, Dict> = { en, kn, hi, ta, te, as, bn, mni, kh, lus };

export function t(lang: LanguageCode, key: string): string {
  const d = DICTS[lang] ?? en;
  // Fall back to English, then to the key itself — NEVER undefined/null/raw.
  return d[key] ?? en[key] ?? key;
}

export function languageLabel(code: LanguageCode): string {
  return languageDef(code).name;
}
export function languageNative(code: LanguageCode): string {
  return languageDef(code).native;
}
