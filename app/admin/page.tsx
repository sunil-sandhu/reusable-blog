"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, FileText, Globe } from "lucide-react";

interface Stats {
  totalPosts: number;
  postsByWebsite: { name: string; count: number }[];
}

interface PostWithWebsite {
  website: {
    name: any;
  }[];
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

        // Get posts with website information
        const { data: posts } = await supabase
          .from("posts")
          .select("website:websites(name)");

        if (!posts) {
          setStats({
            totalPosts: totalPosts || 0,
            postsByWebsite: [],
          });
          return;
        }

        // Transform the data to get counts by website
        const websiteCounts: { [key: string]: number } = {};
        (posts as any[]).forEach((post) => {
          const websiteName = post.website.name;
          websiteCounts[websiteName] = (websiteCounts[websiteName] || 0) + 1;
        });

        setStats({
          totalPosts: totalPosts || 0,
          postsByWebsite: Object.entries(websiteCounts).map(
            ([name, count]) => ({
              name,
              count,
            })
          ),
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="space-x-4">
          <Link href="/admin/posts">
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Manage Posts
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPosts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Posts by Website
            </CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.postsByWebsite.map((website) => (
                <div key={website.name} className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    {website.name}
                  </span>
                  <span className="font-medium">{website.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link href="/admin/posts/create">
                <Button variant="outline" className="w-full">
                  Create New Post
                </Button>
              </Link>
              <Link href="/admin/posts">
                <Button variant="outline" className="w-full">
                  View All Posts
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
