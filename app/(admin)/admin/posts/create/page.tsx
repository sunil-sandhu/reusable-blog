"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { Editor } from "@/components/mdxeditor/editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MDXEditorMethods } from "@mdxeditor/editor";
import { revalidatePages } from "@/lib/utils/revalidate";

interface FormData {
  title: string;
  description: string;
  author: string;
  topic: string;
  featuredImageUrl: string;
}

export default function CreatePost() {
  const router = useRouter();
  const editorRef = useRef<MDXEditorMethods>(null);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    author: "",
    topic: "",
    featuredImageUrl: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();
  const [websites, setWebsites] = useState<any[]>([]);
  const [selectedWebsite, setSelectedWebsite] = useState("");

  useEffect(() => {
    const fetchWebsites = async () => {
      const { data } = await supabase.from("websites").select("*");
      setWebsites(data || []);
    };
    fetchWebsites();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const content = editorRef.current?.getMarkdown() || "";

      const { error } = await supabase.from("posts").insert({
        content,
        slug,
        website_id: selectedWebsite,
        title: formData.title,
        description: formData.description,
        author: formData.author,
        topic: formData.topic,
        featured_image_url: formData.featuredImageUrl,
      });

      if (error) throw error;

      // Revalidate pages after successful post creation
      await revalidatePages();

      router.push(`/blog/${slug}`);
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formFields = useMemo(
    () => [
      {
        id: "title",
        label: "Title",
        required: true,
      },
      {
        id: "description",
        label: "Description",
      },
      {
        id: "author",
        label: "Author",
      },
      {
        id: "topic",
        label: "Topic",
        placeholder: "e.g., Technology",
      },
      {
        id: "featuredImageUrl",
        label: "Featured Image URL",
        placeholder: "https://example.com/image.jpg",
      },
    ],
    []
  );

  return (
    <div className="">
      <Card className="border-none">
        <CardHeader>
          <CardTitle>Create New Blog Post</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="website">Website</Label>
                <Select
                  value={selectedWebsite}
                  onValueChange={setSelectedWebsite}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a website" />
                  </SelectTrigger>
                  <SelectContent>
                    {websites.map((website) => (
                      <SelectItem key={website.id} value={website.id}>
                        {website.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formFields.map((field) => (
                <div key={field.id}>
                  <Label htmlFor={field.id}>{field.label}</Label>
                  <Input
                    id={field.id}
                    name={field.id}
                    value={formData[field.id as keyof FormData]}
                    onChange={handleInputChange}
                    required={field.required}
                    placeholder={field.placeholder}
                  />
                </div>
              ))}

              <div>
                <Label>Content</Label>
                <div className="min-h-[400px] border">
                  <Editor
                    ref={editorRef}
                    markdown=""
                    contentEditableClassName="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none"
                  />
                </div>
              </div>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Publishing..." : "Publish Post"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
