# DP Platform - Standalone Prototype

A self-contained differential privacy platform prototype created for development and wireframing purposes.

## 🚀 Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Open Browser**
   Navigate to `http://localhost:3000`

## 📋 Features

- **Complete DP Functionality**: All differential privacy operations as interactive wireframes
- **Self-Contained**: No external dependencies - all backend functionality is mocked
- **Developer-Ready**: Clean, modular structure for easy customization
- **Rich UI**: Interactive charts, tables, and forms using Chart.js and Bootstrap

## 🔧 Tech Stack

- **Framework**: Next.js 15+
- **UI Library**: Bootstrap 5.3 + Bootstrap Icons
- **Charts**: Chart.js with React integration
- **Mock Services**: Local API simulation

## 📁 Project Structure

```
src/
├── pages/
│   ├── dp/                 # Main DP pages
│   │   ├── index.js        # Dashboard
│   │   ├── dataset.js      # Dataset management
│   │   ├── queries.js      # Query execution
│   │   ├── accounting.js   # Privacy budget
│   │   ├── mechanisms.js   # Privacy mechanisms
│   │   ├── simulation.js   # Testing tools
│   │   ├── reports.js      # Analytics
│   │   ├── audit.js        # Audit logs
│   │   ├── settings.js     # Configuration
│   │   └── operations.js   # Unified interface
│   ├── _app.js            # App configuration
│   └── index.js           # Landing page
├── components/
│   ├── dp/                # DP-specific components
│   ├── common/            # Reusable utilities
│   ├── Header.js          # Navigation header
│   ├── Footer.js          # Footer component
│   ├── ProtectedRoute.js  # Mock authentication
│   └── DpLeftMenu.js      # Sidebar navigation
└── services/
    └── dpApiService.js    # Mock API services
```

## 🎯 Key Pages

- **Dashboard** (`/dp`): Main overview with charts and metrics
- **Datasets** (`/dp/dataset`): Dataset registration and management
- **Queries** (`/dp/queries`): Execute differential privacy queries
- **Mechanisms** (`/dp/mechanisms`): Configure privacy mechanisms
- **Accounting** (`/dp/accounting`): Monitor privacy budget usage
- **Simulation** (`/dp/simulation`): Test mechanisms and performance
- **Reports** (`/dp/reports`): Generate analytics reports
- **Audit** (`/dp/audit`): View system activity logs
- **Settings** (`/dp/settings`): Platform configuration

## 🔒 Privacy Features Simulated

- **Laplace Mechanism**: Additive noise for counts and sums
- **Gaussian Mechanism**: Advanced noise for statistical queries
- **Exponential Mechanism**: Output perturbation for optimization
- **Budget Tracking**: Privacy budget consumption monitoring
- **Composition Analysis**: Multi-query privacy accounting

## 💡 Development Notes

- All backend functionality is **mocked** using local services
- No actual differential privacy computation - UI/UX wireframes only
- Perfect for frontend development and user testing
- Easy to integrate with real backend services later

## 🚧 Prototype Limitations

- **No Real DP Computation**: Mock results and simulated data
- **No Authentication**: Simplified auth for prototype purposes
- **Local Data Only**: No actual database connections
- **Mock APIs**: Simulated backend responses with delays

## 📝 Next Steps for Production

1. Replace mock services with real DP backend
2. Implement proper authentication system
3. Connect to actual databases and data sources
4. Add real differential privacy computation
5. Implement proper error handling and validation

---

**🎯 Purpose**: This standalone prototype enables developers to work on DP platform features independently without requiring the full infrastructure setup.
