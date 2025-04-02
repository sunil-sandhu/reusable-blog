"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import matter from "gray-matter";
import { BlogPost } from "@/lib/blog/types";

interface BlogPostWithWebsite extends BlogPost {
  id: string;
  created_at: string;
  website: {
    name: string;
  };
}

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<BlogPostWithWebsite[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchPosts = async () => {
      // should also say which website each post belongs to
      const { data, error } = await supabase
        .from("posts")
        .select("*, website:websites(*)");
      if (error) {
        console.error("Error fetching posts:", error);
        return;
      }

      // Parse frontmatter for each post
      const postsWithFrontmatter = data.map((post) => {
        const { data: frontmatter } = matter(post.content);
        return {
          ...post,
          title: frontmatter.title,
          description: frontmatter.description,
          date: frontmatter.date,
          author: frontmatter.author,
          topic: frontmatter.topic,
          featured_image_url: frontmatter.featured_image_url,
        };
      });

      setPosts(postsWithFrontmatter);
      setLoading(false);
    };

    fetchPosts();
  }, []);

  const handleEdit = (slug: string) => {
    router.push(`/admin/posts/${slug}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Blog Posts</CardTitle>
          <Button onClick={() => router.push("/create")}>
            Create New Post
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Website</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Topic</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>{post.website.name}</TableCell>
                  <TableCell>{post.title}</TableCell>
                  <TableCell>{post.slug}</TableCell>
                  <TableCell>{post.author}</TableCell>
                  <TableCell>{post.topic}</TableCell>
                  <TableCell>
                    {new Date(post.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(post.slug)}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
