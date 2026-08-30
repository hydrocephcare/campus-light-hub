import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircleHeart, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const encouragingPrompts = [
  { category: "Exams", message: "Struggling with upcoming exams? Let us pray for your focus and peace." },
  { category: "Personal Life", message: "Going through a tough season? You're not alone in this journey." },
  { category: "Career", message: "Seeking direction for your career? God has great plans for you." },
  { category: "Relationships", message: "Need healing in relationships? We'll lift you up in prayer." },
  { category: "Health", message: "Facing health challenges? Let faith be your strength." },
  { category: "Family", message: "Family matters weighing on you? Share your burden with us." },
  { category: "Finances", message: "Financial stress? God provides in unexpected ways." },
  { category: "Purpose", message: "Searching for purpose? Let's seek God's will together." },
  { category: "Anxiety", message: "Feeling anxious or overwhelmed? Cast your cares upon Him." },
  { category: "Gratitude", message: "Want to share a praise report? We'd love to celebrate with you!" },
];

export const PrayerRequestForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    request: "",
    isAnonymous: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState(encouragingPrompts[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * encouragingPrompts.length);
      setCurrentPrompt(encouragingPrompts[randomIndex]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.request.trim()) {
      toast.error("Please share your prayer request");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('prayer_requests')
        .insert({
          name: formData.isAnonymous ? null : formData.name || null,
          email: formData.isAnonymous ? null : formData.email || null,
          request: formData.request,
          is_anonymous: formData.isAnonymous,
        });

      if (error) throw error;

      toast.success("Prayer request submitted!", {
        description: "Our prayer team will lift you up in prayer. You're not alone.",
      });
      
      setFormData({ name: "", email: "", request: "", isAnonymous: false });
    } catch (error) {
      console.error('Error submitting prayer request:', error);
      toast.error("Failed to submit prayer request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-12 md:py-16 bg-gradient-to-br from-primary/5 via-background to-secondary/10">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
              <MessageCircleHeart className="w-5 h-5" />
              <span className="text-sm md:text-base font-semibold">Prayer Request</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4 text-foreground">
              We're Here to Pray With You
            </h2>
            <p className="text-base md:text-lg text-muted-foreground">
              Share your prayer needs and let our community stand with you in faith
            </p>
          </div>

          {/* Encouraging Prompt Carousel */}
          <Card className="p-4 mb-6 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 transition-all duration-500">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-full">
                <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              </div>
              <div className="flex-1">
                <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                  {currentPrompt.category}
                </span>
                <p className="text-sm md:text-base text-foreground font-medium">
                  {currentPrompt.message}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 md:p-8 border-border bg-card shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2 text-foreground">
                    Your Name {formData.isAnonymous && "(Optional)"}
                  </label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={formData.isAnonymous}
                    className="bg-background border-border"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2 text-foreground">
                    Email {formData.isAnonymous && "(Optional)"}
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={formData.isAnonymous}
                    className="bg-background border-border"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="request" className="block text-sm font-medium mb-2 text-foreground">
                  Prayer Request *
                </label>
                <Textarea
                  id="request"
                  placeholder="Share what's on your heart..."
                  value={formData.request}
                  onChange={(e) => setFormData({ ...formData, request: e.target.value })}
                  required
                  rows={6}
                  className="bg-background border-border resize-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={formData.isAnonymous}
                  onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                  className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                />
                <label htmlFor="anonymous" className="text-sm text-muted-foreground">
                  Submit anonymously
                </label>
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? "Submitting..." : "Submit Prayer Request"}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Your request will be kept confidential and prayed over by our prayer team
              </p>
            </form>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-sm md:text-base text-muted-foreground mb-4 italic">
              "The prayer of a righteous person is powerful and effective."
            </p>
            <p className="text-xs md:text-sm text-primary font-semibold">— James 5:16</p>
          </div>
        </div>
      </div>
    </section>
  );
};
