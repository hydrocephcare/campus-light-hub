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

// Ink & parchment palette — deliberately warmer / higher-contrast than a flat cream+terracotta default.
const PAPER = "#F6EFE0";
const PAPER_CARD = "#FCF8EE";
const INK = "#1C1712";
const OXBLOOD = "#7A2E22";
const OXBLOOD_DEEP = "#4E1D16";
const BRASS = "#A07A2C";
const FOREST = "#37493F";

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

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied");
  };
  const shareFacebook = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, "_blank");
  const shareTwitter = () => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post?.title || "")}`, "_blank");

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: PAPER }}>
        <Header />
        <main className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: OXBLOOD }} />
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen" style={{ background: PAPER, color: INK }}>
        <Header />
        <main className="container mx-auto px-4 py-28 text-center">
          <p className="mb-3 font-mono text-xs font-bold uppercase tracking-[0.25em]" style={{ color: OXBLOOD }}>The Journal</p>
          <h1 className="font-serif text-4xl font-bold">Story not found</h1>
          <Link to="/blog" className="mt-8 inline-flex items-center gap-2 border-b pb-1 text-sm font-semibold" style={{ borderColor: INK }}>
            <ChevronLeft className="h-4 w-4" /> Back to the journal
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const readTime = Math.max(1, Math.ceil(post.content.length / 1500));

  return (
    <div className="min-h-screen" style={{ background: PAPER, color: INK }}>
      <Header />
      <main>
        {/* ---------------- Hero ---------------- */}
        <header className="relative overflow-hidden border-b" style={{ borderColor: `${INK}1f`, background: `linear-gradient(180deg, ${PAPER_CARD} 0%, ${PAPER} 100%)` }}>
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-[3px]"
            style={{ background: `repeating-linear-gradient(90deg, ${OXBLOOD} 0 28px, ${BRASS} 28px 30px, transparent 30px 58px)` }}
          />
          <div className="container mx-auto max-w-[1180px] px-5 py-12 md:py-20">
            <Link to="/blog" className="mb-10 inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.2em] transition-colors hover:opacity-70" style={{ color: `${INK}99` }}>
              <ChevronLeft className="h-3.5 w-3.5" /> The Journal
            </Link>

            <div className={`grid items-start gap-10 lg:gap-16 ${post.featured_image ? "lg:grid-cols-[minmax(0,1fr)_360px]" : "lg:max-w-[820px]"}`}>
              <div>
                <div className="mb-5 flex flex-wrap items-center gap-3">
                  <span
                    className="inline-flex items-center px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-white"
                    style={{ background: OXBLOOD }}
                  >
                    {post.category || "Story"}
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: `${INK}70` }}>
                    Mount Kenya University Christian Union
                  </span>
                </div>

                <h1 className="font-serif text-[2.3rem] font-bold leading-[1.05] tracking-[-0.01em] sm:text-[2.8rem] md:text-[3.4rem] lg:text-[3.9rem]">
                  {post.title}
                </h1>

                {post.excerpt && (
                  <p className="mt-6 max-w-2xl border-l-2 pl-5 text-lg leading-8" style={{ borderColor: BRASS, color: `${INK}b3` }}>
                    {post.excerpt}
                  </p>
                )}

                <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-2 pt-5 font-mono text-[13px]" style={{ color: `${INK}80`, borderTop: `1px solid ${INK}1f` }}>
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

              {post.featured_image && (
                <figure className="relative mx-auto w-full max-w-[320px] p-3 shadow-[0_18px_40px_-20px_rgba(28,23,18,0.45)] lg:mx-0" style={{ background: PAPER_CARD, border: `1px solid ${INK}1f` }}>
                  <div className="absolute -left-2 -top-2 h-4 w-4 border-l-2 border-t-2" style={{ borderColor: BRASS }} />
                  <div className="absolute -right-2 -bottom-2 h-4 w-4 border-b-2 border-r-2" style={{ borderColor: BRASS }} />
                  <img src={post.featured_image} alt={post.title} className="aspect-square h-auto w-full object-contain" />
                </figure>
              )}
            </div>
          </div>
        </header>

        {/* ---------------- Body + rail ---------------- */}
        <article style={{ background: PAPER }}>
          <div className="container mx-auto max-w-[1180px] px-5 py-14 md:py-20">
            <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_280px]">
              {/* Main column */}
              <div className="min-w-0 max-w-[720px]">
                <div
                  className="prose prose-neutral max-w-none
                    first:prose-p:first-letter:float-left first:prose-p:first-letter:mr-3 first:prose-p:first-letter:mt-1
                    first:prose-p:first-letter:font-serif first:prose-p:first-letter:text-[4.4rem] first:prose-p:first-letter:font-bold
                    first:prose-p:first-letter:leading-[0.78]
                    prose-headings:font-serif prose-headings:font-bold
                    prose-h2:mb-5 prose-h2:mt-14 prose-h2:text-[1.65rem] prose-h2:leading-tight prose-h2:tracking-[-0.01em]
                    prose-h3:mb-3 prose-h3:mt-10 prose-h3:text-[1.25rem] prose-h3:leading-snug
                    prose-p:mb-5 prose-p:mt-0 prose-p:text-[1.08rem] prose-p:leading-[1.9]
                    prose-strong:font-bold
                    prose-blockquote:relative prose-blockquote:my-10 prose-blockquote:border-none prose-blockquote:px-8 prose-blockquote:py-6
                    prose-blockquote:font-serif prose-blockquote:text-xl prose-blockquote:not-italic prose-blockquote:leading-8
                    prose-ul:my-6 prose-ul:space-y-2.5 prose-li:text-[1.03rem] prose-li:leading-7
                    prose-hr:my-14"
                  style={
                    {
                      color: `${INK}cc`,
                      "--tw-prose-headings": INK,
                      "--tw-prose-bold": INK,
                    } as React.CSSProperties
                  }
                >
                  <style>{`
                    .prose h2 { border-top: 1px solid ${INK}1f; padding-top: 2rem; }
                    .prose h2::before { content: ""; display: block; width: 34px; height: 3px; background: ${BRASS}; margin-bottom: 1rem; }
                    .prose blockquote { background: ${PAPER_CARD}; border-left: 3px solid ${OXBLOOD}; color: ${INK}; }
                    .prose blockquote p { margin: 0; }
                    .prose li::marker { color: ${OXBLOOD}; }
                    .prose > p:first-of-type:first-letter { color: ${OXBLOOD}; }
                    .prose a { color: ${OXBLOOD_DEEP}; text-decoration-color: ${BRASS}; text-underline-offset: 3px; }
                  `}</style>
                  <div dangerouslySetInnerHTML={{ __html: post.content }} />
                </div>

                {post.tags && post.tags.length > 0 && (
                  <div className="mt-16 pt-8" style={{ borderTop: `1px solid ${INK}1f` }}>
                    <p className="mb-4 font-mono text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: `${INK}70` }}>Filed under</p>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="rounded-none px-3 py-1.5 text-sm font-medium" style={{ borderColor: `${INK}30`, background: PAPER_CARD, color: INK }}>
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-14" id="comments"><CommentsSection postSlug={post.slug} /></div>
              </div>

              {/* Sticky rail */}
              <aside className="hidden lg:block">
                <div className="sticky top-24 space-y-8">
                  <div className="p-5" style={{ background: PAPER_CARD, border: `1px solid ${INK}1f` }}>
                    <p className="mb-4 flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: `${INK}70` }}>
                      <Share2 className="h-3.5 w-3.5" /> Share this story
                    </p>
                    <div className="flex items-center gap-2">
                      <Button size="icon" className="h-10 w-10 rounded-none text-white hover:opacity-90" style={{ background: OXBLOOD }} onClick={shareFacebook} title="Share on Facebook" aria-label="Share on Facebook">
                        <Facebook className="h-4 w-4" />
                      </Button>
                      <Button size="icon" className="h-10 w-10 rounded-none text-white hover:opacity-90" style={{ background: OXBLOOD }} onClick={shareTwitter} title="Share on X" aria-label="Share on X">
                        <Twitter className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="outline" className="h-10 w-10 rounded-none" style={{ borderColor: `${INK}30` }} onClick={copyLink} title="Copy link" aria-label="Copy link">
                        <Link2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="p-5" style={{ background: OXBLOOD_DEEP, color: "#F6EFE0" }}>
                    <Quote className="mb-3 h-5 w-5" style={{ color: BRASS }} />
                    <p className="font-serif text-lg font-bold leading-snug">Stay rooted. Keep building.</p>
                    <p className="mt-2 text-sm leading-6" style={{ color: "#F6EFE0b3" }}>
                      Share this message with a friend, revisit the Scriptures, and carry the lesson into the semester.
                    </p>
                  </div>

                  <div className="p-5" style={{ border: `1px solid ${INK}1f` }}>
                    <p className="mb-3 font-mono text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: FOREST }}>On this page</p>
                    <p className="text-sm leading-6" style={{ color: `${INK}90` }}>{readTime} minute read · {post.category || "Story"}</p>
                  </div>
                </div>
              </aside>
            </div>

            {/* Mobile share + CTA (rail content, reflowed) */}
            <div className="mt-14 space-y-6 lg:hidden">
              <div className="flex items-center gap-2 border-y py-4" style={{ borderColor: `${INK}1f` }}>
                <span className="mr-auto flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: `${INK}70` }}>
                  <Share2 className="h-3.5 w-3.5" /> Share
                </span>
                <Button size="icon" className="h-10 w-10 rounded-none text-white" style={{ background: OXBLOOD }} onClick={shareFacebook} aria-label="Share on Facebook"><Facebook className="h-4 w-4" /></Button>
                <Button size="icon" className="h-10 w-10 rounded-none text-white" style={{ background: OXBLOOD }} onClick={shareTwitter} aria-label="Share on X"><Twitter className="h-4 w-4" /></Button>
                <Button size="icon" variant="outline" className="h-10 w-10 rounded-none" style={{ borderColor: `${INK}30` }} onClick={copyLink} aria-label="Copy link"><Link2 className="h-4 w-4" /></Button>
              </div>
              <div className="p-5" style={{ background: OXBLOOD_DEEP, color: "#F6EFE0" }}>
                <p className="font-serif text-lg font-bold leading-snug">Stay rooted. Keep building.</p>
                <p className="mt-2 text-sm leading-6" style={{ color: "#F6EFE0b3" }}>
                  Share this message with a friend, revisit the Scriptures, and carry the lesson into the semester.
                </p>
              </div>
            </div>
          </div>
        </article>

        {/* ---------------- Related ---------------- */}
        {relatedPosts.length > 0 && (
          <section className="border-t py-16 md:py-24" style={{ borderColor: `${INK}1f`, background: PAPER_CARD }}>
            <div className="container mx-auto max-w-[1180px] px-5">
              <div className="mb-10 flex items-end justify-between border-b pb-5" style={{ borderColor: `${INK}1f` }}>
                <h2 className="font-serif text-3xl font-bold md:text-4xl">Continue reading</h2>
                <Link to="/blog" className="hidden items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.15em] sm:flex" style={{ color: OXBLOOD }}>
                  All stories <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid gap-10 md:grid-cols-3">
                {relatedPosts.map((related) => (
                  <Link key={related.id} to={`/blog/${related.slug}`} className="group">
                    <div className="aspect-[4/3] overflow-hidden" style={{ background: PAPER }}>
                      <img src={related.featured_image || fallbackImage} alt={related.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                    </div>
                    <p className="mt-5 font-mono text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: OXBLOOD }}>{related.category || "Story"}</p>
                    <h3 className="mt-2 font-serif text-xl font-bold leading-snug transition-colors" style={{ color: INK }}>{related.title}</h3>
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
