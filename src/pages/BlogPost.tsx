import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { format } from "date-fns";
import { ArrowUpRight, Calendar, ChevronLeft, Clock, Facebook, Link2, Loader2, Share2, Twitter } from "lucide-react";
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
    return <div className="min-h-screen bg-[#f7f7f5]"><Header /><main className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#b64032]" /></main><Footer /></div>;
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#f7f7f5]"><Header />
        <main className="container mx-auto px-4 py-28 text-center">
          <p className="mb-3 text-xs font-bold uppercase text-[#b64032]">The Journal</p>
          <h1 className="font-serif text-4xl font-bold">Story not found</h1>
          <Link to="/blog" className="mt-8 inline-flex items-center gap-2 border-b border-black pb-1 text-sm font-semibold"><ChevronLeft className="h-4 w-4" /> Back to the journal</Link>
        </main><Footer />
      </div>
    );
  }

  const readTime = Math.max(1, Math.ceil(post.content.length / 1500));

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-[#191919]">
      <Header />
      <main>
        <header className="border-b border-[#ded6cf] bg-[#fffaf6] text-[#201a17]">
          <div className="container mx-auto max-w-5xl px-4 py-9 md:py-16">
            <Link to="/blog" className="mb-7 inline-flex items-center gap-2 text-sm text-black/55 transition-colors hover:text-black">
              <ChevronLeft className="h-4 w-4" /> The Journal
            </Link>
            <div className="max-w-4xl">
              <div className="mb-5 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase">
                <span className="text-[#9d3529]">{post.category || "Story"}</span>
                <span className="text-black/25">/</span>
                <span className="text-black/50">MKU Christian Union</span>
              </div>
              <h1 className="font-serif text-3xl font-bold leading-tight md:text-5xl lg:text-6xl">{post.title}</h1>
              {post.excerpt && <p className="mt-5 max-w-3xl text-base leading-7 text-black/65 md:text-lg">{post.excerpt}</p>}
              <div className="mt-7 flex flex-wrap items-center gap-5 border-t border-black/10 pt-5 text-sm text-black/50">
                {post.published_at && <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {format(new Date(post.published_at), "d MMMM yyyy")}</span>}
                <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> {readTime} min read</span>
              </div>
            </div>
          </div>
        </header>

        {post.featured_image && (
          <section className="border-b border-black/10 bg-white">
            <div className="container mx-auto flex justify-center px-4 py-8 md:py-12">
              <img src={post.featured_image} alt={post.title} className="aspect-square w-full max-w-4xl object-contain" />
            </div>
          </section>
        )}

        <article className="container mx-auto max-w-5xl px-5 py-10 md:py-16">
          <div className="grid items-start gap-10 lg:grid-cols-[120px_minmax(0,720px)] lg:gap-16">
            <aside className="order-2 lg:order-1 lg:sticky lg:top-28">
              <div className="flex items-center gap-2 border-y border-black/10 py-4 lg:flex-col lg:border-0 lg:py-0">
                <span className="mr-auto flex items-center gap-2 text-xs font-bold uppercase text-black/40 lg:mb-2 lg:mr-0"><Share2 className="h-4 w-4" /> Share</span>
                <Button size="icon" variant="outline" className="h-10 w-10 rounded-full border-black/15 bg-transparent" onClick={shareFacebook} title="Share on Facebook" aria-label="Share on Facebook"><Facebook className="h-4 w-4" /></Button>
                <Button size="icon" variant="outline" className="h-10 w-10 rounded-full border-black/15 bg-transparent" onClick={shareTwitter} title="Share on X" aria-label="Share on X"><Twitter className="h-4 w-4" /></Button>
                <Button size="icon" variant="outline" className="h-10 w-10 rounded-full border-black/15 bg-transparent" onClick={copyLink} title="Copy link" aria-label="Copy link"><Link2 className="h-4 w-4" /></Button>
              </div>
            </aside>

            <div className="order-1 min-w-0 lg:order-2">
              <div
                className="prose max-w-none
                  prose-headings:font-serif prose-headings:font-bold prose-headings:text-[#191919]
                  prose-h2:mt-11 prose-h2:border-t prose-h2:border-black/15 prose-h2:pt-7 prose-h2:text-2xl
                  prose-h3:mt-8 prose-h3:text-xl
                  prose-p:mb-5 prose-p:text-base prose-p:leading-7 prose-p:text-black/75 md:prose-p:text-[17px]
                  prose-strong:font-semibold prose-strong:text-black
                  prose-blockquote:my-9 prose-blockquote:border-l-4 prose-blockquote:border-[#b64032] prose-blockquote:bg-white prose-blockquote:px-6 prose-blockquote:py-5 prose-blockquote:not-italic
                  prose-blockquote:text-lg prose-blockquote:font-serif prose-blockquote:leading-7 prose-blockquote:text-black
                  prose-ul:my-6 prose-ul:space-y-2 prose-li:text-base prose-li:leading-7 prose-li:text-black/75
                  prose-hr:my-12 prose-hr:border-black/15"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {post.tags && post.tags.length > 0 && (
                <div className="mt-14 border-t border-black/15 pt-7">
                  <p className="mb-4 text-xs font-bold uppercase text-black/45">Filed under</p>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => <Badge key={tag} variant="outline" className="rounded-none border-black/15 bg-white px-3 py-1.5 text-sm font-medium">{tag}</Badge>)}
                  </div>
                </div>
              )}

              <div className="mt-10 border-y border-black/15 py-6">
                <p className="text-xs font-bold uppercase text-[#9d3529]">Mount Kenya University Christian Union</p>
                <h2 className="mt-2 font-serif text-2xl font-bold">Stay rooted. Keep building.</h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-black/55">Share this message with a friend, revisit the Scriptures, and carry the lesson into the semester.</p>
              </div>

              <div className="mt-10"><CommentsSection postSlug={post.slug} /></div>
            </div>
          </div>
        </article>

        {relatedPosts.length > 0 && (
          <section className="border-t border-black/10 bg-white py-14 md:py-20">
            <div className="container mx-auto max-w-6xl px-4">
              <div className="mb-8 flex items-end justify-between border-b border-black/15 pb-4">
                <h2 className="font-serif text-3xl font-bold">Continue reading</h2>
                <Link to="/blog" className="hidden items-center gap-2 text-sm font-semibold sm:flex">All stories <ArrowUpRight className="h-4 w-4" /></Link>
              </div>
              <div className="grid gap-8 md:grid-cols-3">
                {relatedPosts.map((related) => (
                  <Link key={related.id} to={`/blog/${related.slug}`} className="group">
                    <div className="aspect-[4/3] overflow-hidden bg-[#ececea]"><img src={related.featured_image || fallbackImage} alt={related.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" /></div>
                    <p className="mt-4 text-xs font-bold uppercase text-[#9d3529]">{related.category || "Story"}</p>
                    <h3 className="mt-2 font-serif text-xl font-bold leading-snug group-hover:text-[#9d3529]">{related.title}</h3>
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
