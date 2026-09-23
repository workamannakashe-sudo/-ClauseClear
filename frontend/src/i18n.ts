/** Language context and i18n strings for ClauseClear */

export type Language = 'en' | 'hi' | 'mr';

export interface I18nStrings {
  greeting: string;
  subGreeting: string;
  uploadTab: string;
  clauseTab: string;
  compareTab: string;
  qaTab: string;
  checklistTab: string;
  analyzeBtn: string;
  analyzingBtn: string;
  trySample: string;
  deleteData: string;
  notLegalAdvice: string;
  groundingScore: string;
  demoMode: string;
  liveMode: string;
  riskScore: string;
  askBtn: string;
  stepUpload: string;
  stepUnderstand: string;
  stepAct: string;
}

export const strings: Record<Language, I18nStrings> = {
  en: {
    greeting: 'Hi Riya, how can I help today?',
    subGreeting: 'I help you understand your rental agreement — in plain language, not legal jargon.',
    uploadTab: '1. Upload',
    clauseTab: '2. Understand',
    compareTab: '3. Compare',
    qaTab: '4. Ask',
    checklistTab: '5. Act',
    analyzeBtn: 'Analyse Lease',
    analyzingBtn: 'Analysing…',
    trySample: 'Try with a sample agreement',
    deleteData: 'Delete my data',
    notLegalAdvice: 'Information only — not legal advice. Consult a lawyer for your specific situation.',
    groundingScore: 'Grounding Score',
    demoMode: 'Demo Mode',
    liveMode: 'Live AI',
    riskScore: 'Tenant Risk Score',
    askBtn: 'Ask',
    stepUpload: 'Upload',
    stepUnderstand: 'Understand',
    stepAct: 'Act',
  },
  hi: {
    greeting: 'नमस्ते रिया, आज मैं कैसे मदद कर सकती हूँ?',
    subGreeting: 'मैं आपके किराया अनुबंध को सरल भाषा में समझाने में मदद करती हूँ।',
    uploadTab: '1. अपलोड',
    clauseTab: '2. समझें',
    compareTab: '3. तुलना करें',
    qaTab: '4. पूछें',
    checklistTab: '5. कार्य करें',
    analyzeBtn: 'विश्लेषण करें',
    analyzingBtn: 'विश्लेषण हो रहा है…',
    trySample: 'नमूना अनुबंध देखें',
    deleteData: 'मेरा डेटा हटाएं',
    notLegalAdvice: 'यह केवल जानकारी है — कानूनी सलाह नहीं। अपनी स्थिति के लिए वकील से मिलें।',
    groundingScore: 'आधार स्कोर',
    demoMode: 'डेमो मोड',
    liveMode: 'लाइव AI',
    riskScore: 'किरायेदार जोखिम स्कोर',
    askBtn: 'पूछें',
    stepUpload: 'अपलोड',
    stepUnderstand: 'समझें',
    stepAct: 'कार्य करें',
  },
  mr: {
    greeting: 'नमस्कार रिया, आज मी कशी मदत करू?',
    subGreeting: 'मी तुमचा भाडेकरार सोप्या भाषेत समजावून सांगतो.',
    uploadTab: '1. अपलोड',
    clauseTab: '2. समजून घ्या',
    compareTab: '3. तुलना करा',
    qaTab: '4. विचारा',
    checklistTab: '5. कृती करा',
    analyzeBtn: 'विश्लेषण करा',
    analyzingBtn: 'विश्लेषण होत आहे…',
    trySample: 'नमुना करार पाहा',
    deleteData: 'माझा डेटा हटवा',
    notLegalAdvice: 'हे केवळ माहिती आहे — कायदेशीर सल्ला नाही. तुमच्या परिस्थितीसाठी वकिलाशी संपर्क करा.',
    groundingScore: 'आधार गुण',
    demoMode: 'डेमो मोड',
    liveMode: 'लाइव्ह AI',
    riskScore: 'भाडेकरू जोखीम गुण',
    askBtn: 'विचारा',
    stepUpload: 'अपलोड',
    stepUnderstand: 'समजून घ्या',
    stepAct: 'कृती करा',
  },
};
