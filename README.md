# Aaroh Music Academy

A beautiful, minimal website for Aaroh Music Academy by Kashmira Chakraborty, offering online music courses.

## Features

- **Modern Design**: Clean, elegant interface with cream background and gold/burgundy accents
- **Responsive**: Fully responsive design that works on all devices
- **Animations**: Smooth animations using Framer Motion
- **Component Library**: Built with shadcn/ui components
- **Course Management**: Ready for database integration with PostgreSQL

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Language**: JavaScript (no TypeScript)

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Pages

- `/` - Home page with hero section and features
- `/courses` - Course catalog with enrollment options
- `/about` - About the instructor
- `/contact` - Contact form and information

## Database Ready

The project structure is designed to easily integrate with PostgreSQL using an ORM like Prisma or Drizzle. The course data is currently stored in static arrays but can be easily moved to database models.

## Deployment

This project is optimized for deployment on Vercel with zero configuration needed.

## License

Private project for Aaroh Music Academy.