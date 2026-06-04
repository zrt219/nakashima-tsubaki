import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        command: {
          black: "#030508",
          graphite: "#080e16",
          panel: "#0a1420",
          panel2: "#0d1a28",
          line: "#1e2f42",
          "line-bright": "#2d4560",
          text: "#e8f4ff",
          muted: "#7a9bb8",
          steel: "#4d6a85",
          cyan: "#00d4ff",
          "cyan-dim": "#0099bb",
          amber: "#ffb84d",
          "amber-dim": "#cc8800",
          violet: "#9b6dff",
          emerald: "#00e5a0",
          rose: "#ff4d7a"
        }
      },
      boxShadow: {
        command: "0 32px 100px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(0, 212, 255, 0.04)",
        "glow-sm": "0 0 12px rgba(0, 212, 255, 0.2), 0 0 24px rgba(0, 212, 255, 0.08)",
        glow: "0 0 24px rgba(0, 212, 255, 0.28), 0 0 60px rgba(0, 212, 255, 0.1)",
        "glow-lg": "0 0 40px rgba(0, 212, 255, 0.35), 0 0 100px rgba(0, 212, 255, 0.15)",
        "glow-amber": "0 0 24px rgba(255, 184, 77, 0.28), 0 0 60px rgba(255, 184, 77, 0.1)",
        "glow-violet": "0 0 24px rgba(155, 109, 255, 0.3), 0 0 60px rgba(155, 109, 255, 0.12)",
        "glow-emerald": "0 0 24px rgba(0, 229, 160, 0.28), 0 0 60px rgba(0, 229, 160, 0.1)",
        panel: "0 8px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.04)",
        "panel-active": "0 8px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(0, 212, 255, 0.12), 0 0 0 1px rgba(0, 212, 255, 0.15)"
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "SFMono-Regular", "Consolas", "Liberation Mono", "monospace"]
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 8s linear infinite",
        "ping-slow": "ping 3s cubic-bezier(0, 0, 0.2, 1) infinite",
        "scan-down": "scan 10s linear infinite",
        "aurora": "aurora 15s ease-in-out infinite",
        "drift": "drift 20s ease-in-out infinite",
        "flicker": "flicker 8s ease-in-out infinite",
        "slide-up": "slideUp 0.4s ease-out",
        "fade-in": "fadeIn 0.6s ease-out",
        "glow-pulse": "glowPulse 3s ease-in-out infinite"
      },
      keyframes: {
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(200%)" }
        },
        aurora: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" }
        },
        drift: {
          "0%, 100%": { transform: "translateX(0) translateY(0)" },
          "33%": { transform: "translateX(20px) translateY(-10px)" },
          "66%": { transform: "translateX(-15px) translateY(15px)" }
        },
        flicker: {
          "0%, 100%": { opacity: "1" },
          "92%": { opacity: "1" },
          "93%": { opacity: "0.85" },
          "94%": { opacity: "1" },
          "96%": { opacity: "0.9" },
          "97%": { opacity: "1" }
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 8px rgba(0, 212, 255, 0.15)" },
          "50%": { boxShadow: "0 0 24px rgba(0, 212, 255, 0.45), 0 0 48px rgba(0, 212, 255, 0.2)" }
        }
      },
      backgroundImage: {
        "cyber-grid": "linear-gradient(rgba(0, 212, 255, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 212, 255, 0.04) 1px, transparent 1px)",
        "cyber-grid-fine": "linear-gradient(rgba(0, 212, 255, 0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 212, 255, 0.025) 1px, transparent 1px)",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))"
      }
    }
  },
  plugins: [forms]
};

export default config;
