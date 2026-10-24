import { useRef, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScrollRowProps {
  children: ReactNode;
  className?: string;
}

/**
 * Swipeable horizontal row with snap points and arrow buttons.
 * Children should set their own width (e.g. `w-[80%] sm:w-[22rem] shrink-0 snap-start`).
 */
export const ScrollRow = ({ children, className }: ScrollRowProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(el.clientWidth * 0.8, 280), behavior: "smooth" });
  };

  return (
    <div className="group/row relative">
      <div
        ref={ref}
        className={cn(
          "-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:gap-5",
          className
        )}
      >
        {children}
      </div>
      <button
        type="button"
        onClick={() => scroll(-1)}
        aria-label="Scroll left"
        className="absolute -left-3 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-background/90 text-foreground shadow-xl backdrop-blur transition hover:bg-secondary hover:text-secondary-foreground md:flex"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => scroll(1)}
        aria-label="Scroll right"
        className="absolute -right-3 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-background/90 text-foreground shadow-xl backdrop-blur transition hover:bg-secondary hover:text-secondary-foreground md:flex"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
};
