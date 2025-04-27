# 🏗 Scaffold IOTA

<div align="center">

![logo](/assets/logo.png)
<h4 align="center">
  <a href="TODO">Documentation</a> |
  <a href="TODO">Website</a>
</h4>
</div>

🧪 Scaffold IOTA is an open-source, cutting-edge toolkit for building decentralized applications (dApps) on IOTA. It's designed to streamline the process of creating and deploying Move modules and building user interfaces that interact seamlessly with those modules.

⚙️ Built using Move, IOTA TS SDK, Next.js, Tailwind CSS, and TypeScript.

- 🛫 **Deployment Scripts**: Simplify and automate your deployment workflow.
- ✅ **Module Hot Reload**: Your frontend automatically adapts to changes in your Move modules as you edit them.
- 🪝 **Custom Hooks**: A collection of React hooks to simplify interactions with Move modules.
- 🧱 **Components**: A library of common Web3 components to rapidly build your frontend.
- 🔐 **Wallet Integration**: Connect to any Aptos-compatible wallet and interact with the Aptos network directly from your frontend.

Perfect for hackathons, prototyping, or launching your next Move project!

![Debug Modules tab](assets/landing-page.png)

## Requirements

Before you begin, you need to install the following tools:

- [Node (>= v18.17)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)
- [IOTA CLI](https://docs.iota.org/developer/getting-started/install-iota)

## Quickstart

To get started with Scaffold IOTA, follow the steps below:

1. Clone this repo & install dependencies

```
git clone https://github.com/arjanjohan/scaffold-iota.git
cd scaffold-iota
yarn install
```

2. Then, initialize the IOTA client with this command.

```
yarn client
```

This command sets up the IOTA client if it hasnt already. It prompts you to select a network (defaults to IOTA testnet if you just press `Enter`). Finally, you will be prompted to select the key scheme you want to use. If you are unsure which scheme to use just go with the default ed25519 scheme (option 0).

To view the configuration use this command:
```
yarn view-clients
```

To switch to a certain configured enviroment, use this command:
```
yarn switch-client <envAlias>
```

3. Deploy the test modules:

```
yarn deploy
```

This command deploys the move modules to the network configured in the previous step. The modules are located in `packages/move/sources` and can be modified or replaced to suit your needs. The `yarn deploy` command uses `iota client publish` to publish the modules to the network. After this is executes the script located in `scripts/load-modules.ts` to make the new modules available in the nextjs frontend.

4. On a second terminal, start your NextJS app:

```
yarn start
```

Visit your app on: `http://localhost:3000`. You can interact with your Move modules using the `Debug Modules` page. You can tweak the app config in `packages/nextjs/scaffold.config.ts`.

**What's next**:

- Edit your Move module `counter.move` in `packages/move/sources`
- Edit your frontend homepage at `packages/nextjs/app/page.tsx`. For guidance on [routing](https://nextjs.org/docs/app/building-your-application/routing/defining-routes) and configuring [pages/layouts](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts) checkout the Next.js documentation.
- Edit your Move tests in: `packages/move/test`. To run test use `yarn test`

## TODO

- load deployed modules in frontend
- Add submit tx hook
- Add view tx hook
- typesafety for hooks
- debug tab
- show balances
- disconnect wallet doesnt work
- set network config globally instead of `  const networkConfig = getNetwork("testnet");` troughout the app

## Next steps

Scaffold IOTA has successfully implemented core features essential for IOTA developers, providing a great starting point with NextJS. This version offers a streamlined development experience with hot module reloading, custom hooks, and seamless wallet integration.

In the scope of this hackathon, it was not possible to complete everything. Here's a list of issues (big and small) that are on the roadmap:

- Add documentation and create tutorials for easier onboarding.
- Develop more pre-built components for common dApp functionalities.
- Integrate different templates/configurations for Move contracts
- Update `filterAndSortTokenBalances` to use metadata instead of cointype

We're committed to evolving Scaffold IOTA based on community feedback and emerging best practices in the IOTA ecosystem. For a detailed list of upcoming features and to contribute ideas, please check our [GitHub Issues](https://github.com/arjanjohan/scaffold-iota/issues).

## Issues I ran into during development

#### Wallet popup not showing
In `layout.tsx` I had to add 2 css files to fix it. See [this Discord discussion](https://discord.com/channels/1341659158071611445/1360255915110039612) where the solution was posted. Maybe the


## Links

- [Documentation]()
- [Example deployment](https://scaffold-iota.vercel.app/)
- [Github](https://github.com/arjanjohan/scaffold-iota)

## Credits

None of this would have been possible without the great work done in:
- [Scaffold-ETH 2](https://github.com/scaffold-eth/scaffold-eth-2)
- [IOTA Core repo](https://github.com/iotaledger/iota)
- [IOTA dApp Kit](https://docs.iota.org/ts-sdk/dapp-kit/)
- [IOTA TypeScript SDK](https://docs.iota.org/ts-sdk/typescript/)

## Built during the IOTA Moveathon APAC Hackathon by

- [arjanjohan](https://x.com/arjanjohan/)
