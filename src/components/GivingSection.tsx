import { Heart, CreditCard, Info, BookOpen, Church, HandHeart, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/SectionHeading";
import { useSiteSetting } from "@/hooks/useSiteSettings";
import titheImage from "@/assets/tithe-giving.jpg";

const defaultGiving = { till_number: "6960137", till_name: "BRIAN MUTUKU NDETO", scripture: "Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver.", scripture_ref: "2 Corinthians 9:7" };

export const GivingSection = () => {
  const { data: giving } = useSiteSetting("giving_info", defaultGiving);

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <SectionHeading eyebrow="Tithes & offerings" title="Give cheerfully" description="Your generous contributions help us spread the Gospel, support our community, and continue God's work at MKU Christian Union." />
          <figure className="relative mb-12 overflow-hidden rounded-3xl border border-secondary/30 bg-gradient-to-br from-secondary/15 via-card to-card p-8 md:p-12">
            <BookOpen className="mb-4 h-8 w-8 text-primary" />
            <blockquote className="max-w-4xl font-serif text-xl italic leading-relaxed text-foreground md:text-3xl">“{giving.scripture}”</blockquote>
            <figcaption className="mt-4 text-sm font-semibold uppercase tracking-widest text-primary">{giving.scripture_ref}</figcaption>
          </figure>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-4">
              <Card className="p-5 border-border hover:shadow-lg transition-shadow bg-card">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0"><Church className="w-6 h-6 text-primary" /></div>
                  <div><h3 className="font-bold text-lg mb-2 text-foreground">Ministry & Outreach</h3><p className="text-muted-foreground text-sm leading-relaxed">Support campus evangelism, discipleship programs, and community missions that transform lives for Christ.</p></div>
                </div>
              </Card>
              <Card className="p-5 border-border hover:shadow-lg transition-shadow bg-card">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0"><BookOpen className="w-6 h-6 text-primary" /></div>
                  <div><h3 className="font-bold text-lg mb-2 text-foreground">Bible Teaching</h3><p className="text-muted-foreground text-sm leading-relaxed">Enable quality biblical education, resources, and training that equip believers to grow in their faith.</p></div>
                </div>
              </Card>
              <Card className="p-5 border-border hover:shadow-lg transition-shadow bg-card">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center flex-shrink-0"><HandHeart className="w-6 h-6 text-green-600" /></div>
                  <div><h3 className="font-bold text-lg mb-2 text-foreground">Student Support</h3><p className="text-muted-foreground text-sm leading-relaxed">Help students in need, provide resources, and create a welcoming environment for spiritual growth.</p></div>
                </div>
              </Card>
              <Card className="overflow-hidden shadow-lg border-border"><img src={titheImage} alt="Church Giving" className="w-full h-48 md:h-56 object-cover" /></Card>
            </div>

            <div>
              <Card className="rounded-3xl p-6 md:p-8 border-secondary/30 bg-gradient-to-br from-primary/25 to-card">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0"><CreditCard className="w-7 h-7 text-white" /></div>
                  <div><h3 className="text-xl md:text-2xl font-bold text-foreground mb-1">Pay via M-Pesa Till</h3><p className="text-muted-foreground text-sm">Quick, secure, and convenient giving</p></div>
                </div>
                <div className="bg-card rounded-xl p-5 border-2 border-green-200 dark:border-green-800 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground font-medium">Till Number:</span>
                    <span className="font-serif text-3xl md:text-5xl font-semibold text-primary">{giving.till_number}</span>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">{giving.till_name}</p>
                </div>
                <div className="space-y-4">
                  <h5 className="font-semibold text-foreground flex items-center gap-2"><Info className="w-4 h-4" />How to Pay:</h5>
                  <ol className="space-y-3 text-sm text-muted-foreground">
                    {["Go to M-Pesa on your phone", "Select Lipa na M-Pesa", "Choose Buy Goods and Services", `Enter Till Number: ${giving.till_number}`, "Enter the amount you wish to give", "Enter your M-Pesa PIN to complete"].map((step, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="font-bold text-primary flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">{i + 1}</span>
                        <span dangerouslySetInnerHTML={{ __html: step.replace(/M-Pesa|Lipa na M-Pesa|Buy Goods and Services|amount|M-Pesa PIN/g, '<strong class="text-foreground">$&</strong>').replace(/\d{7}/, `<strong class="text-green-600">$&</strong>`) }} />
                      </li>
                    ))}
                  </ol>
                </div>
                <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-xs text-muted-foreground"><strong className="text-foreground">Note:</strong> After payment, you'll receive an M-Pesa confirmation message. Please save it for your records.</p>
                </div>
              </Card>
              <div className="text-center mt-8">
                <Sparkles className="w-6 h-6 text-primary mx-auto mb-3" />
                <h4 className="text-lg font-bold text-foreground mb-2">Every Gift Makes a Difference</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">Whether you give your tithes, offerings, or special contributions, your generosity is making an eternal impact.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
