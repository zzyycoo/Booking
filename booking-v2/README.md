# Hotel Service Booking System v3.0

A modular, modern booking email generator for hotel services.

## Features

- 🏨 **Room Booking** - Multi-guest room booking with sharer support
- 🚗 **Car Service** - VIP car service booking
- ⛳ **Golf Booking** - Golf course reservations
- 🚌 **Bus Service** - Shuttle bus booking (HCM ↔ HT)
- 📧 **Email Generation** - Auto-generate formatted booking emails
- 📋 **Quick Copy** - One-click copy to clipboard
- 📱 **Responsive** - Works on desktop and mobile

## Architecture

```
src/
├── css/
│   ├── variables.css    # CSS custom properties
│   ├── layout.css       # Layout and containers
│   ├── forms.css        # Form elements and buttons
│   └── components.css   # UI components
├── js/
│   ├── main.js          # Application entry point
│   ├── state.js         # Central state management
│   ├── hotels.js        # Hotel data and helpers
│   ├── utils.js         # Date/PID utilities
│   ├── room-booking.js  # Room booking module
│   ├── car-booking.js   # Car service module
│   ├── golf-booking.js  # Golf booking module
│   └── bus-booking.js   # Bus service module
└── data/
    └── hotels.json      # Hotel configuration
```

## Tech Stack

- **Vite** - Fast build tool
- **Vanilla JS** - No framework dependencies
- **CSS Variables** - Easy theming
- **Modular Architecture** - Clean separation of concerns

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to GitHub Pages
npm run deploy
```

## Data Configuration

Edit `src/data/hotels.json` to add/modify:
- Hotels and room types
- Promotions per room type
- Agent quick select list
- Service configurations

## Comparison with v2.0

| Metric | v2.0 | v3.0 |
|--------|------|------|
| File Structure | Single HTML (4143 lines) | Modular (10+ files) |
| Total Size | 173KB | 41KB JS + 13KB CSS |
| Maintainability | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| Build Tool | None | Vite |
| Hot Reload | No | Yes |

## License

MIT
