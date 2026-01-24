import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET FAQ by post_id
export async function GET(
  req: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;

    if (!postId) {
      return NextResponse.json(
        { error: "postId is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("post_faqs")
      .select("*")
      .eq("post_id", postId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned
        return NextResponse.json({ data: null, exists: false });
      }
      console.error("Error fetching FAQ:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data, exists: true });
  } catch (error) {
    console.error("Error fetching FAQ:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

// PUT/UPDATE FAQ by post_id
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const { faq_content, visible } = await req.json();

    if (!postId) {
      return NextResponse.json(
        { error: "postId is required" },
        { status: 400 }
      );
    }

    if (!faq_content || !Array.isArray(faq_content)) {
      return NextResponse.json(
        { error: "faq_content must be an array" },
        { status: 400 }
      );
    }

    // Validate FAQ structure - ensure all items have question and answer fields
    const validFaqs = faq_content.filter(
      (item: any) =>
        item &&
        typeof item.question === "string" &&
        typeof item.answer === "string"
    );

    // Check if any FAQs have empty questions or answers
    const incompleteFaqs = validFaqs.filter(
      (item: any) => !item.question.trim() || !item.answer.trim()
    );

    if (incompleteFaqs.length > 0) {
      return NextResponse.json(
        { error: "All FAQ items must have both a question and an answer. Please fill in all fields before saving." },
        { status: 400 }
      );
    }

    if (validFaqs.length === 0 && faq_content.length > 0) {
      return NextResponse.json(
        { error: "Invalid FAQ structure: all items must have question and answer fields" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // Check if FAQ exists
    const { data: existing } = await supabase
      .from("post_faqs")
      .select("id")
      .eq("post_id", postId)
      .single();

    const updateData: any = {
      faq_content: validFaqs,
    };

    if (typeof visible === "boolean") {
      updateData.visible = visible;
    }

    let result;
    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from("post_faqs")
        .update(updateData)
        .eq("post_id", postId)
        .select()
        .single();

      if (error) {
        console.error("Error updating FAQ:", error);
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      result = data;
    } else {
      // Create new
      const { data, error } = await supabase
        .from("post_faqs")
        .insert({
          post_id: postId,
          ...updateData,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating FAQ:", error);
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      result = data;
    }

    return NextResponse.json({ data: result, success: true });
  } catch (error) {
    console.error("Error updating FAQ:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
