# Create frontend app
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-git --use-npm

# Install dependencies using workspaces
npm install -w frontend
npm install --save-dev @openzeppelin/contracts-upgradeable@latest @openzeppelin/hardhat-upgrades @nomicfoundation/hardhat-toolbox dotenv @types/dotenv 