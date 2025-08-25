import { Metadata } from 'next'
import Link from 'next/link'
import { getAllPosts } from '@/lib/blog'
import { format } from 'date-fns'
import { Calendar, Clock, User, ArrowRight, BookOpen } from 'lucide-react'
import Navigation from '@/components/layout/Navigation'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Insights, tips, and stories from the BandSeeking music community',
  openGraph: {
    title: 'BandSeeking Blog',
    description: 'Insights, tips, and stories from the BandSeeking music community',
  },
}

export default function BlogPage() {
  const posts = getAllPosts()

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-cyan-300">
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-5xl font-black mb-4">
              BANDSEEKING BLOG
            </h1>
            <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="font-bold text-lg">
                INSIGHTS, TIPS, AND STORIES FROM THE MUSIC COMMUNITY. 
                LEARN HOW TO CONNECT WITH FELLOW MUSICIANS AND GROW YOUR MUSICAL JOURNEY.
              </p>
            </div>
          </div>

          {posts.length === 0 ? (
            <div className="bg-white border-4 border-black p-8 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <BookOpen className="w-16 h-16 mx-auto mb-4" />
              <p className="font-black text-2xl mb-2">NO BLOG POSTS YET</p>
              <p className="font-bold">CHECK BACK SOON FOR AWESOME CONTENT!</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <article 
                  key={post.slug}
                  className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-shadow duration-300"
                >
                  {post.coverImage ? (
                    <div className="h-48 border-b-4 border-black bg-cover bg-center" style={{ backgroundImage: `url(${post.coverImage})` }} />
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-pink-400 to-purple-600 border-b-4 border-black" />
                  )}
                  
                  <div className="p-4">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-block px-2 py-1 text-xs font-black bg-yellow-300 border-2 border-black"
                        >
                          {tag.toUpperCase()}
                        </span>
                      ))}
                    </div>

                    <h2 className="text-xl font-black mb-2 line-clamp-2">
                      <Link 
                        href={`/blog/${post.slug}`}
                        className="hover:text-pink-600 transition-colors"
                      >
                        {post.title.toUpperCase()}
                      </Link>
                    </h2>

                    <p className="font-bold mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center gap-4 text-sm font-bold mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <time dateTime={post.date}>
                          {format(new Date(post.date), 'MMM d, yyyy').toUpperCase()}
                        </time>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{post.readingTime.toUpperCase()}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span className="text-sm font-bold">{post.author.toUpperCase()}</span>
                      </div>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="px-3 py-2 bg-pink-400 border-2 border-black font-black text-xs hover:bg-pink-500 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1"
                      >
                        READ MORE
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}