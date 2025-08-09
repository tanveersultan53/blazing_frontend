# Blazing Social Frontend

A modern React social media application built with TypeScript, Tailwind CSS, and Shadcn UI components.

## Features

- 🎨 **Modern UI/UX**: Beautiful and responsive design using Tailwind CSS
- 🔐 **Authentication**: Login and signup pages with form validation
- 📱 **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- 🧩 **Component Library**: Built with Shadcn UI for consistent design
- 🚀 **TypeScript**: Full type safety and better developer experience
- 📊 **Dashboard**: Interactive dashboard with statistics and quick actions
- 🧭 **Navigation**: Collapsible sidebar with smooth animations

## Tech Stack

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Shadcn UI** for component library
- **React Router** for navigation
- **Lucide React** for icons
- **Radix UI** for accessible components

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd blazingsocial_frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Project Structure

```
src/
├── components/
│   ├── ui/           # Shadcn UI components
│   ├── Sidebar.tsx   # Navigation sidebar
│   └── DashboardLayout.tsx # Main layout component
├── pages/
│   ├── Login.tsx     # Login page
│   ├── Signup.tsx    # Signup page
│   └── Dashboard.tsx # Dashboard page
├── lib/
│   └── utils.ts      # Utility functions
└── App.tsx           # Main app component
```

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App

## Pages

### Authentication
- **Login** (`/login`): User authentication with email and password
- **Signup** (`/signup`): User registration with form validation

### Dashboard
- **Dashboard** (`/dashboard`): Main dashboard with statistics and quick actions
- **Friends** (`/dashboard/friends`): Friends management
- **Messages** (`/dashboard/messages`): Messaging interface
- **Notifications** (`/dashboard/notifications`): Notification center
- **Analytics** (`/dashboard/analytics`): User analytics
- **Events** (`/dashboard/events`): Event management
- **Saved** (`/dashboard/saved`): Saved content
- **Discover** (`/dashboard/discover`): Content discovery
- **Settings** (`/dashboard/settings`): User settings
- **Help** (`/dashboard/help`): Help and support

## Design System

The application uses a consistent design system with:

- **Colors**: Orange and gray theme matching the Blazing Social brand
- **Typography**: Clean, readable fonts with proper hierarchy
- **Spacing**: Consistent spacing using Tailwind's spacing scale
- **Components**: Reusable UI components from Shadcn UI
- **Icons**: Lucide React icons for consistency

## Responsive Design

- **Mobile**: Collapsible sidebar with overlay
- **Tablet**: Adaptive layout with optimized spacing
- **Desktop**: Full sidebar with additional features

## Future Enhancements

- [ ] Dark mode support
- [ ] Real-time messaging
- [ ] File upload functionality
- [ ] Advanced search features
- [ ] User profile management
- [ ] Social media integration
- [ ] Push notifications
- [ ] Progressive Web App (PWA) features

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the repository or contact the development team.
