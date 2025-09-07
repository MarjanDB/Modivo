# Modivo

A lightweight, type-safe dependency injection library for TypeScript (JavaScript too).

## Installation

```bash
npm install modivo
# or
pnpm add modivo
# or
yarn add modivo
```

## Features

| Feature | Status | Description |
|---------|--------|-------------|
| **Common Types of Providers** | ✅ Supported | Value, Factory, and Class providers |
| **Async Providers** | 🚧 In Development | Async factory functions for async initialization |
| **Provider Override** | 🚧 In Development | Be able to override providers (for tests) |
| **Type-Safe Dependencies** | ✅ Supported | Compile-time dependency checking and validation |
| **Singleton/Transient Scopes** | ✅ Supported | Singleton and Transient lifecycle management |
| **Parent/Child Container Hierarchy** | ✅ Supported | Nested containers with parent-child relationships |
| **Circular Dependencies** | 🚧 Planned | Support for circular dependencies |
| **Module-like Container Hierarchy** | 🚧 Planned | Modular container organization and management (think nestjs) |

## Quick Start

```typescript
import { ContainerBuilder, ProviderTicketMaster } from 'modivo';

// Create a container builder
const containerBuilder = ContainerBuilder.create();

// Define providers using ProviderTicketMaster (this doesn't register them yet)
const configProvider = ProviderTicketMaster.createTicket({
  identifier: 'config',
  value: { apiUrl: 'https://api.example.com' }
});

// Define a service class with type-safe dependencies
class DatabaseService {
  constructor(private config: { apiUrl: string }) {}
  
  connect() {
    console.log(`Connecting to ${this.config.apiUrl}`);
  }
}

// Dependencies are type-enforced - must match constructor parameters
const dbProvider = ProviderTicketMaster.createTicket({
  identifier: 'database',
  class: DatabaseService,
  dependencies: [configProvider] // TypeScript ensures this matches constructor
});

// Register providers to the container (this makes them available for resolution)
containerBuilder.register(configProvider);
containerBuilder.register(dbProvider);
const container = containerBuilder.build();

// Resolve dependencies using the provider's token
const db = container.resolveDependency(dbProvider.token);
db.connect(); // "Connecting to https://api.example.com"
```

> 📚 **More Examples**: See [`src/Examples/`](src/Examples/) for comprehensive usage examples.

## Supported Provider Types

| Provider Type | Description | Example |
|---------------|-------------|---------|
| **Value** | Static values, constants, or configuration objects | `{ identifier: 'apiKey', value: 'abc123' }` |
| **Function** | Factory functions that return instances | `{ identifier: 'logger', factory: () => new Logger() }` |
| **Class** | Constructor functions with dependency injection | `{ identifier: 'service', class: MyService, dependencies: [...] }` |


## Supported Provider Scopes

| Scope | Description | Example |
|-------|-------------|---------|
| **SINGLETON** | Same instance returned every time (default) | `{ scope: ProviderScope.SINGLETON }` |
| **TRANSIENT** | New instance created every time | `{ scope: ProviderScope.TRANSIENT }` |



---
---
---

## Advanced Usage

### Custom Identifiers
```typescript
import { createProviderIdentifier } from 'modivo';

// You can use strings, symbols, or create typed identifiers
const stringId = 'database';
const symbolId = Symbol('database');

const dbProviderUsingStringId = ProviderTicketMaster.createTicket({
  identifier: stringId,
  class: DatabaseService
});

const dbProviderUsingSymbolId = ProviderTicketMaster.createTicket({
  identifier: symbolId,
  class: DatabaseService
});
```

### Dependency Injection with Parameters
```typescript
// First, create provider tickets for dependencies
const configProvider = ProviderTicketMaster.createTicket({
  identifier: 'config',
  value: { smtpHost: 'smtp.example.com' }
});

const loggerProvider = ProviderTicketMaster.createTicket({
  identifier: 'logger',
  factory: () => new Logger()
});

class EmailService {
  constructor(
    private config: Config,
    private logger: Logger
  ) {}
}

// Dependencies array takes provider tickets (not raw values)
const emailProvider = ProviderTicketMaster.createTicket({
  identifier: 'emailService',
  class: EmailService,
  dependencies: [configProvider, loggerProvider] // These are tickets from createTicket()
});
```

## API Reference

### ContainerBuilder
- `ContainerBuilder.create()` - Create a new container builder
- `register(ticket)` - Register a provider to the container using a provider ticket
- `build()` - Build the final container for dependency resolution

### Container
- `resolveProvider(token)` - Resolve a provider by its token

### ProviderTicketMaster
- `createTicket(options)` - Create a provider ticket (does not register to container)

