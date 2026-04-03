# w3-kit

CLI toolkit for web3 development — scaffold projects, add recipes, query chain/token data.

## Install

```bash
npx w3-kit init
```

Or install globally:

```bash
npm install -g w3-kit
```

## Commands

### `w3-kit init`

Scaffold a new web3 project from a template.

```bash
npx w3-kit init my-dapp
```

### `w3-kit add`

Add a recipe or contract to your project.

```bash
npx w3-kit add swap-tokens
npx w3-kit add --contract erc20
```

### `w3-kit registry`

Query chain and token data.

```bash
npx w3-kit registry chains
npx w3-kit registry token USDC
npx w3-kit registry token USDC --json
```

## UI Components

For React components, use shadcn directly:

```bash
npx shadcn@latest add --registry https://ui.w3-kit.com
```
