import { useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { DesignSystem } from "@/hooks/useDesignSystem";
import { ArrowRight, Star, Check } from "lucide-react";

interface LivePreviewProps {
  designSystem: DesignSystem;
}

export function LivePreview({ designSystem }: LivePreviewProps) {
  const { colors, typography, getColorByRole } = designSystem;

  const styles = useMemo(() => {
    const bg = getColorByRole("background");
    const surface = getColorByRole("surface");
    const text = getColorByRole("text");
    const textMuted = getColorByRole("textMuted");
    const primary = getColorByRole("primary");
    const secondary = getColorByRole("secondary");
    const accent = getColorByRole("accent");

    return {
      background: bg?.hex || "#FAFAF9",
      surface: surface?.hex || "#FFFFFF",
      text: text?.hex || "#1A1A2E",
      textMuted: textMuted?.hex || "#6B7280",
      primary: primary?.hex || "#5B4CDB",
      secondary: secondary?.hex || "#F97316",
      accent: accent?.hex || "#14B8A6",
      headingFont: typography.headingFont,
      bodyFont: typography.bodyFont,
      baseSize: typography.baseSize,
      steps: typography.steps,
    };
  }, [colors, typography, getColorByRole]);

  const getSize = (name: string) => {
    const step = styles.steps.find(s => s.name === name);
    return step ? `${step.size}px` : "16px";
  };

  const getLineHeight = (name: string) => {
    const step = styles.steps.find(s => s.name === name);
    return step ? step.lineHeight : 1.5;
  };

  return (
    <div 
      className="h-full overflow-auto"
      style={{ 
        backgroundColor: styles.background,
        color: styles.text,
        fontFamily: styles.bodyFont,
        fontSize: getSize("base"),
      }}
    >
      {/* Header */}
      <header 
        className="sticky top-0 z-10 px-6 py-4 border-b"
        style={{ 
          backgroundColor: styles.surface,
          borderColor: `${styles.text}15`,
        }}
      >
        <div className="flex items-center justify-between">
          <div 
            className="font-semibold"
            style={{ 
              fontFamily: styles.headingFont,
              fontSize: getSize("lg"),
              color: styles.primary,
            }}
          >
            Brand
          </div>
          <nav className="flex items-center gap-6">
            <a 
              href="#" 
              className="hover:opacity-70 transition-opacity"
              style={{ fontSize: getSize("sm") }}
            >
              Features
            </a>
            <a 
              href="#" 
              className="hover:opacity-70 transition-opacity"
              style={{ fontSize: getSize("sm") }}
            >
              Pricing
            </a>
            <button
              className="px-4 py-2 rounded-lg font-medium transition-opacity hover:opacity-90"
              style={{ 
                backgroundColor: styles.primary,
                color: styles.surface,
                fontSize: getSize("sm"),
              }}
            >
              Get Started
            </button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span 
            className="inline-block px-3 py-1 rounded-full text-sm font-medium mb-4"
            style={{ 
              backgroundColor: `${styles.accent}20`,
              color: styles.accent,
            }}
          >
            New Release
          </span>
          <h1 
            className="font-bold mb-4"
            style={{ 
              fontFamily: styles.headingFont,
              fontSize: getSize("4xl"),
              lineHeight: getLineHeight("4xl"),
            }}
          >
            Build something<br />
            <span style={{ color: styles.primary }}>amazing</span> today
          </h1>
          <p 
            className="max-w-lg mx-auto mb-8"
            style={{ 
              color: styles.textMuted,
              fontSize: getSize("lg"),
              lineHeight: getLineHeight("lg"),
            }}
          >
            The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              className="px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-opacity hover:opacity-90"
              style={{ 
                backgroundColor: styles.primary,
                color: styles.surface,
              }}
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              className="px-6 py-3 rounded-lg font-medium transition-colors"
              style={{ 
                border: `1px solid ${styles.text}20`,
                color: styles.text,
              }}
            >
              Learn More
            </button>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section 
        className="px-6 py-12"
        style={{ backgroundColor: `${styles.text}05` }}
      >
        <h2 
          className="font-bold text-center mb-8"
          style={{ 
            fontFamily: styles.headingFont,
            fontSize: getSize("2xl"),
          }}
        >
          Features
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { title: "Fast", desc: "Lightning quick performance", color: styles.primary },
            { title: "Secure", desc: "Enterprise-grade security", color: styles.secondary },
            { title: "Simple", desc: "Easy to get started", color: styles.accent },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-4 rounded-xl"
              style={{ 
                backgroundColor: styles.surface,
                border: `1px solid ${styles.text}10`,
              }}
            >
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                style={{ backgroundColor: `${feature.color}20` }}
              >
                <Star className="w-5 h-5" style={{ color: feature.color }} />
              </div>
              <h3 
                className="font-semibold mb-1"
                style={{ 
                  fontFamily: styles.headingFont,
                  fontSize: getSize("lg"),
                }}
              >
                {feature.title}
              </h3>
              <p 
                style={{ 
                  color: styles.textMuted,
                  fontSize: getSize("sm"),
                }}
              >
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing Card */}
      <section className="px-6 py-12">
        <div 
          className="max-w-sm mx-auto p-6 rounded-2xl"
          style={{ 
            backgroundColor: styles.surface,
            border: `2px solid ${styles.primary}`,
          }}
        >
          <div 
            className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-4"
            style={{ 
              backgroundColor: styles.secondary,
              color: styles.surface,
            }}
          >
            Popular
          </div>
          <h3 
            className="font-bold mb-2"
            style={{ 
              fontFamily: styles.headingFont,
              fontSize: getSize("xl"),
            }}
          >
            Pro Plan
          </h3>
          <div className="flex items-baseline gap-1 mb-4">
            <span 
              className="font-bold"
              style={{ 
                fontFamily: styles.headingFont,
                fontSize: getSize("3xl"),
              }}
            >
              $29
            </span>
            <span style={{ color: styles.textMuted, fontSize: getSize("sm") }}>
              /month
            </span>
          </div>
          <ul className="space-y-2 mb-6">
            {["Unlimited projects", "Priority support", "Advanced analytics"].map(item => (
              <li 
                key={item}
                className="flex items-center gap-2"
                style={{ fontSize: getSize("sm") }}
              >
                <Check className="w-4 h-4" style={{ color: styles.accent }} />
                {item}
              </li>
            ))}
          </ul>
          <button
            className="w-full py-3 rounded-lg font-medium transition-opacity hover:opacity-90"
            style={{ 
              backgroundColor: styles.primary,
              color: styles.surface,
            }}
          >
            Subscribe
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer 
        className="px-6 py-8 border-t"
        style={{ 
          borderColor: `${styles.text}15`,
          color: styles.textMuted,
          fontSize: getSize("sm"),
        }}
      >
        <div className="flex items-center justify-between">
          <p>© 2025 Brand. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:opacity-70 transition-opacity">Privacy</a>
            <a href="#" className="hover:opacity-70 transition-opacity">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
