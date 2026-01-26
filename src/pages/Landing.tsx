import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Palette,
  Type,
  CheckCircle2,
  Download,
  Eye,
  Sparkles,
  ArrowRight,
  Accessibility,
  Zap,
  Layers,
} from 'lucide-react';

const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: {
    duration: 0.5,
    ease: 'easeOut',
  },
};

const fadeInUpSmooth = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: {
    duration: 0.5,
    ease: 'easeOut',
  },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const features = [
  {
    icon: Palette,
    title: 'Color Palettes',
    description:
      'Create structured color palettes with clear roles—background, text, primary, accent.',
  },
  {
    icon: Type,
    title: 'Typography Scales',
    description:
      'Build real typography scales from Google Fonts with modular ratios.',
  },
  {
    icon: Eye,
    title: 'Live Preview',
    description: 'Instantly see your design applied in a real UI preview.',
  },
  {
    icon: CheckCircle2,
    title: 'WCAG Contrast Checks',
    description:
      'Check contrast ratios against AA and AAA standards to help improve accessibility.',
  },
  {
    icon: Download,
    title: 'Export Ready',
    description:
      'Export CSS variables and font scales ready for your projects.',
  },
  {
    icon: Sparkles,
    title: 'Smart Suggestions',
    description:
      'Get accessible color alternatives when combinations fail checks.',
  },
];

const audiences = [
  { label: 'UX/UI Designers', description: 'Defining new visual systems' },
  { label: 'Brand Designers', description: 'Exploring styles quickly' },
  { label: 'Front-end Developers', description: 'Validating design decisions' },
  { label: 'Design Students', description: 'Learning color & type theory' },
];

const previewElements = [
  'Headings & paragraphs',
  'Buttons & links',
  'Cards & surfaces',
  'States & emphasis',
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-1/2 -left-1/4 w-[600px] h-[600px] rounded-full bg-accent/5 blur-3xl" />
        </div>

        <div className="container relative pt-20 pb-12 md:pt-32 md:pb-28">
          <motion.div
            className="max-w-4xl mx-auto text-center gpu-accelerated"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            {/* Badge */}
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8"
            >
              <Sparkles className="w-4 h-4" />
              Design System Generator
            </motion.div>

            {/* Main heading */}
            <motion.h1
              variants={fadeInUp}
              className="font-display text-5xl md:text-7xl font-bold tracking-tight mb-6"
            >
              <span className="text-gradient-primary">ChromaType</span>{' '}
              <span className="text-foreground">Studio</span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              variants={fadeInUp}
              className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed"
            >
              An all-in-one workspace for color palettes, typography scales, and{' '}
              <span className="text-foreground font-medium">
                accessibility-aware design systems
              </span>
              .
            </motion.p>

            {/* Description */}
            <motion.p
              variants={fadeInUp}
              className="text-muted-foreground max-w-xl mx-auto mb-10"
            >
              Create accessible color and type foundations in one place.
              Explore, validate, and export real design systems without jumping
              between fragmented tools.
            </motion.p>

            {/* CTA */}
            <motion.div variants={fadeInUp}>
              <Button
                asChild
                size="lg"
                className="text-lg px-8 py-6 shadow-glow"
              >
                <Link to="/workspace" className="gap-2">
                  Open Workspace
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-28 bg-muted/30">
        <div className="container">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              What you can do
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need to build consistent, accessible design
              foundations.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
              animate: {
                transition: {
                  staggerChildren: 0.08,
                },
              },
            }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={{
                  initial: { opacity: 0, y: 10 },
                  animate: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.4,
                      ease: 'easeOut',
                    },
                  },
                }}
                className="group p-6 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-[border-color,box-shadow] duration-300"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Why This Exists Section */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
                Why this exists
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p className="text-lg leading-relaxed">
                  Designers today rely on multiple disconnected tools to
                  generate palettes, define typography scales, validate
                  accessibility, and preview real UI usage.
                </p>
                <p className="leading-relaxed">
                  This tool unifies those steps into a single, fast,
                  accessibility-first workflow. Built to support modern web
                  design where accessibility and speed are non-negotiable.
                </p>
              </div>

              {/* Problem indicators */}
              <div className="mt-8 space-y-3">
                {[
                  'No more switching between 3+ tools',
                  'Accessibility checks built-in, not an afterthought',
                  'Real context preview, not abstract swatches',
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-success" />
                    </div>
                    <span className="text-foreground text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Visual element */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-square max-w-xs sm:max-w-sm md:max-w-md mx-auto relative">
                {/* Floating cards representing old workflow */}
                <div className="absolute -top-2 -left-2 sm:top-0 sm:left-0 w-24 sm:w-28 md:w-32 h-20 sm:h-22 md:h-24 rounded-lg bg-card border border-border shadow-lg p-2 sm:p-3 animate-float">
                  <div className="w-full h-2 sm:h-3 rounded bg-muted mb-2" />
                  <div className="flex gap-1">
                    <div className="w-3 sm:w-4 h-3 sm:h-4 rounded bg-primary/30" />
                    <div className="w-3 sm:w-4 h-3 sm:h-4 rounded bg-secondary/30" />
                    <div className="w-3 sm:w-4 h-3 sm:h-4 rounded bg-accent/30" />
                  </div>
                  <span className="text-[8px] sm:text-[10px] text-muted-foreground mt-1 sm:mt-2 block">
                    Palette Tool
                  </span>
                </div>

                <div
                  className="absolute top-[15%] sm:top-1/4 -right-2 sm:right-0 w-24 sm:w-28 md:w-32 h-20 sm:h-22 md:h-24 rounded-lg bg-card border border-border shadow-lg p-2 sm:p-3 animate-float"
                  style={{ animationDelay: '0.5s' }}
                >
                  <div className="space-y-1">
                    <div className="w-full h-1.5 sm:h-2 rounded bg-muted" />
                    <div className="w-3/4 h-1.5 sm:h-2 rounded bg-muted" />
                    <div className="w-1/2 h-1.5 sm:h-2 rounded bg-muted" />
                  </div>
                  <span className="text-[8px] sm:text-[10px] text-muted-foreground mt-1 sm:mt-2 block">
                    Type Scale
                  </span>
                </div>

                <div
                  className="absolute -bottom-2 -left-2 sm:bottom-0 sm:left-0 w-24 sm:w-28 md:w-32 h-20 sm:h-22 md:h-24 rounded-lg bg-card border border-border shadow-lg p-2 sm:p-3 animate-float"
                  style={{ animationDelay: '1s' }}
                >
                  <div className="flex items-center gap-1 mb-1 sm:mb-2">
                    <div className="w-2 sm:w-3 h-2 sm:h-3 rounded-full bg-success" />
                    <div className="w-2 sm:w-3 h-2 sm:h-3 rounded-full bg-warning" />
                    <div className="w-2 sm:w-3 h-2 sm:h-3 rounded-full bg-destructive" />
                  </div>
                  <div className="w-full h-1.5 sm:h-2 rounded bg-muted" />
                  <span className="text-[8px] sm:text-[10px] text-muted-foreground mt-1 sm:mt-2 block">
                    Contrast Check
                  </span>
                </div>

                {/* Center unified solution */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 sm:w-32 md:w-40 h-28 sm:h-32 md:h-40 rounded-2xl bg-gradient-primary shadow-glow flex items-center justify-center">
                  <div className="text-center text-primary-foreground">
                    <Layers className="w-7 sm:w-8 md:w-10 h-7 sm:h-8 md:h-10 mx-auto mb-1 sm:mb-2" />
                    <span className="text-xs sm:text-sm font-medium">All-in-One</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Who It's For Section */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Who it's for
            </h2>
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {audiences.map((audience) => (
              <motion.div
                key={audience.label}
                variants={fadeInUp}
                className="p-5 rounded-xl bg-card border border-border text-center"
              >
                <h3 className="font-display font-semibold mb-1">
                  {audience.label}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {audience.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Accessibility Section */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
                <div className="space-y-4">
                  {/* Sample contrast checks */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-foreground" />
                      <div className="w-8 h-8 rounded bg-background border border-border" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-muted-foreground">
                        12.5:1
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-success/20 text-success font-medium">
                        AAA
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-primary" />
                      <div className="w-8 h-8 rounded bg-primary-foreground border border-border" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-muted-foreground">
                        8.2:1
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-success/20 text-success font-medium">
                        AAA
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-secondary" />
                      <div className="w-8 h-8 rounded bg-background border border-border" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-muted-foreground">
                        3.1:1
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-warning/20 text-warning font-medium">
                        AA Large
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
                <Accessibility className="w-4 h-4" />
                Built-in
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
                Accessibility-first by design
              </h2>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                  <span>
                    Built-in WCAG contrast checks for every color pair
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                  <span>Clear AA and AAA pass/fail indicators</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                  <span>
                    No color-only feedback—always includes text and symbols
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                  <span>Preview reflects real usage scenarios</span>
                </li>
              </ul>
              <p className="mt-6 text-foreground font-medium">
                Accessibility is treated as a design input, not a final audit
                step.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Live Preview Section */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
                <Zap className="w-4 h-4" />
                Real-time
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
                Live, real preview
              </h2>
              <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                Your palette and typography are applied instantly to a realistic
                UI mockup. No abstract swatches—see your design in real context.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {previewElements.map((element) => (
                  <div
                    key={element}
                    className="flex items-center gap-2 text-sm"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span className="text-muted-foreground">{element}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              {/* Preview mockup */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-border">
                    <div className="w-24 h-6 rounded bg-primary/20" />
                    <div className="flex gap-2">
                      <div className="w-16 h-8 rounded bg-muted" />
                      <div className="w-20 h-8 rounded bg-primary" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    <div className="w-3/4 h-8 rounded bg-foreground/10" />
                    <div className="w-full h-3 rounded bg-muted" />
                    <div className="w-5/6 h-3 rounded bg-muted" />
                  </div>

                  {/* Cards */}
                  <div className="grid grid-cols-2 gap-3 pt-4">
                    <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                      <div className="w-8 h-8 rounded bg-accent/30" />
                      <div className="w-full h-3 rounded bg-muted" />
                      <div className="w-2/3 h-2 rounded bg-muted" />
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                      <div className="w-8 h-8 rounded bg-secondary/30" />
                      <div className="w-full h-3 rounded bg-muted" />
                      <div className="w-2/3 h-2 rounded bg-muted" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-28">
        <div className="container">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
              Start designing
            </h2>
            <Button asChild size="lg" className="text-lg px-8 py-6 shadow-glow">
              <Link to="/workspace" className="gap-2">
                Launch Workspace
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>
              © 2025-2026{' '}
              <a
                href="https://andreasjohanssonux.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors underline underline-offset-4"
              >
                Andreas Johansson
              </a>
            </p>
            <p>Built with designers in mind.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
