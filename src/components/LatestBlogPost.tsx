import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Quote, ArrowRight, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image: string | null;
  published_at: string | null;
}

export const LatestBlogPost = () => {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestPost();
  }, []);

  const fetchLatestPost = async () => {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("id, title, slug, excerpt, content, featured_image, published_at")
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      setPost(data);
    }
    setLoading(false);
  };

  // Strip HTML tags for preview
  const stripHtml = (html: string) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  if (loading) {
    return (
      <section className="py-12 md:py-20 bg-gradient-to-br from-muted/50 to-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </section>
    );
  }

  if (!post) {
    return null;
  }

  const excerptText = post.excerpt || stripHtml(post.content).substring(0, 250) + "...";

  return (
    <section className="py-12 md:py-20 bg-gradient-to-br from-muted/50 to-muted">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
              <Quote className="w-5 h-5" />
              <span className="text-sm md:text-base font-semibold">Latest from Blog</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4">
              Featured Story
            </h2>
            <p className="text-base md:text-xl text-muted-foreground">
              Inspiring stories and insights from our community
            </p>
          </div>

          {/* Featured Post */}
          <Card className="overflow-hidden hover:shadow-xl transition-shadow border-border">
            <div className="grid md:grid-cols-2 gap-0">
              {/* Image Section */}
              <div className="aspect-[4/3] md:aspect-auto order-1 md:order-1">
                <div className="relative h-full min-h-[250px] md:min-h-[400px]">
                  <img
                    src={post.featured_image || "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=800&q=80"}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 text-white">
                    <Quote className="w-10 h-10 md:w-12 md:h-12 text-primary drop-shadow-lg" />
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6 md:p-8 lg:p-10 order-2 md:order-2 bg-card">
                <div className="mb-4 md:mb-6">
                  <h3 className="text-xl md:text-2xl lg:text-3xl font-serif font-bold mb-2 md:mb-3 text-card-foreground">
                    {post.title}
                  </h3>
                  {post.published_at && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(post.published_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <p className="text-sm md:text-base lg:text-lg leading-relaxed text-muted-foreground line-clamp-6">
                    {excerptText}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to={`/blog/${post.slug}`} className="w-full sm:w-auto">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto">
                      Read Full Story
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <Link to="/blog" className="w-full sm:w-auto">
                    <Button variant="outline" className="w-full sm:w-auto border-border hover:bg-secondary">
                      View All Posts
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};