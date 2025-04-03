"use client";

import { useEffect, useState, useRef } from "react";
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

      // Set form data
      setFormData({
        title: postData.title || "",
        description: postData.description || "",
        author: postData.author || "",
        topic: postData.topic || "",
        featuredImageUrl: postData.featured_image_url || "",
      });

      // Set website
      setSelectedWebsite(postData.website_id);

      // Set content
      setContent(postData.content);

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

      const { error } = await supabase
        .from("posts")
        .update({
          content: currentContent,
          website_id: selectedWebsite,
          title: formData.title,
          description: formData.description,
          author: formData.author,
          topic: formData.topic,
          featured_image_url: formData.featuredImageUrl,
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
