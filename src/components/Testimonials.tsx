import { Card } from "@/components/ui/card";
import { Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Wanjiru",
    role: "Business Student, 3rd Year",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
    testimony: "Joining MKU CU transformed my university experience. I found a family that prays together, grows together, and supports each other in faith and academics.",
    year: "2024"
  },
  {
    name: "David Kamau",
    role: "Engineering Student, 4th Year",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    testimony: "Through MKU CU, I discovered my calling in ministry. The foundation classes and mentorship programs equipped me to serve God with confidence and purpose.",
    year: "2024"
  },
  {
    name: "Grace Akinyi",
    role: "Medical Student, 2nd Year",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80",
    testimony: "The worship services here are life-changing! I've experienced God's presence in powerful ways and made friendships that will last a lifetime.",
    year: "2025"
  }
];

export const Testimonials = () => {
  return (
    <section className="py-12 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-crimson/10 text-crimson px-4 py-2 rounded-full mb-4">
            <Quote className="w-5 h-5" />
            <span className="text-sm md:text-base font-semibold">Student Testimonies</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4">
            Lives Transformed by Christ
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Hear from students whose lives have been changed through MKU CU
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index} 
              className="p-6 md:p-8 hover:shadow-xl transition-all duration-300 group"
            >
              <div className="flex items-start gap-4 mb-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover ring-4 ring-gold/20 group-hover:ring-gold/40 transition-all"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-lg md:text-xl text-navy">{testimonial.name}</h3>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  <p className="text-xs text-gold font-semibold mt-1">Member since {testimonial.year}</p>
                </div>
              </div>
              
              <div className="relative">
                <Quote className="absolute -top-2 -left-2 w-8 h-8 text-gold/20" />
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed pl-6">
                  {testimonial.testimony}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
