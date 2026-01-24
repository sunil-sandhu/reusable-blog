"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQEditPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.postId as string;
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingIndex, setEditingIndex] = useState<{
    index: number;
    field: "question" | "answer";
  } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const supabase = createClient();

  useEffect(() => {
    const fetchFAQ = async () => {
      try {
        // Fetch FAQ
        const { data: faqData, error: faqError } = await supabase
          .from("post_faqs")
          .select("*")
          .eq("post_id", postId)
          .single();

        if (faqError && faqError.code !== "PGRST116") {
          console.error("Error fetching FAQ:", faqError);
          return;
        }

        if (faqData && faqData.faq_content) {
          setFaqs(faqData.faq_content);
        }

        // Fetch post title
        const { data: postData } = await supabase
          .from("posts")
          .select("title")
          .eq("id", postId)
          .single();

        if (postData) {
          setPostTitle(postData.title);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchFAQ();
    }
  }, [postId]);

  const handleEdit = (index: number, field: "question" | "answer") => {
    setEditingIndex({ index, field });
    setEditValue(faqs[index][field]);
  };

  const handleSaveEdit = () => {
    if (editingIndex === null) return;

    const newFaqs = [...faqs];
    newFaqs[editingIndex.index][editingIndex.field] = editValue;
    setFaqs(newFaqs);
    setEditingIndex(null);
    setEditValue("");
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditValue("");
  };

  const handleAddFAQ = () => {
    setFaqs([...faqs, { question: "", answer: "" }]);
    // Start editing the new FAQ's question
    setEditingIndex({ index: faqs.length, field: "question" });
    setEditValue("");
  };

  const handleRemoveFAQ = (index: number) => {
    toast("Are you sure you want to remove this FAQ item?", {
      action: {
        label: "Remove",
        onClick: () => {
          const newFaqs = faqs.filter((_, i) => i !== index);
          setFaqs(newFaqs);
          // If we were editing the removed item, cancel editing
          if (editingIndex && editingIndex.index === index) {
            setEditingIndex(null);
            setEditValue("");
          }
          toast.success("FAQ item removed");
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
      duration: 5000,
    });
  };

  const handleSaveAll = async () => {
    // Validate all FAQs have both question and answer
    const invalidFaqs = faqs.filter(
      (faq) => !faq.question.trim() || !faq.answer.trim()
    );

    if (invalidFaqs.length > 0) {
      toast.error(
        "Please ensure all FAQ items have both a question and an answer before saving."
      );
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/faq/${postId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          faq_content: faqs,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save FAQ");
      }

      // Refresh the FAQ data to show the saved version
      const { data: faqData } = await supabase
        .from("post_faqs")
        .select("*")
        .eq("post_id", postId)
        .single();

      if (faqData && faqData.faq_content) {
        setFaqs(faqData.faq_content);
      }

      toast.success("FAQ saved successfully!");
    } catch (error) {
      console.error("Error saving FAQ:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save FAQ. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto p-6 lg:p-8 max-w-4xl">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto p-6 lg:p-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/llm">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit FAQ</h1>
            {postTitle && (
              <p className="text-muted-foreground mt-1">{postTitle}</p>
            )}
          </div>
        </div>
      </div>

      {/* FAQ Content */}
      <Card>
        <CardHeader>
          <CardTitle>FAQ Items</CardTitle>
        </CardHeader>
        <CardContent>
          {faqs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No FAQ items yet. Click the + button below to create one.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="border-b border-border pb-8 last:border-b-0 last:pb-0"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="mb-4">
                        {editingIndex?.index === index &&
                        editingIndex?.field === "question" ? (
                          <div>
                            <Textarea
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="min-h-[60px] font-bold text-lg"
                              placeholder="Enter question..."
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && e.ctrlKey) {
                                  handleSaveEdit();
                                } else if (e.key === "Escape") {
                                  handleCancelEdit();
                                }
                              }}
                              autoFocus
                            />
                            <div className="flex gap-2 mt-2">
                              <Button
                                size="sm"
                                onClick={handleSaveEdit}
                                variant="default"
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                onClick={handleCancelEdit}
                                variant="outline"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <h3
                            className="font-bold text-lg cursor-pointer hover:bg-muted/50 p-2 rounded transition-colors"
                            onClick={() => handleEdit(index, "question")}
                            title="Click to edit"
                          >
                            {faq.question || (
                              <span className="text-muted-foreground italic">
                                Click to add question...
                              </span>
                            )}
                          </h3>
                        )}
                      </div>

                      <div>
                        {editingIndex?.index === index &&
                        editingIndex?.field === "answer" ? (
                          <div>
                            <Textarea
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="min-h-[120px]"
                              placeholder="Enter answer..."
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && e.ctrlKey) {
                                  handleSaveEdit();
                                } else if (e.key === "Escape") {
                                  handleCancelEdit();
                                }
                              }}
                              autoFocus
                            />
                            <div className="flex gap-2 mt-2">
                              <Button
                                size="sm"
                                onClick={handleSaveEdit}
                                variant="default"
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                onClick={handleCancelEdit}
                                variant="outline"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p
                            className="text-base leading-relaxed cursor-pointer hover:bg-muted/50 p-2 rounded transition-colors whitespace-pre-wrap"
                            onClick={() => handleEdit(index, "answer")}
                            title="Click to edit"
                          >
                            {faq.answer || (
                              <span className="text-muted-foreground italic">
                                Click to add answer...
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFAQ(index)}
                      disabled={editingIndex !== null}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Add FAQ Button */}
          <div className="flex justify-center pt-8">
            <Button
              onClick={handleAddFAQ}
              disabled={editingIndex !== null}
              className="h-12 rounded-none border border-black px-4"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="mt-6 bg-muted/50">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            <strong>Tip:</strong> Click on any question or answer to edit it.
            Press Ctrl+Enter to save while editing, or Escape to cancel. Click
            "Save" to persist all changes to the database.
          </p>
        </CardContent>
      </Card>

      {/* Fixed Save Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button 
          onClick={handleSaveAll} 
          disabled={saving || editingIndex !== null}
          size="lg"
          className="shadow-lg"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
