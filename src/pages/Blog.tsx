import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, BookOpen, Calendar, Clock, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSEO } from "@/hooks/useSEO";
import { mergePublishedBlogPosts } from "@/data/blogPosts";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string | null;
  content: string;
  category: string | null;
  featured_image: string | null;
  published_at: string | null;
  slug: string;
  tags: string[] | null;
}

const defaultImage = "https://images.unsplash.com/photo-1520333789090-1afc82db536a?auto=format&fit=crop&w=1200&q=85";
const formatDate = (date: string) => new Date(date).toLocaleDateString("en-GB", {
  day: "numeric", month: "long", year: "numeric",
});

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useSEO({
    title: "The Journal | MKU Christian Union",
    description: "Sermons, testimonies, reflections, and stories from Mount Kenya University Christian Union.",
    image: blogPosts[0]?.featured_image || defaultImage,
    url: "https://remix-of-mku-cu-connect.vercel.app/blog",
  });

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase.from("blog_posts").select("*")
          .eq("is_published", true).order("published_at", { ascending: false });
        if (error) throw error;
        setBlogPosts(mergePublishedBlogPosts(data || []));
      } catch (error) {
        console.error("Error fetching blog posts:", error);
        setBlogPosts(mergePublishedBlogPosts([]));
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const categories = ["All", ...new Set(blogPosts.map((post) => post.category || "General"))];
  const filtered = selectedCategory === "All" ? blogPosts : blogPosts.filter((post) => (post.category || "General") === selectedCategory);
  const featured = filtered[0];
  const stories = filtered.slice(1);

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-[#191919]">
      <Header />
      <main>
        <section className="border-b border-white/10 bg-[#191919] text-white">
          <div className="container mx-auto px-4 py-7 md:py-10">
            <div className="flex items-end justify-between gap-6 border-b border-white/20 pb-5">
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-[#ff9d2e]">
                  <BookOpen className="h-4 w-4" /> MKU Christian Union
                </div>
                <h1 className="font-serif text-4xl font-bold md:text-6xl">The Journal</h1>
              </div>
              <p className="hidden max-w-sm text-right text-sm leading-6 text-white/65 md:block">
                Sermons, testimonies and reflections from our life together in Christ.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[420px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#ff9d2e]" /></div>
          ) : featured ? (
            <Link to={`/blog/${featured.slug}`} className="group block">
              <div className="container mx-auto grid px-4 pb-10 md:grid-cols-[minmax(0,1.05fr)_minmax(360px,.95fr)] md:items-center md:gap-12 md:pb-14">
                <div className="order-2 py-8 md:order-1 md:py-12">
                  <div className="mb-5 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase text-white/60">
                    <span className="text-[#ff9d2e]">Featured message</span><span aria-hidden="true">/</span><span>{featured.category || "Story"}</span>
                  </div>
                  <h2 className="max-w-3xl font-serif text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">{featured.title}</h2>
                  <p className="mt-5 max-w-2xl text-base leading-7 text-white/70 md:text-lg">{featured.excerpt}</p>
                  <div className="mt-8 flex flex-wrap items-center gap-5 text-sm text-white/60">
                    {featured.published_at && <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {formatDate(featured.published_at)}</span>}
                    <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> {Math.max(1, Math.ceil(featured.content.length / 1500))} min read</span>
                  </div>
                  <span className="mt-9 inline-flex items-center gap-2 border-b border-[#ff9d2e] pb-1 text-sm font-semibold transition-colors group-hover:text-[#ff9d2e]">
                    Read the message <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
                <div className="order-1 flex justify-center bg-[#101010] md:order-2">
                  <img src={featured.featured_image || defaultImage} alt={featured.title} className="aspect-square w-full max-w-[620px] object-contain" />
                </div>
              </div>
            </Link>
          ) : <div className="container mx-auto px-4 py-24 text-center text-white/60">No stories published yet.</div>}
        </section>

        <section className="sticky top-[56px] z-30 border-b border-black/10 bg-[#f7f7f5]/95 backdrop-blur md:top-[64px]">
          <div className="container mx-auto flex items-center gap-6 overflow-x-auto px-4 py-4">
            <span className="hidden text-xs font-bold uppercase text-black/45 sm:block">Browse</span>
            {categories.map((category) => (
              <button key={category} onClick={() => setSelectedCategory(category)}
                className={`shrink-0 border-b-2 px-1 py-1 text-sm font-semibold transition-colors ${selectedCategory === category ? "border-[#b64032] text-[#191919]" : "border-transparent text-black/50 hover:text-black"}`}>
                {category}
              </button>
            ))}
          </div>
        </section>

        {stories.length > 0 && (
          <section className="container mx-auto px-4 py-12 md:py-16">
            <div className="mb-8 flex items-end justify-between border-b border-black/15 pb-4">
              <h2 className="font-serif text-3xl font-bold">More from the journal</h2>
              <span className="text-sm text-black/50">{stories.length} {stories.length === 1 ? "story" : "stories"}</span>
            </div>
            <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {stories.map((post) => (
                <Link key={post.id} to={`/blog/${post.slug}`} className="group block">
                  <div className="aspect-[4/3] overflow-hidden bg-[#e8e8e5]"><img src={post.featured_image || defaultImage} alt={post.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" loading="lazy" /></div>
                  <div className="pt-5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <Badge variant="outline" className="rounded-none border-[#b64032]/30 bg-transparent text-[#8f3026]">{post.category || "Story"}</Badge>
                      {post.published_at && <span className="text-xs text-black/45">{formatDate(post.published_at)}</span>}
                    </div>
                    <h3 className="font-serif text-2xl font-bold leading-snug transition-colors group-hover:text-[#9d3529]">{post.title}</h3>
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-black/60">{post.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="border-t border-black/10 bg-white py-12">
          <div className="container mx-auto flex flex-col justify-between gap-5 px-4 md:flex-row md:items-center">
            <div><h2 className="font-serif text-2xl font-bold">A story worth sharing?</h2><p className="mt-1 text-sm text-black/55">Tell us what God has done in your life.</p></div>
            <a href="https://wa.me/254115475543?text=I%20want%20to%20share%20my%20testimony" target="_blank" rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-2 bg-[#191919] px-5 py-3 text-sm font-semibold text-white hover:bg-[#b64032]">
              Share your testimony <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
