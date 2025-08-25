import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getPostBySlug, getAllPosts, getRelatedPosts } from '@/lib/blog'
import { format } from 'date-fns'
import { Calendar, Clock, User, ArrowLeft, ArrowRight, Tag } from 'lucide-react'
import Navigation from '@/components/layout/Navigation'

interface BlogPostPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  
  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const relatedPosts = getRelatedPosts(slug)

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-lime-300">
        <article className="max-w-4xl mx-auto p-4 md:p-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border-4 border-black font-black text-sm hover:bg-gray-100 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            BACK TO BLOG
          </Link>

          <header className="mb-8">
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 text-xs font-black bg-yellow-300 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  <Tag className="w-3 h-3" />
                  {tag.toUpperCase()}
                </span>
              ))}
            </div>

            <div className="bg-white border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6">
              <h1 className="text-3xl md:text-4xl font-black mb-4">
                {post.title.toUpperCase()}
              </h1>

              <p className="text-lg font-bold mb-6">
                {post.excerpt}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-sm font-bold border-t-2 border-black pt-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{post.author.toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <time dateTime={post.date}>
                    {format(new Date(post.date), 'MMMM d, yyyy').toUpperCase()}
                  </time>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{post.readingTime.toUpperCase()}</span>
                </div>
              </div>
            </div>
          </header>

          {post.coverImage && (
            <div className="mb-8 h-96 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-cover bg-center" style={{ backgroundImage: `url(${post.coverImage})` }} />
          )}

          <div className="bg-white border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-12">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-2xl md:text-3xl font-black mt-8 mb-4 border-b-2 border-black pb-2">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl md:text-2xl font-black mt-8 mb-4 text-pink-600">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-lg md:text-xl font-black mt-6 mb-3">{children}</h3>
                ),
                p: ({ children }) => (
                  <p className="font-bold leading-relaxed mb-4">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside space-y-2 mb-4 font-bold bg-yellow-100 border-2 border-black p-4">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside space-y-2 mb-4 font-bold bg-blue-100 border-2 border-black p-4">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="ml-4">{children}</li>
                ),
                strong: ({ children }) => (
                  <strong className="font-black bg-yellow-300 px-1">{children}</strong>
                ),
                em: ({ children }) => (
                  <em className="italic font-bold text-purple-600">{children}</em>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-8 border-pink-400 bg-pink-50 pl-4 py-4 my-4 font-bold text-lg border-2 border-black">
                    {children}
                  </blockquote>
                ),
                code: ({ children }) => (
                  <code className="bg-gray-900 text-white px-2 py-1 font-mono font-bold border-2 border-black">{children}</code>
                ),
                pre: ({ children }) => (
                  <pre className="bg-gray-900 text-white p-4 border-4 border-black overflow-x-auto mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    {children}
                  </pre>
                ),
                a: ({ href, children }) => (
                  <a href={href} className="text-blue-600 hover:text-blue-800 font-black underline decoration-4 hover:bg-blue-100 px-1 transition-colors">
                    {children}
                  </a>
                ),
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          {relatedPosts.length > 0 && (
            <section className="bg-white border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-2xl md:text-3xl font-black mb-6 border-b-4 border-black pb-4">RELATED POSTS</h2>
              <div className="grid gap-6 md:grid-cols-3">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.slug}
                    href={`/blog/${relatedPost.slug}`}
                    className="group bg-cyan-100 border-4 border-black p-4 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow"
                  >
                    <h3 className="font-black text-lg group-hover:text-pink-600 mb-2 line-clamp-2">
                      {relatedPost.title.toUpperCase()}
                    </h3>
                    <p className="font-bold text-sm mb-3 line-clamp-2">
                      {relatedPost.excerpt}
                    </p>
                    <div className="flex items-center text-sm font-black bg-pink-400 border-2 border-black px-2 py-1 w-fit group-hover:bg-pink-500 transition-colors">
                      READ MORE
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>
      </div>
    </>
  )
}