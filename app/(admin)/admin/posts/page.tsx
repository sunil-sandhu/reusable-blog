"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { revalidatePages } from "@/lib/utils/revalidate";

interface BlogPostWithWebsite {
  id: string;
  title: string;
  slug: string;
  description: string;
  date: string;
  author: string;
  topic: string;
  featured_image_url: string;
  created_at: string;
  website: {
    id: string;
    name: string;
  };
}

interface Website {
  id: string;
  name: string;
}

export default function PostsPage() {
  const [posts, setPosts] = useState<BlogPostWithWebsite[]>([]);
  const [loading, setLoading] = useState(true);
  const [websites, setWebsites] = useState<Website[]>([]);
  const [editingCell, setEditingCell] = useState<{
    postId: string;
    field: string;
  } | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      // Fetch websites
      const { data: websitesData } = await supabase
        .from("websites")
        .select("*");
      setWebsites(websitesData || []);

      // Fetch posts
      const { data: posts, error } = await supabase
        .from("posts")
        .select("*, website:websites(*)")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching posts:", error);
        return;
      }

      setPosts(
        posts.map((post) => ({
          id: post.id,
          title: post.title,
          slug: post.slug,
          description: post.description,
          date: post.created_at,
          author: post.author,
          topic: post.topic,
          featured_image_url: post.featured_image_url,
          created_at: post.created_at,
          website: {
            id: post.website.id,
            name: post.website.name,
          },
        }))
      );
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleDoubleClick = (postId: string, field: string, value: string) => {
    setEditingCell({ postId, field });
    setEditingValue(value);
  };

  const handleBlur = async () => {
    if (!editingCell) return;

    const { postId, field } = editingCell;
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    try {
      let updateData: any = {};
      if (field === "website") {
        updateData.website_id = editingValue;
      } else if (field === "date") {
        updateData.created_at = editingValue;
      } else {
        updateData[field] = editingValue;
      }

      const { error } = await supabase
        .from("posts")
        .update(updateData)
        .eq("id", postId);

      if (error) throw error;

      // Update local state
      setPosts((prevPosts) =>
        prevPosts.map((p) => {
          if (p.id !== postId) return p;
          if (field === "website") {
            const website = websites.find((w) => w.id === editingValue);
            return {
              ...p,
              website: {
                id: editingValue,
                name: website?.name || "",
              },
            };
          } else if (field === "date") {
            return {
              ...p,
              date: editingValue,
              created_at: editingValue,
            };
          }
          return {
            ...p,
            [field]: editingValue,
          };
        })
      );

      // Revalidate pages after successful update
      await revalidatePages();
    } catch (error) {
      console.error("Error updating post:", error);
    }

    setEditingCell(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Blog Posts</h1>
        <Link href="/admin/posts/create">
          <Button>Create New Post</Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Website</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Topic</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell
                  onDoubleClick={() =>
                    handleDoubleClick(post.id, "title", post.title)
                  }
                >
                  {editingCell?.postId === post.id &&
                  editingCell?.field === "title" ? (
                    <Input
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      onBlur={handleBlur}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleBlur();
                        }
                      }}
                      autoFocus
                    />
                  ) : (
                    post.title
                  )}
                </TableCell>
                <TableCell
                  onDoubleClick={() =>
                    handleDoubleClick(post.id, "slug", post.slug)
                  }
                >
                  {editingCell?.postId === post.id &&
                  editingCell?.field === "slug" ? (
                    <Input
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      onBlur={handleBlur}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleBlur();
                        }
                      }}
                      autoFocus
                    />
                  ) : (
                    post.slug
                  )}
                </TableCell>
                <TableCell
                  onDoubleClick={() =>
                    handleDoubleClick(post.id, "website", post.website.id)
                  }
                >
                  {editingCell?.postId === post.id &&
                  editingCell?.field === "website" ? (
                    <Select
                      value={editingValue}
                      onValueChange={(value) => {
                        const website = websites.find((w) => w.id === value);
                        if (website) {
                          setEditingValue(value);
                          // Update the database
                          supabase
                            .from("posts")
                            .update({ website_id: value })
                            .eq("id", post.id)
                            .then(({ error }) => {
                              if (error) {
                                console.error("Error updating website:", error);
                                return;
                              }
                              // Update local state
                              setPosts((prevPosts) =>
                                prevPosts.map((p) =>
                                  p.id === post.id
                                    ? {
                                        ...p,
                                        website: {
                                          id: value,
                                          name: website.name,
                                        },
                                      }
                                    : p
                                )
                              );
                            });
                          setEditingCell(null);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {websites.map((website) => (
                          <SelectItem key={website.id} value={website.id}>
                            {website.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    post.website.name
                  )}
                </TableCell>
                <TableCell
                  onDoubleClick={() =>
                    handleDoubleClick(post.id, "author", post.author)
                  }
                >
                  {editingCell?.postId === post.id &&
                  editingCell?.field === "author" ? (
                    <Input
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      onBlur={handleBlur}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleBlur();
                        }
                      }}
                      autoFocus
                    />
                  ) : (
                    post.author
                  )}
                </TableCell>
                <TableCell
                  onDoubleClick={() =>
                    handleDoubleClick(post.id, "topic", post.topic)
                  }
                >
                  {editingCell?.postId === post.id &&
                  editingCell?.field === "topic" ? (
                    <Input
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      onBlur={handleBlur}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleBlur();
                        }
                      }}
                      autoFocus
                    />
                  ) : (
                    post.topic
                  )}
                </TableCell>
                <TableCell
                  onDoubleClick={() =>
                    handleDoubleClick(post.id, "date", post.date)
                  }
                >
                  {editingCell?.postId === post.id &&
                  editingCell?.field === "date" ? (
                    <Input
                      type="datetime-local"
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      onBlur={handleBlur}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleBlur();
                        }
                      }}
                      autoFocus
                    />
                  ) : (
                    format(new Date(post.date), "PPP")
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Link href={`/admin/posts/${post.slug}`}>
                      <Button variant="outline" size="sm">
                        Update
                      </Button>
                    </Link>
                    <Link href={`/blog/${post.slug}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
