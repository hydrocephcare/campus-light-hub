import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { format } from "date-fns";
import { ArrowUpRight, Calendar, ChevronLeft, Clock, Facebook, Link2, Loader2, Quote, Share2, Twitter } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CommentsSection } from "@/components/CommentsSection";
import { supabase } from "@/integrations/supabase/client";
import { useSEO } from "@/hooks/useSEO";
import { shareUrl } from "@/lib/shareLinks";
import { toast } from "sonner";
import { findBuiltInBlogPost, mergePublishedBlogPosts } from "@/data/blogPosts";

interface BlogPostRecord {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featured_image: string | null;
  tags: string[] | null;
  category: string | null;
  is_published: boolean | null;
  published_at: string | null;
  created_at: string | null;
}

const fallbackImage = "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=1200&q=85";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostRecord | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPostRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    const fetchPost = async () => {
      try {
        const builtInPost = findBuiltInBlogPost(slug);
        const { data, error } = await supabase.from("blog_posts").select("*")
          .eq("slug", slug).eq("is_published", true).maybeSingle();
        if (error && !builtInPost) throw error;

        const resolvedPost = data || builtInPost;
        setPost(resolvedPost);

        if (resolvedPost) {
          const { data: related } = await supabase.from("blog_posts").select("*")
            .eq("is_published", true).neq("slug", slug).limit(3);
          setRelatedPosts(mergePublishedBlogPosts(related || []).filter((item) => item.slug !== slug).slice(0, 3));
        }
      } catch (error) {
        console.error("Error fetching post:", error);
        toast.error("Failed to load this story");
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  useSEO({
    title: post?.title || "The Journal",
    description: post?.excerpt || "Read sermons and stories from MKU Christian Union.",
    image: post?.featured_image || fallbackImage,
    url: typeof window !== "undefined" ? window.location.href : undefined,
    type: "article",
  });

  // Share through the preview endpoint so WhatsApp/Facebook/X show this
  // story's own featured image instead of the generic site logo.
  const previewLink = () => shareUrl("post", slug || "");
  const copyLink = () => {
    navigator.clipboard.writeText(previewLink());
    toast.success("Link copied");
  };
  const shareFacebook = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(previewLink())}`, "_blank");
  const shareTwitter = () => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(previewLink())}&text=${encodeURIComponent(post?.title || "")}`, "_blank");

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6EFE0] dark:bg-[#2B2420]">
        <Header />
        <main className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#7A2E22] dark:text-[#E08B76]" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#F6EFE0] text-[#1C1712] dark:bg-[#2B2420] dark:text-[#F1E9DC]">
        <Header />
        <main className="container mx-auto px-4 py-28 text-center">
          <p className="mb-3 font-mono text-xs font-bold uppercase tracking-[0.25em] text-[#7A2E22] dark:text-[#E08B76]">The Journal</p>
          <h1 className="font-serif text-4xl font-bold">Story not found</h1>
          <Link to="/blog" className="mt-8 inline-flex items-center gap-2 border-b border-black pb-1 text-sm font-semibold dark:border-[#F1E9DC]">
            <ChevronLeft className="h-4 w-4" /> Back to the journal
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const readTime = Math.max(1, Math.ceil(post.content.length / 1500));
  const heroImage = post.featured_image || fallbackImage;

  return (
    <div className="min-h-screen bg-[#F6EFE0] text-[#1C1712] dark:bg-[#2B2420] dark:text-[#F1E9DC]">
      <Header />
      <main>
        {/* ---------------- Hero ---------------- */}
        <header className="border-b-[3px] border-[#7A2E22] bg-gradient-to-b from-[#FCF8EE] to-[#F6EFE0] dark:border-[#C9695A] dark:from-[#332B25] dark:to-[#2B2420]">
          <div className="container mx-auto max-w-[1180px] px-5 py-12 md:py-20">
            <Link to="/blog" className="mb-10 inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.2em] text-black/55 transition-colors hover:text-black dark:text-[#F1E9DC]/60 dark:hover:text-[#F1E9DC]">
              <ChevronLeft className="h-3.5 w-3.5" /> The Journal
            </Link>

            <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16">
              <div>
                <div className="mb-5 flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center bg-[#7A2E22] px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-white dark:bg-[#C9695A]">
                    {post.category || "Story"}
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-black/50 dark:text-[#F1E9DC]/50">
                    Mount Kenya University Christian Union
                  </span>
                </div>

                <h1 className="font-serif text-[2.3rem] font-bold leading-[1.05] tracking-[-0.01em] sm:text-[2.8rem] md:text-[3.4rem] lg:text-[3.9rem]">
                  {post.title}
                </h1>

                {post.excerpt && (
                  <p className="mt-6 max-w-2xl border-l-2 border-[#A07A2C] pl-5 text-lg leading-8 text-black/70 dark:border-[#D4AF5A] dark:text-[#F1E9DC]/75">
                    {post.excerpt}
                  </p>
                )}

                <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-2 border-t border-black/10 pt-5 font-mono text-[13px] text-black/60 dark:border-white/10 dark:text-[#F1E9DC]/60">
                  {post.published_at && (
                    <span className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" /> {format(new Date(post.published_at), "d MMMM yyyy").toUpperCase()}
                    </span>
                  )}
                  <span className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" /> {readTime} MIN READ
                  </span>
                </div>
              </div>

              <figure className="relative mx-auto w-full max-w-[320px] border border-black/10 bg-[#FCF8EE] p-3 shadow-[0_18px_40px_-20px_rgba(28,23,18,0.45)] dark:border-white/10 dark:bg-[#332B25] lg:mx-0">
                <div className="absolute -left-2 -top-2 h-4 w-4 border-l-2 border-t-2 border-[#A07A2C] dark:border-[#D4AF5A]" />
                <div className="absolute -right-2 -bottom-2 h-4 w-4 border-b-2 border-r-2 border-[#A07A2C] dark:border-[#D4AF5A]" />
                <img src={heroImage} alt={post.title} className="aspect-square h-auto w-full object-cover" />
              </figure>
            </div>
          </div>
        </header>

        {/* ---------------- Body + rail ---------------- */}
        <article className="bg-[#F6EFE0] dark:bg-[#2B2420]">
          <div className="container mx-auto max-w-[1180px] px-5 py-14 md:py-20">
            <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_280px]">
              {/* Main column */}
              <div className="min-w-0 max-w-[720px]">
                <div
                  className="prose prose-neutral max-w-none
                    prose-headings:font-serif prose-headings:font-bold prose-headings:text-[#1C1712] dark:prose-headings:text-[#F1E9DC]
                    prose-h2:mb-5 prose-h2:mt-14 prose-h2:border-t prose-h2:border-black/10 prose-h2:pt-8 prose-h2:text-[1.65rem] prose-h2:leading-tight prose-h2:tracking-[-0.01em] dark:prose-h2:border-white/10
                    prose-h3:mb-3 prose-h3:mt-10 prose-h3:text-[1.25rem] prose-h3:leading-snug
                    prose-p:mb-5 prose-p:mt-0 prose-p:text-[1.08rem] prose-p:leading-[1.9] prose-p:text-black/75 dark:prose-p:text-[#F1E9DC]/80
                    prose-strong:font-bold prose-strong:text-[#1C1712] dark:prose-strong:text-[#F1E9DC]
                    prose-blockquote:my-10 prose-blockquote:border-l-4 prose-blockquote:border-[#7A2E22] prose-blockquote:bg-[#FCF8EE] prose-blockquote:px-6 prose-blockquote:py-5
                    prose-blockquote:font-serif prose-blockquote:text-xl prose-blockquote:not-italic prose-blockquote:leading-8 prose-blockquote:text-[#1C1712]
                    dark:prose-blockquote:border-[#C9695A] dark:prose-blockquote:bg-[#332B25] dark:prose-blockquote:text-[#F1E9DC]
                    prose-ul:my-6 prose-ul:space-y-2.5 prose-li:text-[1.03rem] prose-li:leading-7 prose-li:text-black/75 dark:prose-li:text-[#F1E9DC]/80
                    prose-a:text-[#4E1D16] prose-a:underline prose-a:decoration-[#A07A2C] prose-a:underline-offset-4 dark:prose-a:text-[#E08B76] dark:prose-a:decoration-[#D4AF5A]
                    prose-hr:my-14 prose-hr:border-black/15 dark:prose-hr:border-white/15
                    first:prose-p:first-letter:float-left first:prose-p:first-letter:mr-3 first:prose-p:first-letter:mt-1
                    first:prose-p:first-letter:font-serif first:prose-p:first-letter:text-[4.2rem] first:prose-p:first-letter:font-bold
                    first:prose-p:first-letter:leading-[0.78] first:prose-p:first-letter:text-[#7A2E22] dark:first:prose-p:first-letter:text-[#E08B76]"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {post.tags && post.tags.length > 0 && (
                  <div className="mt-16 border-t border-black/10 pt-8 dark:border-white/10">
                    <p className="mb-4 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-black/55 dark:text-[#F1E9DC]/55">Filed under</p>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="rounded-none border-black/20 bg-[#FCF8EE] px-3 py-1.5 text-sm font-medium text-[#1C1712] dark:border-white/15 dark:bg-[#332B25] dark:text-[#F1E9DC]">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-14" id="comments"><CommentsSection postSlug={post.slug} /></div>
              </div>

              {/* Sticky rail (desktop) */}
              <aside className="hidden lg:block">
                <div className="sticky top-24 space-y-8">
                  <div className="border border-black/10 bg-[#FCF8EE] p-5 dark:border-white/10 dark:bg-[#332B25]">
                    <p className="mb-4 flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-black/55 dark:text-[#F1E9DC]/55">
                      <Share2 className="h-3.5 w-3.5" /> Share this story
                    </p>
                    <div className="flex items-center gap-2">
                      <Button size="icon" className="h-10 w-10 rounded-none bg-[#7A2E22] text-white hover:bg-[#5c231a] dark:bg-[#C9695A] dark:hover:bg-[#B85847]" onClick={shareFacebook} aria-label="Share on Facebook"><Facebook className="h-4 w-4" /></Button>
                      <Button size="icon" className="h-10 w-10 rounded-none bg-[#7A2E22] text-white hover:bg-[#5c231a] dark:bg-[#C9695A] dark:hover:bg-[#B85847]" onClick={shareTwitter} aria-label="Share on X"><Twitter className="h-4 w-4" /></Button>
                      <Button size="icon" variant="outline" className="h-10 w-10 rounded-none border-black/20 dark:border-white/20" onClick={copyLink} aria-label="Copy link"><Link2 className="h-4 w-4" /></Button>
                    </div>
                  </div>

                  <div className="bg-[#4E1D16] p-5 text-[#F6EFE0] dark:bg-[#1F1815]">
                    <Quote className="mb-3 h-5 w-5 text-[#A07A2C] dark:text-[#D4AF5A]" />
                    <p className="font-serif text-lg font-bold leading-snug">Stay rooted. Keep building.</p>
                    <p className="mt-2 text-sm leading-6 text-[#F6EFE0]/75">
                      Share this message with a friend, revisit the Scriptures, and carry the lesson into the semester.
                    </p>
                  </div>

                  <div className="border border-black/10 p-5 dark:border-white/10">
                    <p className="mb-3 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[#37493F] dark:text-[#8FB09E]">On this page</p>
                    <p className="text-sm leading-6 text-black/60 dark:text-[#F1E9DC]/60">{readTime} minute read · {post.category || "Story"}</p>
                  </div>
                </div>
              </aside>
            </div>

            {/* Share + CTA (mobile) */}
            <div className="mt-14 space-y-6 lg:hidden">
              <div className="flex items-center gap-2 border-y border-black/10 py-4 dark:border-white/10">
                <span className="mr-auto flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-black/55 dark:text-[#F1E9DC]/55">
                  <Share2 className="h-3.5 w-3.5" /> Share
                </span>
                <Button size="icon" className="h-10 w-10 rounded-none bg-[#7A2E22] text-white dark:bg-[#C9695A]" onClick={shareFacebook} aria-label="Share on Facebook"><Facebook className="h-4 w-4" /></Button>
                <Button size="icon" className="h-10 w-10 rounded-none bg-[#7A2E22] text-white dark:bg-[#C9695A]" onClick={shareTwitter} aria-label="Share on X"><Twitter className="h-4 w-4" /></Button>
                <Button size="icon" variant="outline" className="h-10 w-10 rounded-none border-black/20 dark:border-white/20" onClick={copyLink} aria-label="Copy link"><Link2 className="h-4 w-4" /></Button>
              </div>
              <div className="bg-[#4E1D16] p-5 text-[#F6EFE0] dark:bg-[#1F1815]">
                <p className="font-serif text-lg font-bold leading-snug">Stay rooted. Keep building.</p>
                <p className="mt-2 text-sm leading-6 text-[#F6EFE0]/75">
                  Share this message with a friend, revisit the Scriptures, and carry the lesson into the semester.
                </p>
              </div>
            </div>
          </div>
        </article>

        {/* ---------------- Related ---------------- */}
        {relatedPosts.length > 0 && (
          <section className="border-t border-black/10 bg-[#FCF8EE] py-16 dark:border-white/10 dark:bg-[#332B25] md:py-24">
            <div className="container mx-auto max-w-[1180px] px-5">
              <div className="mb-10 flex items-end justify-between border-b border-black/10 pb-5 dark:border-white/10">
                <h2 className="font-serif text-3xl font-bold md:text-4xl">Continue reading</h2>
                <Link to="/blog" className="hidden items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.15em] text-[#7A2E22] dark:text-[#E08B76] sm:flex">
                  All stories <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid gap-10 md:grid-cols-3">
                {relatedPosts.map((related) => (
                  <Link key={related.id} to={`/blog/${related.slug}`} className="group">
                    <div className="aspect-[4/3] overflow-hidden bg-[#F6EFE0] dark:bg-[#2B2420]">
                      <img src={related.featured_image || fallbackImage} alt={related.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                    </div>
                    <p className="mt-5 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#7A2E22] dark:text-[#E08B76]">{related.category || "Story"}</p>
                    <h3 className="mt-2 font-serif text-xl font-bold leading-snug text-[#1C1712] transition-colors group-hover:text-[#7A2E22] dark:text-[#F1E9DC] dark:group-hover:text-[#E08B76]">{related.title}</h3>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default BlogPost;
