# Ravine Dairies Next.js Project

## Overview
Ravine Dairies is a Next.js application designed for business management, featuring authentication, dashboards, and a modular architecture. The project leverages modern web technologies and follows best practices for scalability and maintainability.

## Features
- Modular dashboard components for various business roles
- Authentication and authorization
- Service-based architecture for business logic
- Custom middleware and configuration
- Docker support for containerized deployment

## Folder Structure
```
/var/www/ravine-dairies/
├── Dockerfile
├── middleware.ts
├── next.config.ts
├── package.json
├── public/
│   ├── manifest.json
│   ├── offline.html
│   └── assets/
├── src/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── services/
│   ├── store/
│   ├── types/
│   └── utils/
```

## Setup & Installation
1. **Prerequisites:** Node.js, pnpm (recommended), Docker (optional)
2. **Install dependencies:**
   ```bash
   pnpm install
   ```
3. **Run development server:**
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Configuration
- Environment variables: Create a `.env.local` file for secrets and API keys.
- Custom middleware: See `middleware.ts` for request handling.
- Docker: Use the `Dockerfile` for container builds.

## Usage
- Edit pages in `src/app/page.tsx`.
- Add components in `src/components/`.
- Business logic and API calls are in `src/services/`.
- State management in `src/store/`.

## Deployment
- Deploy on Vercel or any platform supporting Next.js.
- For Docker deployment:
  ```bash
  docker build -t ravine-dairies .
  docker run -p 3000:3000 ravine-dairies
  ```

## Contributing
- Follow best practices for modularity and code style.
- Use ESLint and Prettier for linting and formatting.

## Learn More
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Deployment](https://vercel.com/docs)

## Troubleshooting
- Check logs for errors.
- Ensure environment variables are set.
- For dependency issues, run `pnpm install` again.
    

customize this README.md to fit Agritech 
# SOKOCHAPP - Agritech Tea Farming Management

## Overview
SOKOCHAPP is a Next.js application designed for tea farm management, featuring farmer registration, farm supervision, weighing operations, and factory management. The project leverages modern web technologies including OpenStreetMap for farm location tracking.

## Features
- **Farmer Management** - Register farmers with auto-location detection using OpenStreetMap
- **Farm Supervision** - Supervisors oversee weighing operations at weighing points
- **Farm Workers** - Manage pluckers and other farm workers across farms
- **Weighing Points** - Track and manage produce weighing operations
- **Farm Map** - Visualize farm locations with heat maps showing concentration
- **Factory Management** - Handle factory operations and processing
- Authentication and authorization
- Service-based architecture for business logic
- Custom middleware and configuration

## Stakeholders
- **Farmers** - Own and register farms
- **Farm Managers** - Manage multiple farms
- **Farm Supervisors** - Oversee weighing operations
- **Pluckers/Farm Workers** - Harvest tea leaves
- **Factory** - Process harvested produce

## Folder Structure
```
/sokochapp/
├── Dockerfile
├── middleware.ts
├── next.config.ts
├── package.json
├── public/
│   └── assets/
├── src/
│   ├── app/
│   │   ├── (app)/           # Authenticated app routes
│   │   │   ├── dashboard/
│   │   │   ├── farms/
│   │   │   ├── farm-workers/
│   │   │   ├── farm-supervisors/
│   │   │   ├── farmers/
│   │   │   ├── factory/
│   │   │   ├── weighing-points/
│   │   │   └── farm-map/
│   │   └── (auth)/          # Auth routes
│   │       ├── login/
│   │       └── forgot-password/
│   ├── components/
│   │   ├── common/
│   │   ├── layout/
│   │   └── dashboard/
│   ├── hooks/
│   ├── lib/
│   ├── services/
│   ├── store/
│   ├── types/
│   └── utils/
```

## Setup & Installation
1. **Prerequisites:** Node.js, pnpm (recommended), Docker (optional)
2. **Install dependencies:**
   ```bash
   pnpm install
   ```
3. **Run development server:**
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Configuration
- Environment variables: Create a `.env.local` file for API base URLs and secrets
- Custom middleware: See `middleware.ts` for request handling and authentication
- Docker: Use the `Dockerfile` for container builds

## Key Pages
- `/dashboard` - Main dashboard with farm statistics
- `/farms` - Manage farms
- `/farmers` - Register and manage farmers
- `/farmers/new` - New farmer registration with map location
- `/farm-workers` - Manage farm workers
- `/farm-supervisors` - Manage supervisors
- `/weighing-points` - Manage weighing points
- `/farm-map` - Visual map of all farm locations

## Deployment
- Deploy on Vercel or any platform supporting Next.js
- For Docker deployment:
  ```bash
  docker build -t sokochapp .
  docker run -p 3000:3000 sokochapp
  ```

## Technology Stack
- **Framework:** Next.js 16 with React 19
- **Styling:** Tailwind CSS
- **State:** Redux Toolkit, React Query
- **Maps:** React Leaflet (OpenStreetMap)
- **Forms:** React Hook Form + Zod
- **API:** Axios

## Contributing
- Follow best practices for modularity and code style
- Use ESLint and Prettier for linting and formatting

## Learn More
- [Next.js Documentation](https://nextjs.org/docs)
- [React Leaflet Documentation](https://react-leaflet.js.org/)
- [OpenStreetMap](https://www.openstreetmap.org/)

## Troubleshooting
- Check logs for errors
- Ensure environment variables are set
- For dependency issues, run `pnpm install` again
