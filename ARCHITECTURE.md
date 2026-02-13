### Architectural Organisation

```
github-profile-card/
├── .github/
│   └── workflows/
│       └── ci.yml                  # Continuous integration pipeline definition
│       └── upstash-keep-alive.yml  # Upstash Redis keep-alive workflow
├── api/
│   └── index.ts                    # Vercel serverless function export
├── src/
│   ├── app.ts                      # Hono framework application and route definitions
│   ├── server.ts                   # Node.js server principal execution point
│   ├── services/
│   │   ├── card.ts                 # SVG card rendering engine
│   │   ├── github.ts               # GitHub API client with caching integration
│   │   └── index.ts                # Service module exports
│   ├── types/
│   │   └── index.ts                # TypeScript interface declarations
│   └── utils/
│       ├── format.ts               # Numeric notation conversion (k, M, etc.)
│       ├── icons.ts                # SVG iconographic components
│       ├── languages.ts            # Linguistic colour palette mapping
│       ├── themes.ts               # Thematic definitions and colour resolution
│       └── index.ts                # Utility module exports
├── __tests__/                      # Test specification files
├── .env.example                    # Environment variable template
├── package.json                    # Project metadata and executable scripts
├── tsconfig.json                   # TypeScript configuration parameters
└── vitest.config.ts                # Test execution framework configuration
```
