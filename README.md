# ChromaType Studio

**An all-in-one workspace for creating color palettes, typography scales, and design systems with built-in accessibility checking.**

**[Try it live →](https://andiaz.github.io/chroma-type-studio/)**

## What is ChromaType Studio?

ChromaType Studio is a free, web-based design tool that unifies color palette creation, typography scaling, accessibility validation, and live preview into a single workspace. It's built for designers and developers who want to create design systems without juggling multiple disconnected tools.

## The Problem It Solves

Modern web design requires:

- Creating structured color palettes with clear roles (background, text, primary, accent)
- Defining typography scales with proper modular ratios
- Checking WCAG contrast ratios for accessibility
- Previewing designs in realistic UI contexts
- Exporting production-ready CSS variables

**The current workflow is fragmented.** Designers typically use 3+ separate tools:

- One tool for generating color palettes
- Another for typography scales
- A third for accessibility checks
- And finally, manual work to preview everything together

**ChromaType Studio solves this** by bringing all these steps into one integrated workspace with accessibility checking built in.

## Key Features

- **Color Palettes** - Create structured color palettes with defined roles (background, foreground, primary, secondary, accent)
- **Typography Scales** - Build typography scales from Google Fonts using modular ratios (1.125, 1.200, 1.250, 1.333, 1.414, 1.618)
- **Live Preview** - See your design applied instantly to a realistic UI mockup with headings, paragraphs, buttons, cards, and more
- **Contrast Checking** - Built-in contrast ratio checking for AA and AAA standards on all color combinations
- **Advanced Color Scales** - Generate full HSLuv-based color scales with harmony modes (complementary, analogous, triadic, split-complementary)
- **Full Color System Export** - Export complete semantic color systems (brand, accent, neutral, error, warning, success, info)
- **Export Ready** - Export as CSS variables, SCSS, JSON, or a complete HTML demo page

## Who It's For

- **UX/UI Designers** - Defining new visual systems from scratch
- **Brand Designers** - Exploring different style directions quickly
- **Front-end Developers** - Building and validating design decisions
- **Design Students** - Learning color theory, typography, and accessibility standards

## Technology Stack

- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Component library
- **Framer Motion** - Animations
- **Chroma.js** - Color manipulation and contrast calculations
- **HSLuv** - Perceptually uniform color scale generation

## Getting Started

Requires Node.js & npm - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

```sh
npm install
npm run dev
```

The app will be available at `http://localhost:8080`

### Build for Production

```sh
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── ui/                  # shadcn/ui components
│   └── workspace/
│       ├── PalettePanel.tsx      # Color palette editor
│       ├── TypographyPanel.tsx   # Typography scale editor
│       ├── AccessibilityPanel.tsx # Contrast checking
│       ├── ExportPanel.tsx       # Code export (CSS/SCSS/JSON/HTML)
│       └── LivePreview.tsx       # Real-time UI preview
├── hooks/
│   ├── useDesignSystem.ts   # Main design system state
│   └── useColorScales.ts    # HSLuv color scale generation
├── pages/
│   ├── Landing.tsx          # Landing page
│   └── Workspace.tsx        # Main workspace
├── lib/                     # Utility functions
└── main.tsx                 # Application entry point
```

## Accessibility Philosophy

ChromaType Studio treats accessibility as a **design input**, not a final audit step. Every color combination is automatically checked for WCAG contrast ratios, with clear pass/fail indicators to help you make informed decisions.

- Built-in WCAG contrast checks for every color pair
- Clear AA and AAA compliance indicators
- No color-only feedback—always includes text and symbols
- Preview reflects real usage scenarios

## License

This project is available for personal and educational use.

## Contributing

Contributions, issues, and feature requests are welcome!
