"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, FileText, Globe, Sparkles, Plus, ArrowRight, TrendingUp } from "lucide-react";

interface Stats {
  totalPosts: number;
  postsByWebsite: { name: string; count: number }[];
}

interface PostWithWebsite {
  website: {
    name: any;
  }[];
}

function StatCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="h-4 w-24 bg-muted rounded" />
        <div className="h-4 w-4 bg-muted rounded" />
      </CardHeader>
      <CardContent>
        <div className="h-8 w-16 bg-muted rounded mt-2" />
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalPosts: 0,
    postsByWebsite: [],
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get total posts count
        const { count: totalPosts } = await supabase
          .from("posts")
          .select("*", { count: "exact", head: true });

        // Get all websites
        const { data: websites } = await supabase
          .from("websites")
          .select("id, name");

        if (!websites) {
          setStats({
            totalPosts: totalPosts || 0,
            postsByWebsite: [],
          });
          return;
        }

        // Get count for each website
        const postsByWebsitePromises = websites.map(async (website) => {
          const { count } = await supabase
            .from("posts")
            .select("*", { count: "exact", head: true })
            .eq("website_id", website.id);

          return {
            name: website.name,
            count: count || 0,
          };
        });

        const postsByWebsite = await Promise.all(postsByWebsitePromises);

        setStats({
          totalPosts: totalPosts || 0,
          postsByWebsite: postsByWebsite.sort((a, b) => b.count - a.count),
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header Section */}
        <div className="mb-8 sm:mb-12">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Manage your blog content and analytics
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
            {/* Total Posts Card */}
            <Card className="group hover:shadow-lg transition-all duration-300 border hover:border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Posts
                </CardTitle>
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-1">{stats.totalPosts}</div>
                <p className="text-xs text-muted-foreground">
                  All published posts
                </p>
              </CardContent>
            </Card>

            {/* Posts by Website Card */}
            <Card className="group hover:shadow-lg transition-all duration-300 border hover:border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Posts by Website
                </CardTitle>
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.postsByWebsite.length > 0 ? (
                    stats.postsByWebsite.map((website, index) => (
                      <div
                        key={website.name}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                          <span className="text-sm font-medium">
                            {website.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">{website.count}</span>
                          {index === 0 && stats.postsByWebsite.length > 1 && (
                            <TrendingUp className="h-3 w-3 text-primary" />
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No websites found
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions Card */}
            <Card className="group hover:shadow-lg transition-all duration-300 border hover:border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Actions
                </CardTitle>
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  <Link href="/admin/posts/create" className="block">
                    <Button
                      variant="outline"
                      className="w-full justify-between group/btn hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Create New Post
                      </span>
                      <ArrowRight className="h-4 w-4 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                    </Button>
                  </Link>
                  <Link href="/admin/posts" className="block">
                    <Button
                      variant="outline"
                      className="w-full justify-between group/btn hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        View All Posts
                      </span>
                      <ArrowRight className="h-4 w-4 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                    </Button>
                  </Link>
                  <Link href="/admin/llm" className="block">
                    <Button
                      variant="outline"
                      className="w-full justify-between group/btn hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Manage FAQs
                      </span>
                      <ArrowRight className="h-4 w-4 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
