"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Save } from "lucide-react";

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
        placeholder: "e.g., John Doe",
      },
      {
        id: "topic",
        label: "Topic",
        placeholder: "e.g., Technology",
        required: true,
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
    <div className="min-h-screen bg-background">
      <form
        id="post-form"
        onSubmit={handleSubmit}
        className="mx-auto max-w-[1400px]"
      >
        <div className="grid gap-6 lg:grid-cols-[320px_1fr] xl:grid-cols-[380px_1fr]">
          {/* Desktop Sidebar - Metadata (Left Side) */}
          <div className="hidden lg:block w-[320px] xl:w-[380px] border-r border-border sticky top-0 h-screen overflow-y-auto">
            <div className="p-6 space-y-6">
              <h2 className="text-lg font-semibold">Metadata</h2>

              {/* Website Selector */}
              <div className="space-y-2">
                <Label
                  htmlFor="website-desktop"
                  className="text-sm font-medium"
                >
                  Website <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={selectedWebsite}
                  onValueChange={setSelectedWebsite}
                >
                  <SelectTrigger id="website-desktop">
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

              {/* Other Form Fields */}
              {formFields
                .filter(
                  (field) => field.id !== "title" && field.id !== "description"
                )
                .map((field) => (
                  <div key={field.id} className="space-y-2">
                    <Label htmlFor={field.id} className="text-sm font-medium">
                      {field.label}
                      {field.required && (
                        <span className="text-destructive"> *</span>
                      )}
                    </Label>
                    <Input
                      id={field.id}
                      name={field.id}
                      value={formData[field.id as keyof FormData]}
                      onChange={handleInputChange}
                      required={field.required}
                      placeholder={field.placeholder}
                      className="w-full"
                    />
                  </div>
                ))}

              {/* Header Section */}
              <div className="space-y-4 pb-4 border-b border-border">
                <Button
                  type="submit"
                  form="post-form"
                  disabled={isSubmitting || !formData.title || !selectedWebsite}
                  className="w-full gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isSubmitting ? "Publishing..." : "Publish"}
                </Button>
              </div>
            </div>
          </div>

          {/* Main Editor Area */}
          <div className="min-w-0">
            {/* Mobile Metadata Section - Above editor on mobile */}
            <div className="px-4 py-6 sm:px-6 lg:px-8 mb-6 space-y-6 border-b border-border pb-6 lg:hidden">
              {/* Header Section */}
              <div className="space-y-4 pb-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-semibold">New Post</h1>
                </div>
                <Button
                  type="submit"
                  form="post-form"
                  disabled={isSubmitting || !formData.title || !selectedWebsite}
                  className="w-full gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isSubmitting ? "Publishing..." : "Publish"}
                </Button>
              </div>

              <h2 className="text-lg font-semibold">Metadata</h2>

              {/* Website Selector */}
              <div className="space-y-2">
                <Label htmlFor="website-mobile" className="text-sm font-medium">
                  Website <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={selectedWebsite}
                  onValueChange={setSelectedWebsite}
                >
                  <SelectTrigger id="website-mobile">
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

              {/* Other Form Fields */}
              {formFields
                .filter(
                  (field) => field.id !== "title" && field.id !== "description"
                )
                .map((field) => (
                  <div key={field.id} className="space-y-2">
                    <Label htmlFor={field.id} className="text-sm font-medium">
                      {field.label}
                      {field.required && (
                        <span className="text-destructive"> *</span>
                      )}
                    </Label>
                    <Input
                      id={field.id}
                      name={field.id}
                      value={formData[field.id as keyof FormData]}
                      onChange={handleInputChange}
                      required={field.required}
                      placeholder={field.placeholder}
                      className="w-full"
                    />
                  </div>
                ))}
            </div>

            {/* Title and Description Section - With Padding */}
            <div className="px-2 py-6 pb-0">
              {/* Title Input - Large, Editor-style */}
              <div className="mb-6">
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Post title..."
                  className="h-auto border-none bg-transparent p-0 text-3xl font-semibold placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 sm:text-4xl md:text-5xl"
                />
              </div>

              {/* Description Input */}
              <div className="mb-4">
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Add a description (optional)..."
                  className="h-auto border-none bg-transparent p-0 text-lg text-muted-foreground placeholder:text-muted-foreground/60 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
            </div>

            {/* Content Editor - No Side Padding */}
            <div className="rounded-lg editor-container">
              <Editor
                ref={editorRef}
                markdown=""
                contentEditableClassName="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none min-h-[500px] p-6"
              />
            </div>

            <div className="px-4 sm:px-6 lg:px-8">
              <Button
                type="submit"
                form="post-form"
                disabled={isSubmitting || !formData.title || !selectedWebsite}
                className="w-full gap-2 mt-4 md:hidden"
              >
                <Save className="h-4 w-4" />
                {isSubmitting ? "Publishing..." : "Publish"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
