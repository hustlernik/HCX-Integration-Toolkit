# HCX Integration Toolkit

Utility tools to facilitate HCX Integrations

## Monorepo Structure

```
monorepo/
├── apps/
│   ├── hcx-ui/
│   ├── provider-stub/
│   └── payer-stub/
├── services/
│   ├── insurance-plan-converter/
│   └── fhir-utilities/
├── packages/
│   ├── fhir-core/
│   ├── hcx-client/
│   └── ui-components/
├── docs/
│   └── static/
├── config/
│   ├── eslint.config.js
│   ├── jest.config.js
│   └── tsconfig.base.json
├── tools/
│   ├── generate-docs.ts
│   ├── seed-db.ts
│   └── hcx-simulator.ts
├── docker/
│   ├── docker-compose.dev.yaml
│   ├── Dockerfile.ui
│   ├── Dockerfile.converter
│   └── Dockerfile.fhir-utils
├── .github/
├── pnpm-workspace.yaml
├── turbo.json
├── package.json
└── README.md
```

## Workspace Setup

- Uses [pnpm](https://pnpm.io/) for fast, disk-efficient dependency management.
- Uses [Turborepo](https://turbo.build/) for high-performance monorepo builds, caching, and task orchestration.

## Getting Started

1. Install [pnpm](https://pnpm.io/installation) and [Turborepo](https://turbo.build/).
2. Run `pnpm install` at the root to install all dependencies.
3. Use `pnpm build`, `pnpm dev`, `pnpm lint`, and `pnpm test` to run tasks across the monorepo.

## Structure

- `apps/`: Runnable applications (UI, stubs)
- `services/`: API/microservices
- `packages/`: Shared libraries
- `docs/`: Documentation
- `config/`: Shared configuration
- `tools/`: Internal CLI/dev tools
- `docker/`: Dockerfiles and Compose setups
- `.github/`: GitHub Actions, templates, workflows

## CI/CD

- GitHub Actions workflows in `.github/workflows/` for build, lint, and test.
- Remote caching and task orchestration via Turborepo.

---
