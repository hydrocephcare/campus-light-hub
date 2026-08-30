import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight, BookOpen, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSEO } from "@/hooks/useSEO";

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

const defaultImage = "https://images.unsplash.com/photo-1520333789090-1afc82db536a?auto=format&fit=crop&w=800&q=80";

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useSEO({
    title: "Faith Stories — Blog & Testimonies",
    description: "Read inspiring stories of faith, transformation, and God's work at MKU Christian Union. Real testimonies from students.",
    image: "https://images.unsplash.com/photo-1520333789090-1afc82db536a?auto=format&fit=crop&w=1200&q=80",
    url: "https://mkucuu.lovable.app/blog",
  });

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data, error } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("is_published", true)
          .order("published_at", { ascending: false });
        if (error) throw error;
        setBlogPosts(data || []);
      } catch (error) {
        console.error("Error fetching blog posts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const categories = ["All", ...new Set(blogPosts.map(p => p.category || "General"))];
  const filtered = selectedCategory === "All" ? blogPosts : blogPosts.filter(p => p.category === selectedCategory);
  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero */}
        <section className="relative min-h-[45vh] md:min-h-[55vh] flex items-end overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={featured?.featured_image || defaultImage}
              alt="Blog"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-black/60 to-black/30" />
          </div>
          <div className="container mx-auto px-4 relative z-10 pb-10 md:pb-14">
            <div className="inline-flex items-center gap-2 bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-sm font-medium mb-4">
              <BookOpen className="w-4 h-4" /> Faith Stories
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-3">
              Stories of Transformation
            </h1>
            <p className="text-base md:text-lg text-white/80 max-w-2xl">
              Real stories of faith and how God is moving at MKU CU
            </p>
          </div>
        </section>

        {/* Category Filter */}
        <section className="py-4 bg-muted/30 border-b border-border sticky top-[56px] md:top-[64px] z-40 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                    selectedCategory === cat
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted/50 text-foreground hover:bg-muted"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground/40" />
            <h3 className="text-xl font-bold mb-2">No Stories Yet</h3>
            <p className="text-muted-foreground">Check back soon for inspiring content</p>
          </div>
        ) : (
          <>
            {/* Featured Post */}
            {featured && (
              <section className="py-10">
                <div className="container mx-auto px-4">
                  <Link to={`/blog/${featured.slug}`}>
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow max-w-5xl mx-auto group">
                      <div className="grid md:grid-cols-2">
                        <div className="relative aspect-[16/10] md:aspect-auto md:min-h-[300px] overflow-hidden">
                          <img
                            src={featured.featured_image || defaultImage}
                            alt={featured.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {featured.category && (
                            <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                              {featured.category}
                            </Badge>
                          )}
                        </div>
                        <div className="p-6 md:p-8 flex flex-col justify-center">
                          <span className="text-xs font-bold uppercase tracking-wider text-primary mb-3">Featured</span>
                          <h2 className="text-xl md:text-2xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                            {featured.title}
                          </h2>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                            {featured.excerpt || featured.content.slice(0, 150)}
                          </p>
                          {featured.published_at && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(featured.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </div>
                          )}
                          <Button variant="outline" size="sm" className="w-fit gap-2">
                            Read Story <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </div>
              </section>
            )}

            {/* Posts Grid */}
            {rest.length > 0 && (
              <section className="py-10">
                <div className="container mx-auto px-4">
                  <div className="max-w-7xl mx-auto">
                    <div className="flex items-baseline justify-between mb-6">
                      <h2 className="text-xl md:text-2xl font-bold">
                        {selectedCategory === "All" ? "Latest Stories" : selectedCategory}
                      </h2>
                      <span className="text-sm text-muted-foreground">{filtered.length} posts</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {rest.map((post) => (
                        <Link key={post.id} to={`/blog/${post.slug}`}>
                          <Card className="overflow-hidden h-full flex flex-col group hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                            <div className="relative aspect-[16/10] overflow-hidden">
                              <img
                                src={post.featured_image || defaultImage}
                                alt={post.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                              />
                              {post.category && (
                                <Badge className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm text-foreground text-xs">
                                  {post.category}
                                </Badge>
                              )}
                            </div>
                            <div className="p-5 flex flex-col flex-grow">
                              <h3 className="text-base font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                {post.title}
                              </h3>
                              <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-grow">
                                {post.excerpt || post.content.slice(0, 120)}
                              </p>
                              {post.published_at && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-3 border-t">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </div>
                              )}
                            </div>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}
          </>
        )}

        {/* CTA */}
        <section className="py-14 bg-gradient-to-br from-foreground to-foreground/90 text-background">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-4">Share Your Testimony</h2>
            <p className="text-background/70 mb-6 max-w-xl mx-auto">
              Has God done something amazing in your life? We'd love to hear and share your story.
            </p>
            <a href="https://wa.me/254115475543?text=I%20want%20to%20share%20my%20testimony" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="secondary" className="gap-2">
                Share Your Story <ArrowRight className="w-4 h-4" />
              </Button>
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
