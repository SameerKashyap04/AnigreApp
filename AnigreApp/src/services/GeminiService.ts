// Gemini API Key from Google AI Studio (aistudio.google.com)
const GEMINI_API_KEY = 'AIzaSyDjJsbek9FC1z1vQSPic6--nPJpLRBxKfk';

// gemini-2.5-flash — confirmed working on this key, fast + multimodal
const GEMINI_MODEL = 'gemini-2.5-flash';

const SYSTEM_PROMPT = `
You are Anigre.ai, an expert agricultural assistant designed to help farmers.
You are embedded inside a mobile app called Anigre.
Your main goals are to:
1. Provide accurate, easy-to-understand advice about crop diseases, treatments, and farming techniques.
2. Keep your answers concise, practical, and directly actionable for a farmer.
3. Use simple language.
4. If a user asks about non-agricultural topics, politely steer the conversation back to farming and crops.
`;

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  imageUri?: string;
  imageBase64?: string;
}

export const generateGeminiResponse = async (
  history: ChatMessage[],
  newMessage: string,
  imageBase64?: string
): Promise<string> => {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
    return 'Error: Gemini API Key not configured.';
  }

  // Build conversation history (skip the static welcome message)
  const contents = history
    .filter(msg => msg.id !== 'welcome')
    .map(msg => {
      const parts: any[] = [{ text: msg.text || ' ' }];
      if (msg.imageBase64) {
        parts.push({ inline_data: { mime_type: 'image/jpeg', data: msg.imageBase64 } });
      }
      return { role: msg.role, parts };
    });

  // Add the new user message
  const newParts: any[] = [{ text: newMessage || ' ' }];
  if (imageBase64) {
    newParts.push({ inline_data: { mime_type: 'image/jpeg', data: imageBase64 } });
  }
  contents.push({ role: 'user', parts: newParts });

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errMsg = data?.error?.message || `HTTP ${response.status}`;
      console.error('[Gemini] API Error:', errMsg);
      throw new Error(errMsg);
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) return text;

    throw new Error('No response text from Gemini');

  } catch (error: any) {
    console.error('[Gemini] Service Error:', error?.message || error);
    return "I'm sorry, I'm having trouble connecting right now. Please check your internet and try again.";
  }
};
