import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CommentsSection } from "@/components/CommentsSection";
import { Calendar, Clock, Facebook, Twitter, Link2, ArrowRight, Loader2, ChevronLeft, Share2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useSEO } from "@/hooks/useSEO";

interface BlogPost {
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

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();

      if (error) throw error;
      setPost(data);

      if (data) {
        const { data: related } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('is_published', true)
          .neq('slug', slug)
          .limit(3);
        
        setRelatedPosts(related || []);
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      toast.error('Failed to load blog post');
    } finally {
      setLoading(false);
    }
  };

  // Dynamic SEO meta tags for sharing
  useSEO({
    title: post?.title || "Faith Story",
    description: post?.excerpt || post?.content?.slice(0, 160) || "Read inspiring faith stories from MKU Christian Union",
    image: post?.featured_image || "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=1200&q=80",
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    type: "article",
  });

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied!");
  };

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  const shareOnTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post?.title || '')}`,
      '_blank'
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="flex flex-col items-center justify-center py-32">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-sm text-muted-foreground">Loading story...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-24 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <ChevronLeft className="w-10 h-10 text-muted-foreground" />
            </div>
            <h1 className="text-3xl font-serif font-bold mb-4 text-foreground">Story Not Found</h1>
            <p className="text-muted-foreground mb-8">We couldn't find the story you're looking for.</p>
            <Link to="/blog">
              <Button>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Stories
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      
      <main>
        {/* Hero Image Section */}
        {post.featured_image && (
          <section className="relative h-[40vh] md:h-[50vh] bg-gradient-to-b from-slate-900 to-slate-800">
            <div className="absolute inset-0">
              <img 
                src={post.featured_image} 
                alt={post.title}
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 pb-8 md:pb-12">
              <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                  <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white mb-6 transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                    Back to Stories
                  </Link>
                  
                  {post.category && (
                    <Badge className="bg-primary text-primary-foreground border-0 mb-4">
                      {post.category}
                    </Badge>
                  )}
                  
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white leading-tight mb-4">
                    {post.title}
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
                    {post.published_at && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(post.published_at), 'MMMM d, yyyy')}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{Math.ceil(post.content.length / 1500)} min read</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Article Content */}
        <article className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              {/* Title for posts without featured image */}
              {!post.featured_image && (
                <>
                  <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                    Back to Stories
                  </Link>

                  <div className="flex flex-wrap items-center gap-3 mb-6">
                    {post.category && (
                      <Badge className="bg-primary/10 text-primary border-0">
                        {post.category}
                      </Badge>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {post.published_at && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{format(new Date(post.published_at), 'MMM d, yyyy')}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{Math.ceil(post.content.length / 1500)} min read</span>
                      </div>
                    </div>
                  </div>

                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-6 text-foreground leading-tight">
                    {post.title}
                  </h1>
                </>
              )}

              {/* Excerpt */}
              {post.excerpt && (
                <div className="bg-muted/50 border-l-4 border-primary p-6 rounded-r-lg mb-10">
                  <p className="text-lg text-foreground/90 leading-relaxed italic">
                    {post.excerpt}
                  </p>
                </div>
              )}

              {/* Share Buttons */}
              <div className="mb-10">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                    <Share2 className="w-4 h-4" />
                    Share this story:
                  </span>
                  <Button 
                    size="sm"
                    variant="outline" 
                    className="gap-2"
                    onClick={shareOnFacebook}
                  >
                    <Facebook className="w-4 h-4" />
                    <span className="hidden sm:inline">Facebook</span>
                  </Button>
                  <Button 
                    size="sm"
                    variant="outline" 
                    className="gap-2"
                    onClick={shareOnTwitter}
                  >
                    <Twitter className="w-4 h-4" />
                    <span className="hidden sm:inline">Twitter</span>
                  </Button>
                  <Button 
                    size="sm"
                    variant="outline" 
                    className="gap-2"
                    onClick={copyLink}
                  >
                    <Link2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Copy Link</span>
                  </Button>
                </div>
              </div>

              {/* Article Content with enhanced typography */}
              <div 
                className="prose prose-lg max-w-none
                  prose-headings:font-serif prose-headings:font-bold prose-headings:text-foreground
                  prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-border
                  prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                  prose-p:text-foreground/90 prose-p:leading-relaxed prose-p:mb-6 prose-p:text-base
                  prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-6 
                  prose-blockquote:italic prose-blockquote:my-8 prose-blockquote:text-muted-foreground
                  prose-blockquote:bg-muted/30 prose-blockquote:py-4 prose-blockquote:rounded-r-lg
                  prose-ul:my-6 prose-ul:space-y-2
                  prose-ol:my-6 prose-ol:space-y-2
                  prose-li:text-foreground/90 prose-li:text-base
                  prose-strong:text-foreground prose-strong:font-semibold
                  prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline
                  prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8
                  prose-hr:my-12 prose-hr:border-border"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-12 pt-8 border-t">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
                    Related Topics
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Badge 
                        key={tag} 
                        variant="secondary" 
                        className="text-sm px-4 py-1.5 hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Share Again at Bottom */}
              <div className="mt-12 pt-8 border-t">
                <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-2xl p-8 text-center">
                  <h3 className="text-xl font-serif font-bold mb-3 text-foreground">
                    Enjoyed this story?
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Share it with your friends and family
                  </p>
                  <div className="flex items-center justify-center gap-3 flex-wrap">
                    <Button 
                      variant="default"
                      className="gap-2"
                      onClick={shareOnFacebook}
                    >
                      <Facebook className="w-4 h-4" />
                      Share on Facebook
                    </Button>
                    <Button 
                      variant="outline"
                      className="gap-2"
                      onClick={shareOnTwitter}
                    >
                      <Twitter className="w-4 h-4" />
                      Share on Twitter
                    </Button>
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              <div className="mt-16">
                <CommentsSection postSlug={post.slug} />
              </div>
            </div>
          </div>
        </article>

        {/* Related Articles - Enhanced */}
        {relatedPosts.length > 0 && (
          <section className="py-16 bg-gradient-to-b from-muted/30 to-background">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-serif font-bold mb-3 text-foreground">
                    Continue Reading
                  </h2>
                  <p className="text-muted-foreground">
                    More inspiring stories from MKU Christian Union
                  </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6">
                  {relatedPosts.map((relatedPost) => (
                    <Link key={relatedPost.id} to={`/blog/${relatedPost.slug}`}>
                      <Card className="overflow-hidden group hover:shadow-xl transition-all duration-500 h-full flex flex-col border-2 hover:border-primary/50">
                        <div className="aspect-[16/10] overflow-hidden relative">
                          <img
                            src={relatedPost.featured_image || 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=600&q=80'}
                            alt={relatedPost.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                        <div className="p-5 flex flex-col flex-grow">
                          {relatedPost.category && (
                            <Badge className="bg-primary/10 text-primary border-0 text-xs mb-3 w-fit">
                              {relatedPost.category}
                            </Badge>
                          )}
                          <h3 className="text-lg font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2 text-foreground">
                            {relatedPost.title}
                          </h3>
                          {relatedPost.excerpt && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                              {relatedPost.excerpt}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-auto pt-4 border-t">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{Math.ceil((relatedPost.content?.length || 0) / 1500)} min read</span>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>

                <div className="text-center mt-10">
                  <Link to="/blog">
                    <Button size="lg" variant="outline" className="gap-2">
                      View All Stories 
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
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
