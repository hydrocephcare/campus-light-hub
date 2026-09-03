import { COMMUNITY_LINK } from "@/lib/communityLink";
import { Header } from "@/components/Header";
import { usePageHero } from "@/hooks/usePageContent";

import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { 
  Heart, MapPin, Clock, Users, BookOpen, 
  MessageCircle, Calendar, Gift, ArrowRight, Send, Phone, Mail, User
} from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

const welcomeSteps = [
  {
    icon: Heart,
    title: "We're Glad You're Here",
    description: "Whether you're exploring faith or looking for a church family, you're welcome here."
  },
  {
    icon: Users,
    title: "Meet Our Community",
    description: "Experience genuine fellowship with students who share your journey and support your growth."
  },
  {
    icon: BookOpen,
    title: "Grow in Faith",
    description: "Join Bible studies, discipleship programs, and meaningful worship experiences."
  },
  {
    icon: Gift,
    title: "Discover Your Purpose",
    description: "Find your gifts and use them to serve others through our various ministries."
  }
];

const serviceInfo = [
  {
    title: "Sunday Service",
    time: "Starting at 9:00 AM",
    location: "Auditorium",
    description: "Our main weekly gathering for worship, Word, and fellowship"
  },
  {
    title: "Morning Devotions",
    time: "5:00 AM - 6:00 AM",
    location: "MLT Hall B",
    description: "Start your day with prayer and devotion (Mon-Fri)"
  },
  {
    title: "Lunch Hour Service",
    time: "12:30 PM - 1:30 PM",
    location: "PEFA Church / MLT Block",
    description: "Midday fellowship and teaching (Mon-Fri)"
  },
  {
    title: "Bible Study",
    time: "Various times",
    location: "NC-002 / MLT Building",
    description: "Deep dive into Scripture throughout the week"
  }
];

const faqs = [
  {
    question: "What should I wear?",
    answer: "Come as you are! We welcome everyone regardless of attire. Most students dress casually."
  },
  {
    question: "Where do I park/sit?",
    answer: "Arrive a few minutes early and our ushers will help guide you to a seat. Feel free to sit anywhere!"
  },
  {
    question: "What about my kids?",
    answer: "Children are welcome in our services. We create a family-friendly environment."
  },
  {
    question: "I'm not a Christian, can I still come?",
    answer: "Absolutely! We welcome everyone regardless of their faith background. Come explore and ask questions."
  }
];

const Visitors = () => {
  useSEO({
    title: "New Here? Welcome to MKU CU",
    description: "Plan your visit to MKU Christian Union. Learn what to expect, service times, and register as a first-time visitor.",
    image: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=1200&q=80",
    url: "https://mkucuu.lovable.app/visitors",
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Thank you for registering! We'll be in touch soon.");
    setFormData({ name: "", email: "", phone: "", message: "" });
  };

  const hero = usePageHero("visitors", {
    title: "New Here? Welcome!",
    subtitle: "MKU Christian Union is a vibrant community of believers passionate about knowing Christ and making Him known on campus and beyond.",
    image: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=1920&q=75",
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={hero.image}
            alt="Welcoming community"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-black/60 to-black/40" />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-6">
            {hero.title}
          </h1>
          <p className="text-lg md:text-xl text-white/85 max-w-2xl mx-auto mb-8">
            {hero.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#guest-form">
              <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold">
                Let Us Know You're Coming
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </a>
            <a href="#services">
              <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10">
                View Service Times
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Welcome Steps */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-center text-foreground mb-12">
            What to Expect
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {welcomeSteps.map((step, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow bg-card border-t-4 border-t-primary">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-card-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Service Times */}
      <section id="services" className="py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-primary font-semibold text-sm uppercase tracking-widest">Join Us</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mt-2 mb-4">
              When We Meet
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Multiple opportunities throughout the week to gather, worship, and grow together.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {serviceInfo.map((service, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow bg-card border-l-4 border-l-primary">
                <h3 className="text-xl font-bold text-card-foreground mb-3">{service.title}</h3>
                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>{service.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>{service.location}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{service.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
              Common Questions
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {faqs.map((faq, index) => (
              <Card key={index} className="p-6 bg-card">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-4 h-4 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-card-foreground mb-2">{faq.question}</h3>
                    <p className="text-sm text-muted-foreground">{faq.answer}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Guest Form - Mobile optimized */}
      <section id="guest-form" className="py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-8">
              <span className="text-primary font-semibold text-sm uppercase tracking-widest">Connect With Us</span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mt-2 mb-4">
                Plan Your Visit
              </h2>
              <p className="text-muted-foreground">
                Let us know you're coming and we'll make sure someone welcomes you!
              </p>
            </div>
            <Card className="p-5 md:p-8 bg-card">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-card-foreground">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-card-foreground">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@example.com"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-card-foreground">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+254 700 000000"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-card-foreground">
                    Prayer Requests or Questions
                  </label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="How can we pray for you?"
                    rows={3}
                  />
                </div>
                <Button type="submit" size="lg" className="w-full gap-2">
                  <Send className="w-4 h-4" />
                  Submit Registration
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA - No blue, use warm gradient */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-foreground to-foreground/90 text-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-serif font-bold mb-4">
            Have More Questions?
          </h2>
          <p className="mb-6 opacity-80 max-w-xl mx-auto">
            We'd love to hear from you! Reach out to us via WhatsApp or email.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={COMMUNITY_LINK} target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="secondary" className="font-semibold">
                Chat on WhatsApp
              </Button>
            </a>
            <a href="mailto:mkucuthika@gmail.com">
              <Button size="lg" variant="outline" className="border-background/30 text-background hover:bg-background/10">
                Send Email
              </Button>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Visitors;