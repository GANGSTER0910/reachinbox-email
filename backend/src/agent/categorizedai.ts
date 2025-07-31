import dotenv from 'dotenv';
import { ChatGroq } from '@langchain/groq';
import { PromptTemplate } from "@langchain/core/prompts";

dotenv.config();
const apiKeys = [
  process.env.GROQ_API_KEY_1,
  process.env.GROQ_API_KEY_2,
  process.env.GROQ_API_KEY_3,
  process.env.GROQ_API_KEY_4,
  process.env.GROQ_API_KEY_5,
  process.env.GROQ_API_KEY_6,
  process.env.GROQ_API_KEY_7,
  process.env.GROQ_API_KEY_8,
  process.env.GROQ_API_KEY_9,
  process.env.GROQ_API_KEY_10,
  
  
].filter((key): key is string => !!key); 
if (apiKeys.length === 0) {
  console.error("❌ No Groq API keys found. Please set GROQ_API_KEY_1 in your .env file.");
}

let currentKeyIndex = 0;

function getNextApiKey() {
  if (apiKeys.length === 0) {
    throw new Error("No Groq API keys configured.");
  }
  const key = apiKeys[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length; 
  return key;
}

const prompt = PromptTemplate.fromTemplate(`
Given the following email content, categorize it into one of these exact labels:
Interested, Meeting Booked, Not Interested, Spam, Out of Office.

Your response must be ONLY ONE of these labels and nothing else.

Email Content:
---
{emailContent}
---
Category:
`);

export async function category(emailContent: string): Promise<string> {
  const allowedCategories = ['Interested', 'Meeting Booked', 'Not Interested', 'Spam', 'Out of Office'];

  try {
    if (!emailContent) {
      return 'Uncategorized';
    }

    const apiKey = getNextApiKey();
    const groq = new ChatGroq({
       model: "llama-3.3-70b-versatile",
      temperature: 0,
      apiKey: apiKey, 
    });

    const formattedPrompt = await prompt.format({ emailContent });
    const result = await groq.invoke(formattedPrompt);
    const predictedCategory = (result.content as string).trim();

    console.log(`AI Raw Prediction: "${predictedCategory}"`);

    if (allowedCategories.includes(predictedCategory)) {
      return predictedCategory.toLowerCase().replace(/ /g, '-');
    } else {
      console.warn(`AI returned an unexpected category: "${predictedCategory}". Defaulting to 'Uncategorized'.`);
      return 'uncategorized';
    }
  } catch (error) {
    console.error('Error during AI categorization:', error);
    return 'uncategorized';
  }
}
