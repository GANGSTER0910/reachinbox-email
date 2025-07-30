import dotenv from 'dotenv';
import { ChatGroq } from '@langchain/groq';
import { PromptTemplate } from "@langchain/core/prompts";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

dotenv.config();

// const gemini = new ChatGoogleGenerativeAI({
//   model: "gemini-1.5-pro",
//   temperature: 0,
//   maxRetries: 2,
//   // other params...
// });
const groq = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0,
  apiKey: process.env.GROQ_API_KEY,
});

const prompt = PromptTemplate.fromTemplate(`
Given the following email content, categorize it into one of:
Interested, Meeting Booked, Not Interested, Spam, Out of Office.
and only return the category
Email:
{emailContent}
`);

export async function category(emailContent: string): Promise<string> {
  try {
    const formattedPrompt = await prompt.format({ emailContent });
    const result = await groq.invoke(formattedPrompt);
    const predictedCategory = typeof result.content === 'string'
      ? result.content.trim()
      : Array.isArray(result.content)
        ? result.content.map((c: any) => (typeof c === 'string' ? c : c.text || '')).join(' ').trim()
        : '';
    console.log(`AI Categorization Result: "${predictedCategory}"`);

    const allowedCategories = ['Interested', 'Meeting Booked', 'Not Interested', 'Spam', 'Out of Office'];
    if (!allowedCategories.includes(predictedCategory)) {
        console.warn(`AI returned an unexpected category: "${predictedCategory}". Defaulting to 'Uncategorized'.`);
        return 'Uncategorized';
    }

    return predictedCategory;
  } catch (error) {
    console.error('Error during AI categorization:', error);
    return 'Uncategorized';
  }
}
category("Opportunity with ReachInbox || Backend Engineering Intern Inbox Careers HR <careers@outbox.vc> Tue, Jul 29, 3:44 PM (21 hours ago) Hey there,  Thank you for your interest in the opportunity with us. We are pleased to inform you that you have been shortlisted after the resume screening round. Please find the assignment and details about the product as well for this role. ReachInbox – Our flagship platform for outbound email automation Zapmail – Scaled to $8 Mil ARR in 8 months, solving for cold email infrastructure Backend Internship Assignment - Outbox Labs Kindly ensure that you’ve followed all the instructions provided: 1. The project must include all 6 features to qualify for the assignment round. 2. You are required to submit a video demonstrating all the features, along with your explanation. You can use tools like Loom or similar for recording. You have a maximum of 48 hours to complete this assignment. Receiving this assignment means you're already ahead of many candidates. Good luck!Note: Submitting plagiarized work will result in immediate rejection. All GitHub code will be thoroughly reviewed.  Thank you Best Regards Talent Acquisition Team ReachInbox.ai This email and attachments are confidential and for the intended recipient only. If you're not the recipient, delete and notify the sender. Unauthorized use is prohibited.");
