# Waskita Digital Balance – Fatigue & Eye Health Portal

A premium, enterprise-grade corporate health and safety (QSHE) application built with modern web technologies to monitor work fatigue and ergonomics for workers.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Library**: Ant Design (AntD)
- **Charts**: Recharts (Radial & Bar Charts)
- **Animations**: Framer Motion
- **Icons**: FontAwesome & Ant Design Icons

## Features
1. **20-20-20 Eye Break Timer**: Visual countdown timer with custom Web Audio API synth alert chimes to remind employees to break eye strain.
2. **Work Fatigue Self-Assessment**: A 17-question survey using the academic **KAUPK2 Tipe I** (Shift Pagi) subjective measurement method.
   - Includes real-time progress bar.
   - Visual result output using Recharts gauges.
   - Saves history results directly into `LocalStorage`.
3. **Weekly Compliance Statistics**: Dashboard tracking compliance trends across the organization using modern Bar Chart layouts.
4. **Ergonomic Stretching Guide**: Step-by-step guides on cervical flexions, shoulder stretching, and focus lubrication exercises.
5. **QSHE K3 Education**: Information cards outlining workplace ergonomics, hydration, illumination, and posture standards.

## Running Locally

Once you have installed Node.js on your computer, navigate into the project directory in your terminal and run:

```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev
```

The application will run locally at [http://localhost:3000](http://localhost:3000).

## Project Structure
- `src/app/page.tsx` – Landing page dashboard containing the 20-20-20 timer, compliance statistics, and stretching modules.
- `src/app/tes-kelelahan/page.tsx` – Independent route for the KAUPK2 Tipe I fatigue self-assessment questionnaire.
- `src/app/globals.css` – Corporate design styling system and responsive styles.
