"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CreatePost() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [author, setAuthor] = useState("");
  const [topic, setTopic] = useState("");
  const [featuredImageUrl, setFeaturedImageUrl] = useState("");
  const [content, setContent] = useState("");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create slug from title
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      // Create frontmatter
      const frontmatter = {
        title,
        description,
        date: new Date().toISOString(),
        ...(author && { author }),
        ...(topic && { topic: [topic] }),
        ...(featuredImageUrl && { featured_image_url: featuredImageUrl }),
      };

      // Combine frontmatter and content
      const fullContent = `---
${Object.entries(frontmatter)
  .map(
    ([key, value]) =>
      `${key}: ${Array.isArray(value) ? value.join(", ") : value}`
  )
  .join("\n")}
---

${content}`;

      // Save to database
      const { error } = await supabase.from("posts").insert({
        content: fullContent,
        slug,
        website_id: selectedWebsite,
      });

      if (error) throw error;

      router.push(`/blog/${slug}`);
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create New Blog Post</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Select
                value={selectedWebsite}
                onValueChange={(value) => setSelectedWebsite(value)}
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
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setTitle(e.target.value)
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setDescription(e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                value={author}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setAuthor(e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setTopic(e.target.value)
                }
                placeholder="e.g., Technology"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="featuredImageUrl">Featured Image URL</Label>
              <Input
                id="featuredImageUrl"
                value={featuredImageUrl}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFeaturedImageUrl(e.target.value)
                }
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content (Markdown)</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setContent(e.target.value)
                }
                className="min-h-[400px] font-mono"
                required
              />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Publishing..." : "Publish Post"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
