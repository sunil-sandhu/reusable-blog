import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface FAQItem {
  question: string;
  answer: string;
}

const SYSTEM_PROMPT = `You are an expert technical editor and information extraction system.

Your task is to analyze the following blog post content and generate a concise, high-quality FAQ section that:

Is strictly derived from the provided content

Does NOT introduce new facts, opinions, or external knowledge

Does NOT speculate or generalise beyond what the article explicitly states or clearly implies

Is written to maximise clarity for both humans and large language models (LLMs)

CRITICAL: Questions and answers must be STANDALONE and self-contained. They should NOT reference "the article", "the text", "according to the text", "this article", or any similar phrases. Write questions and answers as if they are independent, authoritative statements that could be read without any context about their source.

Questions should be direct and clear (e.g., "How does Web3 differ from Web1 and Web2?" NOT "How does Web3 differ from Web1 and Web2 according to the text?").

Answers should be declarative and confident, written as if stating facts directly (e.g., "Web1 was mostly static and read-only; Web2 made the internet interactive but centralized control with platforms; Web3 responds to that centralization by decentralizing infrastructure, ownership, and control." NOT "According to the article, Web1 was...").

This FAQ will be appended to the article and stored in a database for reuse in AI search, answer engines, and generative summaries.

You must prioritise:

Factual accuracy

Declarative, confident answers

Precision over completeness

Standalone, self-contained content

The FAQ should reflect questions a knowledgeable reader would reasonably ask after reading this specific article, not generic beginner questions.

You must return your response as a valid JSON object with a "faqs" field containing an array of objects. Each object must have exactly two fields: "question" and "answer". The format must be:

{
  "faqs": [
    {
      "question": "What is the main topic?",
      "answer": "The main topic is..."
    },
    {
      "question": "How does it work?",
      "answer": "It works by..."
    }
  ]
}

Do not include any markdown formatting, code blocks, or explanatory text. Return only the raw JSON object.`;

export async function POST(req: Request) {
  try {
    const { postId, content } = await req.json();

    if (!postId || !content) {
      return NextResponse.json(
        { error: "postId and content are required" },
        { status: 400 }
      );
    }

    // Call OpenAI API using responses.create() for gpt-5-mini
    const response = await openai.responses.create({
      model: "gpt-5-mini",
      reasoning: { effort: "low" },
      input: [
        {
          role: "developer",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: `Please generate a FAQ for the following blog post content:\n\n${content}`,
        },
      ],
    });

    const responseContent = response.output_text;
    if (!responseContent) {
      return NextResponse.json(
        { error: "No response from OpenAI" },
        { status: 500 }
      );
    }

    // Parse the JSON response
    let faqData: FAQItem[];
    try {
      const parsed = JSON.parse(responseContent);
      // Extract faqs array from the response object
      if (parsed.faqs && Array.isArray(parsed.faqs)) {
        faqData = parsed.faqs;
      } else if (Array.isArray(parsed)) {
        // Fallback: if response is directly an array
        faqData = parsed;
      } else {
        console.warn("Unexpected response format:", parsed);
        faqData = [];
      }
    } catch (parseError) {
      console.error("Error parsing FAQ response:", parseError);
      // Try to extract JSON from markdown code blocks if present (fallback)
      const jsonMatch = responseContent.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[1]);
          faqData = parsed.faqs || [];
        } catch {
          throw new Error("Failed to parse FAQ response");
        }
      } else {
        throw new Error("Failed to parse FAQ response");
      }
    }

    // Validate structure
    if (!Array.isArray(faqData)) {
      return NextResponse.json(
        { error: "Invalid FAQ structure: expected an array" },
        { status: 500 }
      );
    }

    // Validate each item has question and answer
    const validFaqs = faqData.filter(
      (item) =>
        item &&
        typeof item.question === "string" &&
        typeof item.answer === "string" &&
        item.question.trim() &&
        item.answer.trim()
    );

    if (validFaqs.length === 0) {
      return NextResponse.json(
        { error: "No valid FAQ items generated" },
        { status: 500 }
      );
    }

    // Save to database
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("post_faqs")
      .upsert(
        {
          post_id: postId,
          faq_content: validFaqs,
          visible: true,
        },
        {
          onConflict: "post_id",
        }
      )
      .select()
      .single();

    if (error) {
      console.error("Error saving FAQ:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: validFaqs, success: true });
  } catch (error) {
    console.error("Error generating FAQ:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
