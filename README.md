# ChromaType Studio

**An all-in-one workspace for creating accessible color palettes, typography scales, and WCAG-compliant design systems.**

## What is ChromaType Studio?

ChromaType Studio is a free, web-based design tool that unifies color palette creation, typography scaling, accessibility validation, and live preview into a single workspace. It's built for designers and developers who want to create accessible design systems without juggling multiple disconnected tools.

## The Problem It Solves

Modern web design requires:
- Creating structured color palettes with clear roles (background, text, primary, accent)
- Defining typography scales with proper modular ratios
- Validating WCAG contrast ratios for accessibility compliance
- Previewing designs in realistic UI contexts
- Exporting production-ready CSS variables

**The current workflow is fragmented.** Designers typically use 3+ separate tools:
- One tool for generating color palettes
- Another for typography scales
- A third for accessibility checks
- And finally, manual work to preview everything together

**ChromaType Studio solves this** by bringing all these steps into one integrated, accessibility-first workspace.

## Key Features

- **🎨 Color Palettes** - Create structured color palettes with defined roles (background, foreground, primary, secondary, accent)
- **📝 Typography Scales** - Build real typography scales from Google Fonts using modular ratios (1.125, 1.200, 1.250, 1.333, 1.414, 1.618)
- **👁️ Live Preview** - See your design applied instantly to a realistic UI mockup with headings, paragraphs, buttons, cards, and more
- **✅ WCAG Compliance** - Built-in contrast ratio checking for AA and AAA standards on all color combinations
- **⚡ Smart Suggestions** - Get accessible color alternatives when combinations fail accessibility checks
- **📥 Export Ready** - Export CSS variables and font scales ready to use in your projects
- **🎯 Real Context** - No abstract swatches—preview your design system in actual UI components

## Who It's For

- **UX/UI Designers** - Defining new visual systems from scratch
- **Brand Designers** - Exploring different style directions quickly
- **Front-end Developers** - Validating design decisions and accessibility compliance
- **Design Students** - Learning color theory, typography, and WCAG standards

## Technology Stack

This project is built with:

- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Component library
- **Framer Motion** - Animations
- **Chroma.js** - Color manipulation and contrast calculations

## Getting Started

### Prerequisites

- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Local Development

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd chroma-type-studio

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:8080`

### Build for Production

```sh
# Create production build
npm run build

# Preview production build
npm run preview
```

### Running Tests

```sh
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch
```

## Development Workflows

### Using Your IDE Locally

Clone this repo and work locally with your preferred IDE. All changes can be committed and pushed as normal.

### GitHub Codespaces

1. Navigate to the repository on GitHub
2. Click the "Code" button (green button)
3. Select the "Codespaces" tab
4. Click "New codespace"
5. Edit files directly in the Codespace environment

### Direct GitHub Editing

1. Navigate to the desired file on GitHub
2. Click the "Edit" button (pencil icon)
3. Make your changes and commit

## Project Structure

```
chroma-type-studio/
├── src/
│   ├── components/      # React components
│   ├── pages/          # Page components (Landing, Workspace, etc.)
│   ├── lib/            # Utility functions and helpers
│   └── main.tsx        # Application entry point
├── public/             # Static assets
└── index.html          # HTML entry point
```

## Accessibility Philosophy

ChromaType Studio treats accessibility as a **design input**, not a final audit step. Every color combination is automatically checked for WCAG compliance, and the tool provides clear pass/fail indicators and alternative suggestions when needed.

- Built-in WCAG contrast checks for every color pair
- Clear AA and AAA compliance indicators
- No color-only feedback—always includes text and symbols
- Preview reflects real usage scenarios

## Portfolio Project

ChromaType Studio is a standalone, free web tool built as a design and engineering portfolio project focused on workflow efficiency and accessibility-driven design systems.

## License

This project is available for personal and educational use.

## Contributing

Contributions, issues, and feature requests are welcome!

---

**Built with accessibility in mind** | © 2025 ChromaType Studio
