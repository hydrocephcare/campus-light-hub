import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Pencil, Trash2, Eye, Plus, FileText, WandSparkles } from "lucide-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { marked } from "marked";
import { ImageUpload } from "./ImageUpload";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image: string | null;
  is_published: boolean | null;
  published_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export const BlogPostsManager = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [markdownDraft, setMarkdownDraft] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    featured_image: "",
    is_published: true,
  });

  const quillModules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline'],
      ['blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ],
  }), []);

  const quillFormats = [
    'header', 'bold', 'italic', 'underline',
    'blockquote', 'list', 'bullet', 'link', 'image'
  ];

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("id, title, slug, excerpt, content, featured_image, is_published, published_at, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch posts");
      return;
    }

    setPosts(data || []);
  };

  const convertMarkdownDraft = () => {
    if (!markdownDraft.trim()) {
      toast.error("Paste some text first");
      return;
    }
    let html = marked.parse(markdownDraft, { async: false, breaks: true }) as string;
    // Quill's HTML importer mis-parses lists/blockquotes when there is
    // insignificant whitespace between block tags (e.g. "<ul>\n<li>"),
    // dropping the <ul>/<li>/<blockquote> structure entirely. Collapse it.
    html = html.replace(/>\s+</g, "><").trim();
    setFormData((prev) => ({
      ...prev,
      content: prev.content ? prev.content + html : html,
    }));
    setMarkdownDraft("");
    toast.success("Formatted and added to the post");
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const slug = formData.slug || generateSlug(formData.title);
      const dataToSubmit = {
        title: formData.title,
        slug,
        excerpt: formData.excerpt || null,
        content: formData.content,
        featured_image: formData.featured_image || null,
        is_published: formData.is_published,
        published_at: formData.is_published ? new Date().toISOString() : null,
      };

      if (editingId) {
        const { error } = await supabase
          .from("blog_posts")
          .update(dataToSubmit)
          .eq("id", editingId);

        if (error) throw error;
        toast.success("Post updated");
      } else {
        const { error } = await supabase
          .from("blog_posts")
          .insert([dataToSubmit]);

        if (error) throw error;
        toast.success("Post created");
      }

      resetForm();
      fetchPosts();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingId(post.id);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      content: post.content,
      featured_image: post.featured_image || "",
      is_published: post.is_published ?? true,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post?")) return;

    const { error } = await supabase
      .from("blog_posts")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete");
      return;
    }

    toast.success("Post deleted");
    fetchPosts();
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      featured_image: "",
      is_published: true,
    });
  };

  return (
    <div className="space-y-4">
      {/* Form */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            {editingId ? <Pencil className="h-4 w-4 text-primary" /> : <Plus className="h-4 w-4 text-primary" />}
            <div>
              <CardTitle className="text-base">{editingId ? "Edit" : "New"} Blog Post</CardTitle>
              <CardDescription className="text-xs">Write and publish articles</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-xs">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Post title..."
                  required
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug" className="text-xs">URL Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="auto-generated"
                  className="h-9 text-sm"
                />
              </div>
            </div>

            <ImageUpload
              label="Featured Image"
              value={formData.featured_image}
              onChange={(url) => setFormData({ ...formData, featured_image: url })}
              folder="blog"
            />

            <div className="space-y-2">
              <Label htmlFor="excerpt" className="text-xs">Excerpt</Label>
              <Input
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Brief summary..."
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-2 rounded-lg border border-dashed border-primary/40 bg-primary/5 p-3">
              <Label htmlFor="markdown-draft" className="text-xs flex items-center gap-1.5">
                <WandSparkles className="h-3.5 w-3.5" />
                Paste from AI (Markdown)
              </Label>
              <p className="text-[11px] text-muted-foreground -mt-1">
                Paste text copied straight from ChatGPT/Claude here (with ## headings, **bold**, - bullets, etc).
                Click "Format &amp; insert" to turn it into a properly structured post below — plain pasting into
                the editor directly does not preserve headings or lists.
              </p>
              <Textarea
                id="markdown-draft"
                value={markdownDraft}
                onChange={(e) => setMarkdownDraft(e.target.value)}
                placeholder={"## A heading\n\nSome text...\n\n- point one\n- point two"}
                className="min-h-[120px] text-sm font-mono"
              />
              <Button type="button" size="sm" variant="secondary" onClick={convertMarkdownDraft}>
                Format &amp; insert into post
              </Button>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Content *</Label>
              <div className="border rounded-lg overflow-hidden bg-background">
                <ReactQuill
                  theme="snow"
                  value={formData.content}
                  onChange={(value) => setFormData({ ...formData, content: value })}
                  modules={quillModules}
                  formats={quillFormats}
                  placeholder="Write your post..."
                  className="[&_.ql-container]:min-h-[360px] [&_.ql-editor]:min-h-[360px] [&_.ql-editor]:text-base [&_.ql-editor]:leading-7 text-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <Switch
                id="is_published"
                checked={formData.is_published}
                onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
              />
              <Label htmlFor="is_published" className="cursor-pointer text-xs">
                {formData.is_published ? "Published" : "Draft"}
              </Label>
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={loading} size="sm">
                {loading ? "Saving..." : editingId ? "Update" : "Publish"}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={resetForm} size="sm">
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Posts List */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Posts ({posts.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          {posts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No posts yet</p>
          ) : (
            <div className="space-y-2">
              {posts.map((post) => (
                <div key={post.id} className="flex items-start gap-3 border-b border-border p-3 last:border-0">
                  {post.featured_image && (
                    <img
                      src={post.featured_image}
                      alt=""
                      className="h-16 w-16 flex-shrink-0 rounded bg-white object-contain ring-1 ring-border"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm text-foreground truncate">{post.title}</h4>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        post.is_published 
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}>
                        {post.is_published ? "Live" : "Draft"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{post.slug}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(post)}
                      className="h-8 w-8 p-0"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(post.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
