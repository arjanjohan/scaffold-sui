# 🏗 Scaffold Sui

<div align="center">

![logo](/assets/logo.png)
<h4 align="center">
  <a href="TODO">Documentation</a> |
  <a href="TODO">Website</a>
</h4>
</div>

🧪 Scaffold Sui is an open-source, cutting-edge toolkit for building decentralized applications (dApps) on Sui. It's designed to streamline the process of creating and deploying Move smart contracts and building user interfaces that interact seamlessly with these smart contracts.

⚙️ Built using Move, Sui TS SDK, Mysten dApp Kit, Next.js, Tailwind CSS, and TypeScript.

* 🛫 **Deployment Scripts**: Simplify and automate your deployment workflow.
* ✅ **Hot Contract Reload**: Your frontend automatically adapts to changes in your smart contracts as you redeploy them.
* 🪝 **Custom Hooks**: A collection of React hooks to simplify interactions with the Sui blockchain.
* 🧱 **Components**: A library of common Web3 components to rapidly build your frontend.
* 🔐 **Wallet Integration**: Connect to any Sui-compatible wallet and interact with the Sui network directly from your frontend.

Perfect for hackathons, prototyping, or launching your next Sui project!

![Landing page](assets/landing-page.png)

## Project Structure
```packages/
├── move/               # Move smart contracts and tests
│   ├── sources/       # Smart contract source files
│   ├── test/          # Contract test files
│   └── utils/         # Utility scripts
├── nextjs/            # Frontend application
    ├── app/           # Next.js application code
    ├── components/    # Reusable React components
    └── hooks/         # Custom React hooks
```


## Requirements

Before you begin, you need to install the following tools:

- [Node (>= v18.17)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)
- [Sui CLI](https://docs.sui.io/guides/developer/getting-started/sui-install)

## Quickstart

To get started with Scaffold Sui, follow the steps below:

1. Clone this repo & install dependencies

```
git clone https://github.com/arjanjohan/scaffold-sui.git
cd scaffold-sui
yarn install
```

2. Then, initialize the Sui client with this command.

```
yarn client
```

This command sets up the Sui client if it hasn't already. It prompts you to select a network (defaults to Sui testnet if you just press `Enter`). Finally, you will be prompted to select the key scheme you want to use. If you are unsure which scheme to use just go with the default ed25519 scheme (option 0).

3. Deploy the test modules:

```
yarn deploy
```

This command deploys the move modules to the network configured in the previous step. The modules are located in `packages/move/sources` and can be modified or replaced to suit your needs. The `yarn deploy` command uses `sui client publish` to publish the modules to the network. After this is executes the script located in `scripts/load-modules.ts` to make the new modules available in the nextjs frontend.

4. On a second terminal, start your NextJS app:

```
yarn start
```

Visit your app on: `http://localhost:3000`. You can tweak the app config in `packages/nextjs/scaffold.config.ts`.

**Note:** For a comprehensive list of available yarn commands and their usage, please refer to our [documentation](TODO).

**What's next**:

- Edit your smart contract `counter.move` in `packages/move/sources`
- Edit your frontend homepage at `packages/nextjs/app/page.tsx`. For guidance on [routing](https://nextjs.org/docs/app/building-your-application/routing/defining-routes) and configuring [pages/layouts](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts) checkout the Next.js documentation.
- Edit your Move tests in: `packages/move/test`. To run test use `yarn test`

## Links

- [Demo video]()
- [Pitchdeck]()
- [Documentation]()
- [Example deployment]()
- [Github](https://github.com/arjanjohan/scaffold-sui)
- [Documentation Github](https://github.com/arjanjohan/scaffold-sui-docs)

## Credits

None of this would have been possible without the great work done in:
- [Scaffold-ETH 2](https://github.com/scaffold-eth/scaffold-eth-2)
- [Sui Core repo](https://github.com/MystenLabs/sui)
- [Mysten dApp Kit](https://sdk.mystenlabs.com/dapp-kit)
- [Sui TypeScript SDK](https://github.com/MystenLabs/ts-sdks)

## Built during the Sui Overflow 2025 Hackathon by

- [arjanjohan](https://x.com/arjanjohan/)
