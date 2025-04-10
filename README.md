# Customer Management CRM

A modern, responsive customer relationship management (CRM) system built with Next.js 15, Supabase, and TypeScript. This application allows businesses to manage their customer data, track customer status, and perform various operations with role-based access control.

## Features

- **Authentication & Authorization**: Secure login with role-based access control (RBAC)
- **Customer Management**: Add, edit, view, and delete customer records
- **Search and Filtering**: Find customers quickly with powerful search and filtering capabilities
- **Responsive Design**: Works seamlessly across desktop, tablet, and mobile devices
- **Real-time Updates**: See changes instantly with optimistic UI updates
- **Data Validation**: Forms with comprehensive validation to ensure data integrity
- **Error Handling**: Robust error handling throughout the application

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript 5
- **Styling**: TailwindCSS 4
- **Backend & Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Form Validation**: Zod
- **Testing**: Jest, React Testing Library

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- Yarn or npm
- Supabase account

### Environment Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/nextjs-supabase-template.git
cd nextjs-supabase-template
```

2. Install dependencies:

```bash
yarn install
# or
npm install
```

3. Create a `.env.local` file in the root directory with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up your Supabase database using the migrations:

```bash
cd supabase
# Follow instructions in supabase/README.md to run migrations
```

### Development

Run the development server:

```bash
yarn dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

### Testing

Run tests:

```bash
yarn test
# or
npm run test
```

Run tests in watch mode:

```bash
yarn test:watch
# or
npm run test:watch
```

### Building for Production

Build the application:

```bash
yarn build
# or
npm run build
```

Start the production server:

```bash
yarn start
# or
npm run start
```

## Project Structure

- `/app` - Main application code
  - `/api` - API routes for server-side operations
  - `/components` - Reusable React components
  - `/context` - React context providers
  - `/hooks` - Custom React hooks
  - `/lib` - Utility functions and types
  - `/*` - Page routes using Next.js App Router

## User Roles

The application supports the following user roles:

- **Admin**: Full access to all features
- **Manager**: Can view, create, and edit customers
- **Viewer**: Read-only access to customer data

## License

[MIT](LICENSE)
