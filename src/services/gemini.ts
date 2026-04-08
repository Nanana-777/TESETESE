import { GoogleGenAI, Type } from "@google/genai";
import { Restaurant } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function fetchRestaurantDetails(restaurant: Restaurant): Promise<Partial<Restaurant>> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `請搜尋位於東京銀座的食店「${restaurant.name}」的最新 Google Maps 資料。
      
      請提供以下資訊：
      1. Google 評分 (數字)
      2. 評論摘要 (簡短描述)
      3. 是否需要排很久 (描述排隊情況)
      4. 是否需要預約 (是/否/建議)
      5. 是否 walk-in friendly (是/否/普通)
      6. 招牌菜 (列出 1-2 個)
      
      請以繁體中文回答。`,
      tools: [{ googleMaps: {} }] as any,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            googleRating: { type: Type.NUMBER },
            reviewsSummary: { type: Type.STRING },
            waitTime: { type: Type.STRING },
            reservationRequired: { type: Type.STRING },
            walkInFriendly: { type: Type.STRING },
            signatureDishes: { type: Type.STRING },
          },
          required: ["googleRating", "reviewsSummary", "waitTime", "reservationRequired", "walkInFriendly", "signatureDishes"],
        },
      },
    } as any);

    const data = JSON.parse(response.text);
    return data;
  } catch (error) {
    console.error(`Error fetching data for ${restaurant.name}:`, error);
    return {
      status: 'error'
    };
  }
}
