import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const REVEAL_SELECTOR = "main section, main article, main [data-scroll-reveal]";

export const ScrollRevealManager = () => {
  const location = useLocation();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    const styleId = "mkucu-scroll-reveal-styles";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        .mkucu-reveal {
          opacity: 0;
          transform: translate3d(0, 20px, 0);
          transition: opacity 520ms cubic-bezier(.2,.7,.2,1), transform 520ms cubic-bezier(.2,.7,.2,1);
          will-change: opacity, transform;
        }
        .mkucu-reveal.mkucu-reveal-visible {
          opacity: 1;
          transform: translate3d(0, 0, 0);
        }
        @media (max-width: 767px) {
          .mkucu-reveal { transform: translate3d(0, 12px, 0); transition-duration: 420ms; }
        }
      `;
      document.head.appendChild(style);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("mkucu-reveal-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -5% 0px" }
    );

    const register = () => {
      document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR).forEach((element) => {
        if (element.dataset.revealRegistered === "true") return;
        element.dataset.revealRegistered = "true";
        element.classList.add("mkucu-reveal");
        observer.observe(element);
      });
    };

    const frame = window.requestAnimationFrame(register);
    const mutationObserver = new MutationObserver(register);
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.cancelAnimationFrame(frame);
      mutationObserver.disconnect();
      observer.disconnect();
    };
  }, [location.pathname]);

  return null;
};
