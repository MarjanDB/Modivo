# Modivo

A lightweight, type-safe dependency injection library for TypeScript (JavaScript too).

[![npm version](https://img.shields.io/npm/v/modivo.svg)](https://www.npmjs.com/package/modivo)

Note that until all features are implemented, the library's API will keep chaning.
I recommend pinning (~) to a specific version until a full release is made, at which point the API will follow semver releases.


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
| **Type-Safe Dependencies** | ✅ Supported | Compile-time dependency checking and validation |
| **Inferred Provider Type** | ✅ Supported | Infer provider return type when using tickets |
| **Singleton/Transient Scopes** | ✅ Supported | Singleton and Transient lifecycle management |
| **Parent/Child Container Hierarchy** | ✅ Supported | Nested containers with parent-child relationships |
| **Provider Override** | ✅ Supported | Be able to override providers (for tests) |
| **Async Providers** | ✅ Supported | Async factory functions for async initialization |
| **Dependencies via Interfaces** | ✅ Supported | Usage of interface return types |
| **Lifecycle Methods** | 🔄 Implementing | Call and hook into lifecycle events of providers (after resolved / before destroyed / etc.) |
| **Circular Dependencies** | 📋 Planned | Support for circular dependencies |
| **Module-like Container Hierarchy** | 📋 Planned | Modular container organization and management (think nestjs) |
| **Exposed Dependency Resolution Tree** | 📋 Planned | See how providers and dependencies were resolved |

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
const db: unknown = container.resolveDependency(dbProvider.token);

// Alternatively, use the created ticket for type safety
const db: DatabaseService = container.resolveDependency(dbProvider);

db.connect(); // "Connecting to https://api.example.com"
```

> 📚 **For complete set of (feature) usage examples, see**: [`src/Examples/`](src/Examples/)

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

> **_Note:_** The provider controls the scope of itself, so if you have a singleton provider that takes in transient dependencies, the transient dependencies become singleton for that specific provider. On the other hand, having a transient provider that takes in singleton dependencies will respect the singleton nature of the dependencies. In other words, **Singleton scope trumps the Transient scope.**

---
---
---

## API Reference

### ContainerBuilder
- `ContainerBuilder.create()` - Create a new container builder
- `register(ticket)` - Register a provider to the container using a provider ticket
- `build()` - Build the final container for dependency resolution

### Container
- `resolveProvider(token)` - Resolve a provider by its token

### ProviderTicketMaster
- `createTicket(options)` - Create a provider ticket (does not register to container)

