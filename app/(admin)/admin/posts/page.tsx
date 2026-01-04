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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { revalidatePages } from "@/lib/utils/revalidate";
import {
  Search,
  X,
  Plus,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

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

const POSTS_PER_PAGE = 100;

export default function PostsPage() {
  const [posts, setPosts] = useState<BlogPostWithWebsite[]>([]);
  const [loading, setLoading] = useState(false);
  const [websites, setWebsites] = useState<Website[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterWebsite, setFilterWebsite] = useState<string>("all");
  const [filterAuthor, setFilterAuthor] = useState<string>("all");
  const [filterTopic, setFilterTopic] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const [editingCell, setEditingCell] = useState<{
    postId: string;
    field: string;
  } | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const supabase = createClient();

  useEffect(() => {
    const fetchWebsites = async () => {
      const { data: websitesData } = await supabase
        .from("websites")
        .select("*");
      setWebsites(websitesData || []);
    };

    fetchWebsites();
  }, []);

  const performSearch = async (page: number = 1) => {
    setLoading(true);
    setCurrentPage(page);
    setHasSearched(true);

    try {
      let query = supabase
        .from("posts")
        .select("*, website:websites(*)", { count: "exact" })
        .order("created_at", { ascending: false });

      // Apply filters
      if (filterWebsite !== "all") {
        query = query.eq("website_id", filterWebsite);
      }

      if (filterAuthor !== "all") {
        query = query.eq("author", filterAuthor);
      }

      if (filterTopic !== "all") {
        query = query.eq("topic", filterTopic);
      }

      // Apply search query
      if (searchQuery.trim()) {
        const searchTerm = searchQuery.trim();
        query = query.or(
          `title.ilike.*${searchTerm}*,slug.ilike.*${searchTerm}*,author.ilike.*${searchTerm}*,topic.ilike.*${searchTerm}*,description.ilike.*${searchTerm}*`
        );
      }

      // Apply pagination
      const from = (page - 1) * POSTS_PER_PAGE;
      const to = from + POSTS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data: posts, error, count } = await query;

      if (error) {
        console.error("Error fetching posts:", error);
        setLoading(false);
        return;
      }

      setTotalCount(count || 0);
      setPosts(
        (posts || []).map((post) => ({
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
    } catch (error) {
      console.error("Error searching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    performSearch(1);
  };

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

      // Refresh current page data
      await performSearch(currentPage);
    } catch (error) {
      console.error("Error updating post:", error);
    }

    setEditingCell(null);
  };

  // Fetch unique authors and topics for filter dropdowns
  const [uniqueAuthors, setUniqueAuthors] = useState<string[]>([]);
  const [uniqueTopics, setUniqueTopics] = useState<string[]>([]);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      const [authorsResult, topicsResult] = await Promise.all([
        supabase.from("posts").select("author").not("author", "is", null),
        supabase.from("posts").select("topic").not("topic", "is", null),
      ]);

      if (authorsResult.data) {
        const authors = new Set(
          authorsResult.data.map((p) => p.author).filter(Boolean)
        );
        setUniqueAuthors(Array.from(authors).sort() as string[]);
      }

      if (topicsResult.data) {
        const topics = new Set(
          topicsResult.data.map((p) => p.topic).filter(Boolean)
        );
        setUniqueTopics(Array.from(topics).sort() as string[]);
      }
    };

    fetchFilterOptions();
  }, []);

  const hasActiveFilters =
    searchQuery ||
    filterWebsite !== "all" ||
    filterAuthor !== "all" ||
    filterTopic !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setFilterWebsite("all");
    setFilterAuthor("all");
    setFilterTopic("all");
    setPosts([]);
    setTotalCount(0);
    setCurrentPage(1);
    setHasSearched(false);
  };

  const totalPages = Math.ceil(totalCount / POSTS_PER_PAGE);

  return (
    <div className="mx-auto p-6 lg:p-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog Posts</h1>
          <p className="text-muted-foreground mt-1">
            Manage and edit your blog posts
          </p>
        </div>
        <Link href="/admin/posts/create">
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Create New Post
          </Button>
        </Link>
      </div>

      {/* Filters Card */}
      <Card className="mb-6 bg-transparent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
              <Filter className="h-4 w-4 text-foreground" />
              Filters
            </CardTitle>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-8 text-foreground"
              >
                <X className="mr-2 h-4 w-4 text-foreground" />
                Clear Filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                  className="pl-10 text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            {/* Website Filter */}
            <Select value={filterWebsite} onValueChange={setFilterWebsite}>
              <SelectTrigger className="text-foreground">
                <SelectValue placeholder="All Websites" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-foreground">
                  All Websites
                </SelectItem>
                {websites.map((website) => (
                  <SelectItem
                    key={website.id}
                    value={website.id}
                    className="text-foreground"
                  >
                    {website.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Search Button */}
            <Button
              onClick={handleSearch}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </>
              )}
            </Button>
          </div>

          {/* Author Filter */}
          <Select value={filterAuthor} onValueChange={setFilterAuthor}>
            <SelectTrigger className="text-foreground mt-4">
              <SelectValue placeholder="All Authors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-foreground">
                All Authors
              </SelectItem>
              {uniqueAuthors.map((author) => (
                <SelectItem
                  key={author}
                  value={author}
                  className="text-foreground"
                >
                  {author}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* Topic Filter */}
          <div className="mt-4">
            <Select value={filterTopic} onValueChange={setFilterTopic}>
              <SelectTrigger className="w-full md:w-[300px] text-foreground">
                <SelectValue placeholder="All Topics" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-foreground">
                  All Topics
                </SelectItem>
                {uniqueTopics.map((topic) => (
                  <SelectItem
                    key={topic}
                    value={topic}
                    className="text-foreground"
                  >
                    {topic}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Results Count */}
          {hasSearched && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-semibold text-foreground">
                  {posts.length > 0
                    ? (currentPage - 1) * POSTS_PER_PAGE + 1
                    : 0}
                </span>
                {" - "}
                <span className="font-semibold text-foreground">
                  {Math.min(currentPage * POSTS_PER_PAGE, totalCount)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-foreground">
                  {totalCount}
                </span>{" "}
                posts
              </p>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => performSearch(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => performSearch(currentPage + 1)}
                    disabled={currentPage === totalPages || loading}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Table Card */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
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
                {!hasSearched ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <Search className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground font-medium">
                          No search performed
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Use the filters above to search for posts
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <p className="text-muted-foreground">
                          Loading posts...
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : posts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <Search className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground font-medium">
                          No posts found
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Try adjusting your filters or search query
                        </p>
                        {hasActiveFilters && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={clearFilters}
                            className="mt-2"
                          >
                            Clear Filters
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  posts.map((post) => (
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
                              const website = websites.find(
                                (w) => w.id === value
                              );
                              if (website) {
                                setEditingValue(value);
                                // Update the database
                                supabase
                                  .from("posts")
                                  .update({ website_id: value })
                                  .eq("id", post.id)
                                  .then(async ({ error }) => {
                                    if (error) {
                                      console.error(
                                        "Error updating website:",
                                        error
                                      );
                                      return;
                                    }
                                    // Revalidate pages
                                    await revalidatePages();
                                    // Refresh current page data
                                    await performSearch(currentPage);
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
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
