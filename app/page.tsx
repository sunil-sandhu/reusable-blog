import Link from "next/link";

export default function HomePage() {
  return (
    <main className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-5xl font-bold mb-6">Blog Starter</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          A modern blog starter built with Next.js, Markdown, and Supabase
          support.
        </p>

        <div className="space-y-8 text-left">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
            <p className="mb-4">
              This starter comes with two ways to manage your blog content:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Local Markdown Files:</strong> Write your posts in the{" "}
                <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  content/blog
                </code>{" "}
                directory
              </li>
              <li>
                <strong>Supabase Database:</strong> Store and manage your posts
                in a Supabase database
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              Using Local Markdown
            </h2>
            <p className="mb-4">To add a new blog post using markdown files:</p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>
                Create a new{" "}
                <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  .md
                </code>{" "}
                file in the{" "}
                <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  content/blog
                </code>{" "}
                directory
              </li>
              <li>
                Add frontmatter at the top of your file:
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mt-2">
                  {`---
title: Your Post Title
description: A brief description of your post
date: YYYY-MM-DD
---`}
                </pre>
              </li>
              <li>Write your content in markdown below the frontmatter</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Using Supabase</h2>
            <p className="mb-4">To set up Supabase as your database:</p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Create a new Supabase project</li>
              <li>
                Create a{" "}
                <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  posts
                </code>{" "}
                table with the following columns:
                <ul className="list-disc pl-6 mt-2">
                  <li>
                    <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      slug
                    </code>{" "}
                    (text, unique)
                  </li>
                  <li>
                    <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      title
                    </code>{" "}
                    (text)
                  </li>
                  <li>
                    <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      description
                    </code>{" "}
                    (text)
                  </li>
                  <li>
                    <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      content
                    </code>{" "}
                    (text)
                  </li>
                  <li>
                    <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      date
                    </code>{" "}
                    (date)
                  </li>
                </ul>
              </li>
              <li>
                Add your Supabase credentials to your environment variables
              </li>
              <li>
                Update the{" "}
                <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  supabase.ts
                </code>{" "}
                file with your queries
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">View Your Blog</h2>
            <p className="mb-4">Check out your blog posts at:</p>
            <Link
              href="/blog"
              className="inline-block bg-brand text-white px-6 py-3 rounded-lg hover:bg-brand/90 transition-colors"
            >
              View Blog Posts
            </Link>
          </section>
        </div>
      </div>
    </main>
  );
}
