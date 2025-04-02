"use client";

import { useEffect, useState, useRef, use } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { parseFrontmatter } from "@/lib/parse-frontmatter";

interface FormData {
  title: string;
  description: string;
  author: string;
  topic: string;
  featuredImageUrl: string;
}

export default function EditPostPage({ params }: { params: { slug: string } }) {
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
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const supabase = createClient();
  const [websites, setWebsites] = useState<any[]>([]);
  const [selectedWebsite, setSelectedWebsite] = useState("");

  const { slug } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      // Fetch websites
      const { data: websitesData } = await supabase
        .from("websites")
        .select("*");
      setWebsites(websitesData || []);

      // Fetch post data
      const { data: postData, error } = await supabase
        .from("posts")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error) {
        console.error("Error fetching post:", error);
        return;
      }

      // Parse frontmatter
      const { data: frontmatter, content: postContent } = parseFrontmatter(
        postData.content
      );

      // Set form data
      setFormData({
        title: frontmatter.title || "",
        description: frontmatter.description || "",
        author: frontmatter.author || "",
        topic: Array.isArray(frontmatter.topic)
          ? frontmatter.topic[0]
          : frontmatter.topic || "",
        featuredImageUrl: frontmatter.featured_image_url || "",
      });

      // Set website
      setSelectedWebsite(postData.website_id);

      // Set content
      setContent(postContent);

      setLoading(false);
    };

    fetchData();
  }, [slug]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const currentContent = editorRef.current?.getMarkdown() || content;

      const frontmatter = {
        title: formData.title,
        description: formData.description,
        date: new Date().toISOString(),
        ...(formData.author && { author: formData.author }),
        ...(formData.topic && { topic: [formData.topic] }),
        ...(formData.featuredImageUrl && {
          featured_image_url: formData.featuredImageUrl,
        }),
      };

      const fullContent = `---
${Object.entries(frontmatter)
  .map(
    ([key, value]) =>
      `${key}: ${Array.isArray(value) ? value.join(", ") : value}`
  )
  .join("\n")}
---

${currentContent}`;

      const { error } = await supabase
        .from("posts")
        .update({
          content: fullContent,
          website_id: selectedWebsite,
        })
        .eq("slug", params.slug);

      if (error) throw error;

      router.push("/admin/posts");
    } catch (error) {
      console.error("Error updating post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formFields = [
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
  ];

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Edit Blog Post</CardTitle>
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
                <div className="min-h-[400px] border rounded-md">
                  <Editor
                    ref={editorRef}
                    markdown={content}
                    contentEditableClassName="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update Post"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/admin/posts")}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
