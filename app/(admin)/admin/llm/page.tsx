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
import {
  Search,
  X,
  Filter,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

interface BlogPostWithWebsite {
  id: string;
  title: string;
  slug: string;
  date: string;
  created_at: string;
  website: {
    id: string;
    name: string;
  };
  has_faq?: boolean;
}

interface Website {
  id: string;
  name: string;
}

const POSTS_PER_PAGE = 100;

export default function LLMPage() {
  const [posts, setPosts] = useState<BlogPostWithWebsite[]>([]);
  const [loading, setLoading] = useState(false);
  const [websites, setWebsites] = useState<Website[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterWebsite, setFilterWebsite] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const [generatingFaq, setGeneratingFaq] = useState<string | null>(null);
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
        .select(
          "id, title, slug, created_at, website_id, description, content, website:websites(id, name)",
          { count: "exact" }
        )
        .order("created_at", { ascending: false });

      // Apply filters
      if (filterWebsite !== "all") {
        query = query.eq("website_id", filterWebsite);
      }

      // Apply search query
      if (searchQuery.trim()) {
        const searchTerm = searchQuery.trim();
        query = query.or(
          `title.ilike.*${searchTerm}*,slug.ilike.*${searchTerm}*,description.ilike.*${searchTerm}*`
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

      // Check which posts have FAQs
      const postIds = (posts || []).map((p: any) => p.id);
      const { data: faqsData } = await supabase
        .from("post_faqs")
        .select("post_id")
        .in("post_id", postIds);

      const postsWithFaqs = new Set(
        (faqsData || []).map((f) => f.post_id)
      );

      setTotalCount(count || 0);
      setPosts(
        (posts || []).map((post: any) => ({
          id: post.id,
          title: post.title,
          slug: post.slug,
          date: post.created_at,
          created_at: post.created_at,
          content: post.content,
          website: {
            id: post.website?.id || "",
            name: post.website?.name || "",
          },
          has_faq: postsWithFaqs.has(post.id),
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

  const handleGenerateFAQ = async (postId: string, content: string) => {
    setGeneratingFaq(postId);
    try {
      const response = await fetch("/api/generate-faq", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          content,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to generate FAQ");
      }

      // Refresh the current page to show updated FAQ status
      await performSearch(currentPage);
      toast.success("FAQ generated successfully!");
    } catch (error) {
      console.error("Error generating FAQ:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to generate FAQ. Please try again."
      );
    } finally {
      setGeneratingFaq(null);
    }
  };


  const hasActiveFilters =
    searchQuery ||
    filterWebsite !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setFilterWebsite("all");
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
          <h1 className="text-3xl font-bold tracking-tight">LLM FAQ Management</h1>
          <p className="text-muted-foreground mt-1">
            Generate and manage FAQs for blog posts using AI
          </p>
        </div>
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
                <TableHead>Website</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>FAQ Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!hasSearched ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
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
                  <TableCell colSpan={5} className="text-center py-12">
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
                  <TableCell colSpan={5} className="text-center py-12">
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
                    <TableCell>{post.title}</TableCell>
                    <TableCell>{post.website.name}</TableCell>
                    <TableCell>
                      {format(new Date(post.date), "PPP")}
                    </TableCell>
                    <TableCell>
                      {post.has_faq ? (
                        <span className="text-green-600 font-medium">
                          Has FAQ
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          No FAQ
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleGenerateFAQ(
                              post.id,
                              (post as any).content || ""
                            )
                          }
                          disabled={generatingFaq === post.id}
                        >
                          {generatingFaq === post.id ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-2"></div>
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="mr-2 h-3 w-3" />
                              Generate FAQ
                            </>
                          )}
                        </Button>
                        {post.has_faq && (
                          <Link href={`/admin/llm/${post.id}/faq`}>
                            <Button variant="outline" size="sm">
                              <Eye className="mr-2 h-3 w-3" />
                              View FAQ
                            </Button>
                          </Link>
                        )}
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
