# Contributing to w3-kit CLI

Thanks for wanting to contribute! w3-kit is an open source web3 toolkit and we welcome contributions of all kinds.

## How to Contribute

### Pick an Issue

Check the [Issues](https://github.com/w3-kit/cli/issues) tab for tasks labeled:
- `good first issue` — great for first-time contributors
- `help wanted` — we'd love community help on these

### Getting Started

1. Fork the repo
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/cli.git
   cd cli
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a branch:
   ```bash
   git checkout -b your-feature-name
   ```
5. Make your changes
6. Push and open a PR

### Project Structure

```
cli/
├── src/
│   ├── commands/     # CLI commands (init, add, registry)
│   ├── utils/        # Shared utilities (GitHub fetch, display, deps)
│   ├── types.ts      # Shared types
│   └── index.ts      # Entry point
├── tests/            # Vitest tests
├── package.json
└── tsconfig.json
```

### Code Style

- TypeScript for all code
- Follow existing patterns in the codebase
- Keep files focused — one responsibility per file
- No unnecessary abstractions

### Commit Messages

Use conventional commits:
- `feat:` — new feature
- `fix:` — bug fix
- `docs:` — documentation
- `chore:` — maintenance

### Pull Requests

- Keep PRs focused on one thing
- Include a clear description of what and why
- Link to the related issue if there is one
- Make sure tests pass

## Local development

```bash
git clone https://github.com/YOUR_USERNAME/cli.git
cd cli
npm install
```

### Run the dev build

```bash
npm run dev
```

### Run tests

```bash
npm test
```

### Run all CI checks locally

```bash
npm run typecheck && npm run lint && npm run format:check && npm run build && npm test
```

## Related Repos

- [@w3-kit/registry](https://github.com/w3-kit/registry) — Chain/token data
- [@w3-kit/ui](https://github.com/w3-kit/ui) — Component library
- [w3-kit/learn](https://github.com/w3-kit/learn) — Recipes and guides
- [w3-kit/contracts](https://github.com/w3-kit/contracts) — Smart contracts

## Code of Conduct

Be kind, be constructive, be patient. We're all here to build something useful.

## Questions?

Open an issue or start a discussion. No question is too basic.
