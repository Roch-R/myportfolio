# MyPortfolio

[![GitHub Repo](https://github.com/Roch-R/myportfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/Roch-R/myportfolio)

Modern React portfolio website built with Vite, Tailwind CSS, GSAP animations, and shadcn/ui components.

**Repository:** https://github.com/Roch-R/myportfolio

## Features
- 3D Hero section with orbital images
- Animated skills progress bars
- Interactive project showcase
- AI-powered RochBot chat assistant
- Responsive design
- Smooth scrolling and parallax effects

## Tech Stack
- React 19
- Vite
- Tailwind CSS
- GSAP for animations
- shadcn/ui components
- Framer Motion
- Lucide React icons

## Getting Started

### Clone from GitHub
```bash
git clone https://github.com/Roch-R/myportfolio.git
cd myportfolio/my-website
npm install
npm run dev
```

### Prerequisites
- Node.js 18+

### Build for Production
```bash
npm run build
```

## Deployment
Configured for Vercel deployment via vercel.json.

## Project Structure
```
my-website/
├── src/
│   ├── components/ (shadcn/ui)
│   ├── data/ (skills, projects)
│   ├── hooks/
│   └── App.jsx
├── public/
├── tailwind.config.js
└── vite.config.js
```

## Backend (Optional)
`portfolio-backend/server.js` - Express server with AI integrations (Anthropic, Google Gemini, Nodemailer)

## Live Demo
[View Deployed Site](https://myportfolio.vercel.app) (update with your Vercel URL)

## License
MIT
