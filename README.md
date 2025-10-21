# Tokenstub

A blockchain-based ticketing platform built on Algorand that eliminates scalping and creates a transparent, secure event ticketing ecosystem.

<img width="1200" height="950" alt="image" src="https://github.com/user-attachments/assets/0703f3d2-07d5-410b-9e47-d25a91cf9ac9" />
<img width="1225" height="795" alt="image" src="https://github.com/user-attachments/assets/c931313a-6ea8-42bb-a863-bc419f27a8ed" />




## The Problem

The ticketing industry faces critical challenges that hurt both event organizers and genuine fans:

- **Rampant Scalping**: Tickets are bought in bulk by bots and resold at inflated prices, pricing out genuine fans
- **Counterfeit Tickets**: Fake tickets lead to disappointed customers and revenue loss for organizers
- **Lack of Transparency**: Secondary market transactions occur in opaque systems with no control or visibility
- **Lost Revenue**: Event organizers see no benefit from secondary market sales despite creating the original value

## Our Solution

Tokenstub leverages the Algorand blockchain to create fungible ticket tokens that can be validated, tracked, and controlled throughout their lifecycle. Our platform prevents scalping through smart contract-enforced transfer locks while maintaining ticket authenticity and transparency.

![View Pitch Deck](https://github.com/w3joe/Admi-Tokenstub/blob/main/Tokenstub%20Pitch%20Deck.pdf)

### How It Works

1. **Ticket Creation**: Event organizers mint fungible ticket tokens on Algorand representing admission rights
2. **Primary Sale**: Fans purchase tickets directly using Algo cryptocurrency
3. **Transfer Lock**: Smart contracts prevent ticket transfers until the event day, eliminating speculative scalping
4. **Validation**: Authorized ticket masters validate tickets on-chain at the venue entrance
5. **Transparent Records**: All transactions are recorded immutably on the blockchain

## Key Features

### Anti-Scalping Protection

- **Transfer Lock Mechanism**: Tickets cannot be exchanged or resold until event day, preventing bots from profiting off artificial scarcity
- **One-per-Wallet Limits**: Optional restrictions to ensure fair distribution
- **Transparent Pricing**: All ticket prices visible on-chain



### Ticket Buyer
![Event Buyer Demo](https://github.com/user-attachments/assets/c4ca7c45-359f-434e-b2d0-383e431de9df)

### Event Organiser
![Event Organiser Demo](https://github.com/user-attachments/assets/d6b491cb-b4fa-43f8-a5a1-7a4752929f33)


### Secure Validation

- **On-Chain Verification**: Ticket masters validate tickets directly on the blockchain
- **Real-Time Status**: Instant confirmation of ticket authenticity and usage
- **No Counterfeits**: Blockchain immutability ensures only genuine tickets exist

### Built on Algorand

- **Low Transaction Fees**: Minimal costs for ticket purchases and transfers
- **Fast Finality**: Instant transaction confirmation
- **Eco-Friendly**: Carbon-neutral blockchain with proof-of-stake consensus
- **Scalability**: Handles high-volume ticket sales efficiently

### Event Organizer Benefits

- **Revenue Protection**: Eliminate losses from counterfeit tickets
- **Market Control**: Set rules for ticket distribution and transfers
- **Analytics Dashboard**: Track sales, attendance, and market activity
- **Direct Fan Relationships**: Connect with ticket holders through wallet addresses

## Technology Stack

- **Blockchain**: Algorand
- **Smart Contracts**: Algorand Standard Assets (ASA) for fungible tickets
- **Currency**: Algo (ALGO)
- **Validation**: On-chain verification system
- **Frontend**: [To be determined based on implementation]

## Use Cases

- **Concerts & Festivals**: Prevent scalping for high-demand music events
- **Sports Events**: Ensure fair access to championship games and tournaments
- **Theater & Arts**: Protect small venues from predatory resellers
- **Conferences**: Manage professional event access with verifiable credentials
- **Community Events**: Enable local organizers to control their ticketing ecosystem

## Getting Started

### For Event Organizers

1. Create an account and connect your Algorand wallet
2. Set up your event with ticket parameters (price, quantity, transfer rules)
3. Mint your ticket tokens on Algorand
4. Share the sale link with your audience
5. Validate tickets on event day using our mobile app

### For Ticket Holders

1. Connect your Algorand wallet
2. Browse available events
3. Purchase tickets with ALGO
4. Store tickets securely in your wallet
5. Present for validation at the venue

### For Ticket Masters

1. Receive authorized validator credentials from event organizer
2. Access the validation interface on event day
3. Scan or verify ticket IDs on-chain
4. Mark tickets as validated to prevent reuse

## Why Algorand?

We chose Algorand for several compelling reasons:

- **Speed**: Block finality in under 3 seconds enables real-time ticketing
- **Cost**: Transaction fees under $0.001 keep ticketing affordable
- **Sustainability**: Carbon-negative blockchain aligns with event industry values
- **Simplicity**: Built-in ASA standard makes fungible tickets straightforward to implement
- **Security**: Pure proof-of-stake ensures network integrity

## Contributing

We welcome contributions from the community! Please see our contributing guidelines for more information on how to get involved.

## License

[License Type] - See LICENSE file for details


### Initial setup

1. Clone this repository to your local machine.
2. Ensure [Docker](https://www.docker.com/) is installed and operational. Then, install `AlgoKit` following this [guide](https://github.com/algorandfoundation/algokit-cli#install).
3. Run `algokit project bootstrap all` in the project directory. This command sets up your environment by installing necessary dependencies, setting up a Python virtual environment, and preparing your `.env` file.
4. In the case of a smart contract project, execute `algokit generate env-file -a target_network localnet` from the `Algorand-contracts` directory to create a `.env.localnet` file with default configuration for `localnet`.
5. To build your project, execute `algokit project run build`. This compiles your project and prepares it for running.
6. For project-specific instructions, refer to the READMEs of the child projects:
   - Smart Contracts: [Algorand-contracts](projects/Algorand-contracts/README.md)
   - Frontend Application: [Algorand-frontend](projects/Algorand-frontend/README.md)

> This project is structured as a monorepo, refer to the [documentation](https://github.com/algorandfoundation/algokit-cli/blob/main/docs/features/project/run.md) to learn more about custom command orchestration via `algokit project run`.

### Subsequently

1. If you update to the latest source code and there are new dependencies, you will need to run `algokit project bootstrap all` again.
2. Follow step 3 above.

## Tools

This project makes use of Python and React to build Algorand smart contracts and to provide a base project configuration to develop frontends for your Algorand dApps and interactions with smart contracts. The following tools are in use:

- Algorand, AlgoKit, and AlgoKit Utils
- Python dependencies including Poetry, Black, Ruff or Flake8, mypy, pytest, and pip-audit
- React and related dependencies including AlgoKit Utils, Tailwind CSS, daisyUI, use-wallet, npm, jest, playwright, Prettier, ESLint, and Github Actions workflows for build validation

### VS Code

It has also been configured to have a productive dev experience out of the box in [VS Code](https://code.visualstudio.com/), see the [backend .vscode](./backend/.vscode) and [frontend .vscode](./frontend/.vscode) folders for more details.

## Integrating with smart contracts and application clients

Refer to the [Algorand-contracts](projects/Algorand-contracts/README.md) folder for overview of working with smart contracts, [projects/Algorand-frontend](projects/Algorand-frontend/README.md) for overview of the React project and the [projects/Algorand-frontend/contracts](projects/Algorand-frontend/src/contracts/README.md) folder for README on adding new smart contracts from backend as application clients on your frontend. The templates provided in these folders will help you get started.
When you compile and generate smart contract artifacts, your frontend component will automatically generate typescript application clients from smart contract artifacts and move them to `frontend/src/contracts` folder, see [`generate:app-clients` in package.json](projects/Algorand-frontend/package.json). Afterwards, you are free to import and use them in your frontend application.

The frontend starter also provides an example of interactions with your AlgorandClient in [`AppCalls.tsx`](projects/Algorand-frontend/src/components/AppCalls.tsx) component by default.

## Next Steps

You can take this project and customize it to build your own decentralized applications on Algorand. Make sure to understand how to use AlgoKit and how to write smart contracts for Algorand before you start.
