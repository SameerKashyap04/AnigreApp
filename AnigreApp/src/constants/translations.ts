export type LanguageCode = 
  | 'en' | 'as' | 'bn' | 'brx' | 'doi' | 'gu' | 'hi' | 'kn' 
  | 'ks' | 'gom' | 'mai' | 'ml' | 'mni' | 'mr' | 'ne' | 'or' 
  | 'pa' | 'sa' | 'sat' | 'sd' | 'ta' | 'te' | 'ur';

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi (हिन्दी)' },
  { code: 'as', name: 'Assamese (অসমীয়া)' },
  { code: 'bn', name: 'Bengali (বাংলা)' },
  { code: 'brx', name: 'Bodo (बड़ो)' },
  { code: 'doi', name: 'Dogri (डोगरी)' },
  { code: 'gu', name: 'Gujarati (ગુજરાતી)' },
  { code: 'kn', name: 'Kannada (ಕನ್ನಡ)' },
  { code: 'ks', name: 'Kashmiri (कॉशुर)' },
  { code: 'gom', name: 'Konkani (कोंकणी)' },
  { code: 'mai', name: 'Maithili (मैथिली)' },
  { code: 'ml', name: 'Malayalam (മലയാളം)' },
  { code: 'mni', name: 'Manipuri (মৈতৈলোন্)' },
  { code: 'mr', name: 'Marathi (मराठी)' },
  { code: 'ne', name: 'Nepali (नेपाली)' },
  { code: 'or', name: 'Odia (ଓଡ଼ିଆ)' },
  { code: 'pa', name: 'Punjabi (ਪੰਜਾਬੀ)' },
  { code: 'sa', name: 'Sanskrit (संस्कृतम्)' },
  { code: 'sat', name: 'Santali (ᱥᱟᱱᱛᱟᱲᱤ)' },
  { code: 'sd', name: 'Sindhi (سنڌي)' },
  { code: 'ta', name: 'Tamil (தமிழ்)' },
  { code: 'te', name: 'Telugu (తెలుగు)' },
  { code: 'ur', name: 'Urdu (اردو)' }
];

export const TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  en: {
    greeting: 'Good Morning 🌤️', hello: 'Hello', farmer: 'Farmer', tapToScan: 'Tap to Scan Your Crop', totalScans: 'Total Scans', highRiskToday: 'High Risk Today', recentScans: 'Recent Scans', seeAll: 'See All', myProfile: 'My Profile', myCrops: 'My Crops', analytics: 'Analytics & Reports', notifications: 'Notifications', language: 'Language', settings: 'Settings', signOut: 'Sign Out', highRisk: 'High Risk', diseases: 'Diseases', accuracy: 'Accuracy', scanCrop: 'Scan Crop', captureAnalyze: 'Capture & Analyze', noScans: 'No scans yet.', todayScans: "Today's Scans", scanResults: 'Scan Results', confidence: 'Confidence', severityLabel: 'SEVERITY', actionRequired: 'Action Required', treatmentsLabel: 'TREATMENT RECOMMENDATIONS', saveReport: 'Save Report', aiAnalyzed: 'AI Analyzed', 'High': 'High', 'Medium': 'Medium', 'Low': 'Low', 'Healthy': 'Healthy'
  },
  hi: {
    greeting: 'शुभ प्रभात 🌤️', hello: 'नमस्ते', farmer: 'किसान', tapToScan: 'फसल स्कैन करने के लिए टैप करें', totalScans: 'कुल स्कैन', highRiskToday: 'आज उच्च जोखिम', recentScans: 'हाल के स्कैन', seeAll: 'सभी देखें', myProfile: 'मेरी प्रोफ़ाइल', myCrops: 'मेरी फसलें', analytics: 'विश्लेषिकी और रिपोर्ट', notifications: 'सूचनाएं', language: 'भाषा', settings: 'सेटिंग्स', signOut: 'लॉग आउट', highRisk: 'उच्च जोखिम', diseases: 'रोग', accuracy: 'सटीकता', scanCrop: 'फसल स्कैन करें', captureAnalyze: 'कैप्चर और विश्लेषण', noScans: 'अभी तक कोई स्कैन नहीं।', todayScans: 'आज के स्कैन', scanResults: 'स्कैन परिणाम', confidence: 'सटीकता', severityLabel: 'गंभीरता', actionRequired: 'कार्रवाई आवश्यक', treatmentsLabel: 'उपचार की सिफारिशें', saveReport: 'रिपोर्ट सहेजें', aiAnalyzed: 'AI विश्लेषित', 'High': 'उच्च', 'Medium': 'मध्यम', 'Low': 'कम', 'Healthy': 'स्वस्थ'
  },
  bn: {
    greeting: 'সুপ্রভাত 🌤️', hello: 'নমস্কার', farmer: 'কৃষক', tapToScan: 'ফসল স্ক্যান করতে ট্যাপ করুন', totalScans: 'মোট স্ক্যান', highRiskToday: 'আজকের উচ্চ ঝুঁকি', recentScans: 'সাম্প্রতিক স্ক্যান', seeAll: 'সব দেখুন', myProfile: 'আমার প্রোফাইল', myCrops: 'আমার ফসল', analytics: 'বিশ্লেষণ ও রিপোর্ট', notifications: 'বিজ্ঞপ্তি', language: 'ভাষা', settings: 'সেটিংস', signOut: 'সাইন আউট', highRisk: 'উচ্চ ঝুঁকি', diseases: 'রোগ', accuracy: 'সঠিকতা', scanCrop: 'ফসল স্ক্যান করুন', captureAnalyze: 'ক্যাপচার ও বিশ্লেষণ', noScans: 'এখনও কোনো স্ক্যান নেই।', todayScans: 'আজকের স্ক্যান'
  },
  te: {
    greeting: 'శుభోదయం 🌤️', hello: 'నమస్కారం', farmer: 'రైతు', tapToScan: 'పంటను స్కాన్ చేయడానికి నొక్కండి', totalScans: 'మొత్తం స్కాన్‌లు', highRiskToday: 'నేడు అధిక ప్రమాదం', recentScans: 'ఇటీవలి స్కాన్‌లు', seeAll: 'అన్నీ చూడండి', myProfile: 'నా ప్రొఫైల్', myCrops: 'నా పంటలు', analytics: 'విశ్లేషణలు & నివేదికలు', notifications: 'నోటిఫికేషన్‌లు', language: 'భాష', settings: 'సెట్టింగ్‌లు', signOut: 'సైన్ అవుట్', highRisk: 'అధిక ప్రమాదం', diseases: 'వ్యాధులు', accuracy: 'ఖచ్చితత్వం', scanCrop: 'పంటను స్కాన్ చేయండి', captureAnalyze: 'క్యాప్చర్ & విశ్లేషించండి', noScans: 'స్కాన్‌లు లేవు.', todayScans: 'నేటి స్కాన్‌లు'
  },
  mr: {
    greeting: 'शुभ प्रभात 🌤️', hello: 'नमस्कार', farmer: 'शेतकरी', tapToScan: 'पीक स्कॅन करण्यासाठी टॅप करा', totalScans: 'एकूण स्कॅन', highRiskToday: 'आजचा उच्च धोका', recentScans: 'अलीकडील स्कॅन', seeAll: 'सर्व पहा', myProfile: 'माझे प्रोफाइल', myCrops: 'माझी पिके', analytics: 'अहवाल', notifications: 'सूचना', language: 'भाषा', settings: 'सेटिंग्ज', signOut: 'बाहेर पडा', highRisk: 'उच्च धोका', diseases: 'रोग', accuracy: 'अचूकता', scanCrop: 'पीक स्कॅन करा', captureAnalyze: 'कॅप्चर आणि विश्लेषण करा', noScans: 'अद्याप कोणतेही स्कॅन नाही.', todayScans: 'आजचे स्कॅन'
  },
  ta: {
    greeting: 'காலை வணக்கம் 🌤️', hello: 'வணக்கம்', farmer: 'விவசாயி', tapToScan: 'பயிரை ஸ்கேன் செய்ய தட்டவும்', totalScans: 'மொத்த ஸ்கேன்கள்', highRiskToday: 'இன்று அதிக ஆபத்து', recentScans: 'சமீபத்திய ஸ்கேன்கள்', seeAll: 'அனைத்தையும் காண்க', myProfile: 'என் சுயவிவரம்', myCrops: 'என் பயிர்கள்', analytics: 'பகுப்பாய்வு மற்றும் அறிக்கைகள்', notifications: 'அறிவிப்புகள்', language: 'மொழி', settings: 'அமைப்புகள்', signOut: 'வெளியேறு', highRisk: 'அதிக ஆபத்து', diseases: 'நோய்கள்', accuracy: 'துல்லியம்', scanCrop: 'பயிரை ஸ்கேன் செய்', captureAnalyze: 'படம் பிடி & பகுப்பாய்வு', noScans: 'ஸ்கேன்கள் இல்லை.', todayScans: 'இன்றைய ஸ்கேன்கள்'
  },
  gu: {
    greeting: 'શુભ સવાર 🌤️', hello: 'નમસ્તે', farmer: 'ખેડૂત', tapToScan: 'પાક સ્કેન કરવા ટેપ કરો', totalScans: 'કુલ સ્કેન', highRiskToday: 'આજે ઉચ્ચ જોખમ', recentScans: 'તાજેતરના સ્કેન', seeAll: 'બધું જુઓ', myProfile: 'મારી પ્રોફાઇલ', myCrops: 'મારા પાક', analytics: 'વિશ્લેષણ અને રિપોર્ટ્સ', notifications: 'સૂચનાઓ', language: 'ભાષા', settings: 'સેટિંગ્સ', signOut: 'સાઇન આઉટ', highRisk: 'ઉચ્ચ જોખમ', diseases: 'રોગો', accuracy: 'ચોકસાઈ', scanCrop: 'પાક સ્કેન કરો', captureAnalyze: 'કેપ્ચર અને વિશ્લેષણ', noScans: 'હજુ સુધી કોઈ સ્કેન નથી.', todayScans: 'આજના સ્કેન'
  },
  kn: {
    greeting: 'ಶುಭೋದಯ 🌤️', hello: 'ನಮಸ್ಕಾರ', farmer: 'ರೈತ', tapToScan: 'ಬೆಳೆ ಸ್ಕ್ಯಾನ್ ಮಾಡಲು ಟ್ಯಾಪ್ ಮಾಡಿ', totalScans: 'ಒಟ್ಟು ಸ್ಕ್ಯಾನ್‌ಗಳು', highRiskToday: 'ಇಂದು ಹೆಚ್ಚಿನ ಅಪಾಯ', recentScans: 'ಇತ್ತೀಚಿನ ಸ್ಕ್ಯಾನ್‌ಗಳು', seeAll: 'ಎಲ್ಲವನ್ನೂ ನೋಡಿ', myProfile: 'ನನ್ನ ಪ್ರೊಫೈಲ್', myCrops: 'ನನ್ನ ಬೆಳೆಗಳು', analytics: 'ವಿಶ್ಲೇಷಣೆಗಳು', notifications: 'ಅಧಿಸೂಚನೆಗಳು', language: 'ಭಾಷೆ', settings: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು', signOut: 'ಸೈನ್ ಔಟ್', highRisk: 'ಹೆಚ್ಚಿನ ಅಪಾಯ', diseases: 'ರೋಗಗಳು', accuracy: 'ನಿಖರತೆ', scanCrop: 'ಬೆಳೆ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ', captureAnalyze: 'ಸೆರೆಹಿಡಿಯಿರಿ', noScans: 'ಯಾವುದೇ ಸ್ಕ್ಯಾನ್‌ಗಳಿಲ್ಲ.', todayScans: 'ಇಂದಿನ ಸ್ಕ್ಯಾನ್‌ಗಳು'
  },
  ml: {
    greeting: 'സുപ്രഭാതം 🌤️', hello: 'നമസ്കാരം', farmer: 'കർഷകൻ', tapToScan: 'വിള സ്കാൻ ചെയ്യാൻ ടാപ്പുചെയ്യുക', totalScans: 'മൊത്തം സ്കാനുകൾ', highRiskToday: 'ഇന്ന് ഉയർന്ന അപകടസാധ്യത', recentScans: 'സമീപകാല സ്കാനുകൾ', seeAll: 'എല്ലാം കാണുക', myProfile: 'എന്റെ പ്രൊഫൈൽ', myCrops: 'എന്റെ വിളകൾ', analytics: 'അനലിറ്റിക്സ് & റിപ്പോർട്ടുകൾ', notifications: 'അറിയിപ്പുകൾ', language: 'ഭാഷ', settings: 'ക്രമീകരണങ്ങൾ', signOut: 'സൈൻ ഔട്ട്', highRisk: 'ഉയർന്ന അപകടസാധ്യത', diseases: 'രോഗങ്ങൾ', accuracy: 'കൃത്യത', scanCrop: 'വിള സ്കാൻ ചെയ്യുക', captureAnalyze: 'ക്യാപ്ചർ ചെയ്യുക', noScans: 'സ്കാനുകളൊന്നുമില്ല.', todayScans: 'ഇന്നത്തെ സ്കാനുകൾ'
  },
  or: {
    greeting: 'ଶୁଭ ସକାଳ 🌤️', hello: 'ନମସ୍କାର', farmer: 'କୃଷକ', tapToScan: 'ଫସଲ ସ୍କାନ କରିବାକୁ ଟ୍ୟାପ୍ କରନ୍ତୁ', totalScans: 'ମୋଟ ସ୍କାନ୍', highRiskToday: 'ଆଜି ଉଚ୍ଚ ବିପଦ', recentScans: 'ସାମ୍ପ୍ରତିକ ସ୍କାନ୍', seeAll: 'ସବୁ ଦେଖନ୍ତୁ', myProfile: 'ମୋର ପ୍ରୋଫାଇଲ୍', myCrops: 'ମୋର ଫସଲ', analytics: 'ବିଶ୍ଳେଷଣ ଏବଂ ରିପୋର୍ଟଗୁଡିକ', notifications: 'ବିଜ୍ଞପ୍ତିଗୁଡ଼ିକ', language: 'ଭାଷା', settings: 'ସେଟିଂସମୂହ', signOut: 'ସାଇନ୍ ଆଉଟ୍', highRisk: 'ଉଚ୍ଚ ବିପଦ', diseases: 'ରୋଗଗୁଡିକ', accuracy: 'ସଠିକତା', scanCrop: 'ଫସଲ ସ୍କାନ୍ କରନ୍ତୁ', captureAnalyze: 'କ୍ୟାପଚର ଏବଂ ବିଶ୍ଳେଷଣ କରନ୍ତୁ', noScans: 'ଏପର୍ଯ୍ୟନ୍ତ କୌଣସି ସ୍କାନ୍ ନାହିଁ |', todayScans: 'ଆଜିର ସ୍କାନ୍'
  },
  pa: {
    greeting: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ 🌤️', hello: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ', farmer: 'ਕਿਸਾਨ', tapToScan: 'ਫਸਲ ਨੂੰ ਸਕੈਨ ਕਰਨ ਲਈ ਟੈਪ ਕਰੋ', totalScans: 'ਕੁੱਲ ਸਕੈਨ', highRiskToday: 'ਅੱਜ ਉੱਚ ਜੋਖਮ', recentScans: 'ਹਾਲੀਆ ਸਕੈਨ', seeAll: 'ਸਾਰੇ ਦੇਖੋ', myProfile: 'ਮੇਰੀ ਪ੍ਰੋਫਾਈਲ', myCrops: 'ਮੇਰੀਆਂ ਫਸਲਾਂ', analytics: 'ਵਿਸ਼ਲੇਸ਼ਣ ਅਤੇ ਰਿਪੋਰਟਾਂ', notifications: 'ਸੂਚਨਾਵਾਂ', language: 'ਭਾਸ਼ਾ', settings: 'ਸੈਟਿੰਗਾਂ', signOut: 'ਸਾਈਨ ਆਊਟ', highRisk: 'ਉੱਚ ਜੋਖਮ', diseases: 'ਬਿਮਾਰੀਆਂ', accuracy: 'ਸ਼ੁੱਧਤਾ', scanCrop: 'ਫਸਲ ਸਕੈਨ ਕਰੋ', captureAnalyze: 'ਕੈਪਚਰ ਅਤੇ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰੋ', noScans: 'ਹਾਲੇ ਕੋਈ ਸਕੈਨ ਨਹੀਂ।', todayScans: 'ਅੱਜ ਦੇ ਸਕੈਨ'
  },
  ur: {
    greeting: 'صبح بخیر 🌤️', hello: 'ہیلو', farmer: 'کسان', tapToScan: 'فصل اسکین کرنے کے لیے تھپتھپائیں', totalScans: 'کل اسکینز', highRiskToday: 'آج زیادہ خطرہ', recentScans: 'حالیہ اسکینز', seeAll: 'سب دیکھیں', myProfile: 'میری پروفائل', myCrops: 'میری فصلیں', analytics: 'تجزیات اور رپورٹس', notifications: 'اطلاعات', language: 'زبان', settings: 'ترتیبات', signOut: 'سائن آؤٹ', highRisk: 'زیادہ خطرہ', diseases: 'بیماریاں', accuracy: 'درستگی', scanCrop: 'فصل اسکین کریں', captureAnalyze: 'تصویر لیں اور تجزیہ کریں', noScans: 'ابھی تک کوئی اسکین نہیں۔', todayScans: 'آج کے اسکینز'
  },
  as: {
    greeting: 'সুপ্ৰভাত 🌤️', hello: 'নমস্কাৰ', farmer: 'কৃষক', tapToScan: 'শস্য স্কেন কৰিবলৈ টিপক', totalScans: 'মুঠ স্কেন', highRiskToday: 'আজিৰ উচ্চ বিপদ', recentScans: 'শেহতীয়া স্কেন', seeAll: 'সকলো চাওক', myProfile: 'মোৰ প্ৰফাইল', myCrops: 'মোৰ শস্য', analytics: 'বিশ্লেষণ আৰু প্ৰতিবেদন', notifications: 'জাননী', language: 'ভাষা', settings: 'ছেটিংছ', signOut: 'ছাইন আউট', highRisk: 'উচ্চ বিপদ', diseases: 'ৰোগ', accuracy: 'সঠিকতা', scanCrop: 'শস্য স্কেন কৰক', captureAnalyze: 'কেপচাৰ আৰু বিশ্লেষণ কৰক', noScans: 'এতিয়াও কোনো স্কেন নাই।', todayScans: 'আজিৰ স্কেন'
  },
  ne: {
    greeting: 'शुभ बिहानी 🌤️', hello: 'नमस्ते', farmer: 'किसान', tapToScan: 'बाली स्क्यान गर्न ट्याप गर्नुहोस्', totalScans: 'कुल स्क्यान', highRiskToday: 'आज उच्च जोखिम', recentScans: 'भर्खरका स्क्यानहरू', seeAll: 'सबै हेर्नुहोस्', myProfile: 'मेरो प्रोफाइल', myCrops: 'मेरो बाली', analytics: 'एनालिटिक्स र रिपोर्टहरू', notifications: 'सूचनाहरू', language: 'भाषा', settings: 'सेटिङहरू', signOut: 'साइन आउट', highRisk: 'उच्च जोखिम', diseases: 'रोगहरू', accuracy: 'शुद्धता', scanCrop: 'बाली स्क्यान गर्नुहोस्', captureAnalyze: 'क्याप्चर र विश्लेषण गर्नुहोस्', noScans: 'अहिलेसम्म कुनै स्क्यान छैन।', todayScans: 'आजको स्क्यान'
  },
  sa: {
    greeting: 'सुप्रभातम् 🌤️', hello: 'नमस्ते', farmer: 'कृषकः', tapToScan: 'सस्यं स्कैन् कर्तुं स्पृशन्तु', totalScans: 'कुलं स्कैन्', highRiskToday: 'अद्य उच्च जोखिमः', recentScans: 'नवीनतम स्कैन्', seeAll: 'सर्वं पश्यन्तु', myProfile: 'मम परिलेखः', myCrops: 'मम सस्यानि', analytics: 'विश्लेषणं च विवरणानि', notifications: 'सूचनाः', language: 'भाषा', settings: 'सेटिंग्स', signOut: 'बहिर्गच्छन्तु', highRisk: 'उच्च जोखिमः', diseases: 'रोगाः', accuracy: 'शुद्धता', scanCrop: 'सस्यं स्कैन् कुर्वन्तु', captureAnalyze: 'चित्रं गृह्णन्तु विश्लेषयन्तु च', noScans: 'अद्यावधि न कोऽपि स्कैन्।', todayScans: 'अद्यतनानि स्कैन्'
  },
  ks: {
    greeting: 'صبح بخیر 🌤️', hello: 'آداب', farmer: 'کسان', tapToScan: 'فصل اسکین کرنہٕ خٲطرٕ دباوِو', totalScans: 'کُل اسکین', highRiskToday: 'آزکِس بٔڈ خطرہ', recentScans: 'حالٕک اسکین', seeAll: 'سٲری وٕچھِو', myProfile: 'میون پروفائل', myCrops: 'میأنِ فصل', analytics: 'تجزیات تہٕ رپورٹس', notifications: 'اطلاعات', language: 'زبان', settings: 'ترتیبات', signOut: 'سائن آؤٹ', highRisk: 'بٔڈ خطرہ', diseases: 'بیمأرِ', accuracy: 'درستگی', scanCrop: 'فصل اسکین کٔرِو', captureAnalyze: 'تصویر ہِیو تہٕ تجزیہ کٔرِو', noScans: 'کانٛہہ اسکین چھُ نہٕ۔', todayScans: 'آزکِ اسکین'
  },
  sd: {
    greeting: 'صبح جو سلام 🌤️', hello: 'هيلو', farmer: 'هاري', tapToScan: 'فصل اسڪين ڪرڻ لاءِ ٽيپ ڪريو', totalScans: 'ڪل اسڪين', highRiskToday: 'اڄ وڏو خطرو', recentScans: 'تازيون اسڪين', seeAll: 'سڀ ڏسو', myProfile: 'منهنجي پروفائيل', myCrops: 'منهنجا فصل', analytics: 'تجزيات ۽ رپورٽون', notifications: 'اطلاع', language: 'ٻولي', settings: 'سيٽنگون', signOut: 'سائن آئوٽ', highRisk: 'وڏو خطرو', diseases: 'بيماريون', accuracy: 'درستگي', scanCrop: 'فصل اسڪين ڪريو', captureAnalyze: 'تصوير وٺو ۽ تجزيو ڪريو', noScans: 'اڃا تائين ڪا به اسڪين ناهي.', todayScans: 'اڄ جون اسڪينون'
  },
  gom: {
    greeting: 'बऱ्याक सकाळ 🌤️', hello: 'नमस्कार', farmer: 'शेतकार', tapToScan: 'पीक स्कॅन करपाक दाबा', totalScans: 'एकूण स्कॅन', highRiskToday: 'आयज चड धोको', recentScans: 'हालींचे स्कॅन', seeAll: 'सगळे पळयात', myProfile: 'म्हजी प्रोफायल', myCrops: 'म्हजी पिकां', analytics: 'अहवाल आनी विश्र्लेशण', notifications: 'सुचोवण्यो', language: 'भास', settings: 'सेटिंग्स', signOut: 'भायर सरा', highRisk: 'चड धोको', diseases: 'रोग', accuracy: 'अचूकताय', scanCrop: 'पीक स्कॅन करात', captureAnalyze: 'कॅप्चर आनी विश्र्लेशण करात', noScans: 'अजुन स्कॅन नात.', todayScans: 'आयजचे स्कॅन'
  },
  brx: {
    greeting: 'मोजां फुं 🌤️', hello: 'खुलुमबाय', farmer: 'आबादिया', tapToScan: 'आबाद स्क्यान खालामनो थाखाय थु', totalScans: 'गासै स्क्यान', highRiskToday: 'दिनै गोबां खैफोद', recentScans: 'गोदान स्क्यान', seeAll: 'गासैखौबो नाय', myProfile: 'आंनि प्रफाइल', myCrops: 'आंनि आबादफोर', analytics: 'एनालाइटिक्स आरो रिपोर्ट', notifications: 'नोथिफिकेसन', language: 'राव', settings: 'सेथिं', signOut: 'साइन आउट', highRisk: 'गोबां खैफोद', diseases: 'बेरामफोर', accuracy: 'गेबेंथि', scanCrop: 'आबाद स्क्यान खालाम', captureAnalyze: 'केपसार आरो एनालाइज खालाम', noScans: 'दासिमबो स्क्यान गैया।', todayScans: 'दिनैखौ स्क्यान'
  },
  doi: {
    greeting: 'शुभ प्रभात 🌤️', hello: 'नमस्ते', farmer: 'किसान', tapToScan: 'फसल स्कैन करने आस्तै टैप करो', totalScans: 'कुल स्कैन', highRiskToday: 'अज्ज मताबक खतरा', recentScans: 'ह्वालै दे स्कैन', seeAll: 'सब्भै दिक्खो', myProfile: 'मेरी प्रोफाइल', myCrops: 'मेरी फसलां', analytics: 'विश्लेषण ते रिपोर्ट', notifications: 'सूचनाएं', language: 'भाशा', settings: 'सेटिंग्स', signOut: 'लॉग आउट', highRisk: 'मताबक खतरा', diseases: 'बमारियां', accuracy: 'सटीकता', scanCrop: 'फसल स्कैन करो', captureAnalyze: 'कैप्चर ते विश्लेषण', noScans: 'अज्जै तकर कोई स्कैन नेईं।', todayScans: 'अज्ज दे स्कैन'
  },
  mai: {
    greeting: 'शुभ प्रभात 🌤️', hello: 'प्रणाम', farmer: 'किसान', tapToScan: 'फसल स्कैन करबाक लेल टैप करू', totalScans: 'कुल स्कैन', highRiskToday: 'आइ उच्च जोखिम', recentScans: 'हालक स्कैन', seeAll: 'सब देखू', myProfile: 'हमर प्रोफाइल', myCrops: 'हमर फसल', analytics: 'विश्लेषिकी आ रिपोर्ट', notifications: 'सूचना', language: 'भाषा', settings: 'सेटिंग्स', signOut: 'लॉग आउट', highRisk: 'उच्च जोखिम', diseases: 'रोग', accuracy: 'सटीकता', scanCrop: 'फसल स्कैन करू', captureAnalyze: 'कैप्चर आ विश्लेषण करू', noScans: 'एखन धरि कोनो स्कैन नहि।', todayScans: 'आइ के स्कैन'
  },
  mni: {
    greeting: 'অয়ুক্কী খুরুমজরি 🌤️', hello: 'খুরুমজরি', farmer: 'লৌমী', tapToScan: 'লৌউ-শিংউ স্কেন তৌনবা নম্বিয়ু', totalScans: 'অপুনবা স্কেন', highRiskToday: 'ঙসিগী অচৌবা খুদোংথিবা', recentScans: 'হন্দক্কী স্কেন', seeAll: 'পুম্নমক য়েংবীয়ু', myProfile: 'ঐগী প্রোফাইল', myCrops: 'ঐগী মহৈ-মরোংশিং', analytics: 'এনালিটিক্স অমসুং রিপোর্ট', notifications: 'নোটিফিকেশন', language: 'লোল', settings: 'সেটিং', signOut: 'সাইন আউট', highRisk: 'অচৌবা খুদোংথিবা', diseases: 'লায়নাশিং', accuracy: 'অচুম্বা', scanCrop: 'লৌউ-শিংউ স্কেন তৌবীয়ু', captureAnalyze: 'ক্যাপচার অমসুং এনালাইজ তৌবীয়ু', noScans: 'হৌজিকফাওবা স্কেন তৌদ্রি।', todayScans: 'ঙসিগী স্কেন'
  },
  sat: {
    greeting: 'ᱥᱟᱜᱩᱱ ᱥᱮᱛᱟᱜ 🌤️', hello: 'ᱡᱚᱦᱟᱨ', farmer: 'ᱪᱟᱹᱥᱤ', tapToScan: 'ᱪᱟᱥ ᱥᱠᱮᱱ ᱞᱟᱹᱜᱤᱫ ᱚᱛᱟᱭ ᱢᱮ', totalScans: 'ᱡᱚᱛᱚ ᱥᱠᱮᱱ', highRiskToday: 'ᱛᱮᱦᱮᱧ ᱰᱷᱮᱨ ᱵᱚᱛᱚᱨ', recentScans: 'ᱱᱟᱶᱟ ᱥᱠᱮᱱ', seeAll: 'ᱡᱚᱛᱚ ᱧᱮᱞ ᱢᱮ', myProfile: 'ᱤᱧᱟᱜ ᱯᱨᱚᱯᱷᱟᱭᱤᱞ', myCrops: 'ᱤᱧᱟᱜ ᱪᱟᱥ', analytics: 'ᱮᱱᱟᱞᱤᱴᱤᱠᱥ ᱟᱨ ᱨᱤᱯᱳᱨᱴ', notifications: 'ᱱᱚᱴᱤᱯᱷᱤᱠᱮᱥᱚᱱ', language: 'ᱯᱟᱹᱨᱥᱤ', settings: 'ᱥᱮᱴᱤᱝ', signOut: 'ᱥᱟᱭᱤᱱ ᱟᱣᱩᱴ', highRisk: 'ᱰᱷᱮᱨ ᱵᱚᱛᱚᱨ', diseases: 'ᱨᱩᱣᱟᱹ', accuracy: 'ᱴᱷᱤᱠ', scanCrop: 'ᱪᱟᱥ ᱥᱠᱮᱱ ᱢᱮ', captureAnalyze: 'ᱠᱮᱯᱪᱟᱨ ᱟᱨ ᱮᱱᱟᱞᱟᱭᱤᱡᱽ', noScans: 'ᱱᱤᱛ ᱫᱷᱟᱹᱨᱤᱡ ᱥᱠᱮᱱ ᱵᱟᱹᱱᱩᱜᱼᱟ᱾', todayScans: 'ᱛᱮᱦᱮᱧᱟᱜ ᱥᱠᱮᱱ'
  }
};
