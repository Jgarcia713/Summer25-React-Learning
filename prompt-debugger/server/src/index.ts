import express from 'express';
import { Request, Response } from "express";
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';

type RequestBody = {prompt: string}

dotenv.config();
const app = express();
const PORT = 3000;
app.use(cors());
app.use(express.json());
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const systemPrompt = `
You are a prompt analysis tool.

Given a user prompt, break it down into the following JSON structure:

{
  "goal": "What the user is trying to achieve",
  "tone": "Style or personality implied (if any)",
  "target_audience": "Who this is meant for (if applicable)",
  "steps_the_LLM_would_take": ["step-by-step reasoning based on this prompt (what are the logical steps an LLM would use to complete this task)"],
  "suggested_improvements": ["ways to make the prompt clearer, more powerful, or safer for LLms to understand"]
}
`;

app.post("/api/promptDebug", async (req: Request<{}, {}, RequestBody>, res: Response) => {
  const { prompt } = req.body;

  try { // OpenAI API call
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
    });

    res.json({ response: chatCompletion.choices[0].message.content });
  
  } catch (err) {
    console.error('OpenAI API error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
