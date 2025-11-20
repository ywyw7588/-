import { GoogleGenAI, Type } from "@google/genai";
import { Recommendation } from '../types';

const responseSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        artist: {
          type: Type.STRING,
          description: "The name of the artist.",
        },
        song: {
          type: Type.STRING,
          description: "The title of the song.",
        },
        reason: {
          type: Type.STRING,
          description: "A short reason for the recommendation.",
        },
      },
      required: ["artist", "song", "reason"],
    },
};

export const fetchRnbRecommendations = async (inputValue: string, language: 'ko' | 'en' = 'ko'): Promise<Recommendation[]> => {
    try {
        if (!process.env.API_KEY) {
            throw new Error("API_KEY environment variable not set");
        }
        
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const langInstruction = language === 'ko' ? "The reason must be written in Korean." : "The reason must be written in English.";
        const prompt = `Recommend 5 American R&B songs based on the following keyword(s): "${inputValue}". The keywords could describe a mood, weather, a situation, or a favorite artist. For each song, provide the artist, song title, and a short, compelling reason for the recommendation. ${langInstruction}`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.7,
            },
        });
        
        const jsonText = response.text.trim();
        const recommendations = JSON.parse(jsonText);
        
        if (!Array.isArray(recommendations)) {
            throw new Error("API did not return a valid array of recommendations.");
        }

        return recommendations;

    } catch (error) {
        console.error("Error fetching recommendations:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to get recommendations from Gemini API: ${error.message}`);
        }
        throw new Error("An unknown error occurred while fetching recommendations.");
    }
};

export const fetchSongOfTheDay = async (language: 'ko' | 'en' = 'ko'): Promise<Recommendation> => {
    try {
        if (!process.env.API_KEY) {
            throw new Error("API_KEY environment variable not set");
        }
        
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const langInstruction = language === 'ko' ? "The reason must be written in Korean." : "The reason must be written in English.";
        const prompt = `Recommend 1 American R&B song that's perfect for today. Provide the artist, song title, and a short, compelling reason for the recommendation. ${langInstruction}`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.8,
            },
        });
        
        const jsonText = response.text.trim();
        const recommendations = JSON.parse(jsonText);
        
        if (!Array.isArray(recommendations) || recommendations.length === 0) {
            throw new Error("API did not return a valid recommendation for Song of the Day.");
        }

        return recommendations[0];

    } catch (error) {
        console.error("Error fetching song of the day:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to get song of the day from Gemini API: ${error.message}`);
        }
        throw new Error("An unknown error occurred while fetching the song of the day.");
    }
};

export const fetchArtistPlaylist = async (artistName: string, language: 'ko' | 'en' = 'ko'): Promise<Recommendation[]> => {
    try {
        if (!process.env.API_KEY) {
            throw new Error("API_KEY environment variable not set");
        }
        
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const langInstruction = language === 'ko' ? "The reason must be written in Korean." : "The reason must be written in English.";
        const prompt = `Recommend 5 signature songs by the R&B artist "${artistName}". For each song, provide the artist name, the song title, and a short, compelling reason why it's a must-listen. ${langInstruction}`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.6,
            },
        });
        
        const jsonText = response.text.trim();
        const recommendations = JSON.parse(jsonText);
        
        if (!Array.isArray(recommendations)) {
            throw new Error(`API did not return a valid array for artist ${artistName}.`);
        }

        return recommendations;

    } catch (error) {
        console.error(`Error fetching playlist for ${artistName}:`, error);
        if (error instanceof Error) {
            throw new Error(`Failed to get playlist for ${artistName} from Gemini API: ${error.message}`);
        }
        throw new Error(`An unknown error occurred while fetching the playlist for ${artistName}.`);
    }
};