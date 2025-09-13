import { ContainerHierarchyResolver } from "@lib/lib/ContainerRepresentation/ContainerHierarchyResolver.js";
import type { ContainerRepresentation } from "@lib/lib/ContainerRepresentation/ContainerRepresentation.js";
import { ContainerResolver } from "@lib/lib/ContainerRepresentation/ContainerResolver.js";
import type { ProviderIdentifier } from "@lib/lib/ProviderRepresentation/ProviderIdentifierDefinition.js";
import { ProviderScope } from "@lib/lib/ProviderRepresentation/ProviderScope.js";
import type { ProviderTicket } from "@lib/lib/UsageImplementation/ProviderTicketMaster.js";

export class Container {
	private readonly containerResolver: ContainerResolver;
	private readonly containerHierarchyResolver: ContainerHierarchyResolver;
	private readonly resolvedSingletoneDependencies: Map<ProviderIdentifier, unknown> = new Map();
	private readonly childContainers: Map<Container, Container> = new Map();

	public constructor(
		public readonly containerRepresentation: ContainerRepresentation,
		public readonly parentContainer: Container | null = null,
	) {
		this.containerResolver = new ContainerResolver(this);
		this.containerHierarchyResolver = new ContainerHierarchyResolver(this);

		if (parentContainer) {
			parentContainer.registerChildContainer(this);
		}
	}

	private registerChildContainer(childContainer: Container): void {
		this.childContainers.set(childContainer, childContainer);
	}

	public getChildContainers(): ReadonlyMap<Container, Container> {
		return this.childContainers;
	}

	public destroy(): void {
		throw new Error("Not implemented");
	}

	public destroyAsync(): Promise<void> {
		throw new Error("Not implemented");
	}

	public destroyLocal(): void {
		throw new Error("Not implemented");
	}

	public destroyLocalAsync(): Promise<void> {
		throw new Error("Not implemented");
	}

	/**
	 * Resolve all providers in this container and all child containers.
	 * This is useful when you have lifecycle methods defined on providers,
	 * and you want to ensure that all providers are resolved at the very start of your application.
	 * This will only work for providers that aren't async and do not use async lifecycle methods.
	 */
	public resolveEverything(): void {
		this.containerHierarchyResolver.resolveContainer();
	}

	/**
	 * Resolve all providers in this container and all child containers.
	 * This is useful when you have lifecycle methods defined on providers,
	 * and you want to ensure that all providers are resolved at the very start of your application.
	 * This will only work for all providers, whether they are async or sync lifecycle methods.
	 */
	public resolveEverythingAsync(): Promise<void> {
		return this.containerHierarchyResolver.resolveContainerAsync();
	}

	/**
	 * Resolve all providers in this container.
	 * This is useful when you have lifecycle methods defined on providers,
	 * and you want to ensure that all providers are resolved at the very start of your application.
	 * This will only work for providers that aren't async and do not use async lifecycle methods.
	 */
	public resolveEverythingLocal(): void {
		const allProvidersInThisContainer = this.containerRepresentation.getProvidersByScope();
		const allSingletoneDependencies = allProvidersInThisContainer.singleton.getProviders();
		const allTransientDependencies = allProvidersInThisContainer.transient.getProviders();

		// TODO: When hirearchy is implemented, this resolution can be sped up
		// by resolving providers and their dependencies in parallel (when not in conflict in hierarchy)
		for (const [providerToken, _providerDefinition] of allSingletoneDependencies) {
			this.resolveLocalProvider(providerToken);
		}

		// TODO: Don't resolve what's already been resolved at least once
		// NOTE: Add control for whether or not transient providers should be resolved when starting the container
		// Reason to resolve being to validate that a transient provider even works at the very start, and not only later on when it's used
		for (const [providerToken, _providerDefinition] of allTransientDependencies) {
			this.resolveLocalProvider(providerToken);
		}
	}

	/**
	 * Resolve all providers in this container.
	 * This is useful when you have lifecycle methods defined on providers,
	 * and you want to ensure that all providers are resolved at the very start of your application.
	 * This will only work for all providers, whether they are async or sync lifecycle methods.
	 */
	public async resolveEverythingLocalAsync(): Promise<void> {
		const allProvidersInThisContainer = this.containerRepresentation.getProvidersByScope();
		const allSingletoneDependencies = allProvidersInThisContainer.singleton.getProviders();
		const allTransientDependencies = allProvidersInThisContainer.transient.getProviders();

		// TODO: When hirearchy is implemented, this resolution can be sped up
		// by resolving providers and their dependencies in parallel (when not in conflict in hierarchy)
		for (const [providerToken, _providerDefinition] of allSingletoneDependencies) {
			await this.resolveAsyncLocalProvider(providerToken);
		}

		// TODO: Don't resolve what's already been resolved at least once
		// NOTE: Add control for whether or not transient providers should be resolved when starting the container
		// Reason to resolve being to validate that a transient provider even works at the very start, and not only later on when it's used
		for (const [providerToken, _providerDefinition] of allTransientDependencies) {
			await this.resolveAsyncLocalProvider(providerToken);
		}
	}

	public resolveProvider<
		Ticket extends ProviderTicket<ProviderIdentifier, ProviderScope, unknown>,
		TicketReturnType = Ticket extends ProviderTicket<ProviderIdentifier, ProviderScope, infer R> ? R : never,
	>(providerToken: Ticket): TicketReturnType;
	public resolveProvider(providerToken: ProviderIdentifier): unknown;
	public resolveProvider(
		providerToken: ProviderIdentifier | ProviderTicket<ProviderIdentifier, ProviderScope, unknown>,
	): unknown {
		if ("token" in providerToken) {
			const identifier = providerToken.token;
			return this.containerHierarchyResolver.resolveProvider(identifier);
		}

		return this.containerHierarchyResolver.resolveProvider(providerToken);
	}

	public resolveLocalProvider<
		Ticket extends ProviderTicket<ProviderIdentifier, ProviderScope, unknown>,
		TicketReturnType = Ticket extends ProviderTicket<ProviderIdentifier, ProviderScope, infer R> ? R : never,
	>(providerToken: Ticket): TicketReturnType;
	public resolveLocalProvider(providerToken: ProviderIdentifier): unknown;
	public resolveLocalProvider(
		providerToken: ProviderIdentifier | ProviderTicket<ProviderIdentifier, ProviderScope, unknown>,
	): unknown {
		let identifier: ProviderIdentifier;

		if ("token" in providerToken) {
			identifier = providerToken.token;
		} else {
			identifier = providerToken;
		}

		const dependencyEntry = this.containerRepresentation.lookupProviderEntry(identifier);

		if (!dependencyEntry) {
			throw new Error(`Dependency ${providerToken} not found`);
		}

		if (dependencyEntry.scope === ProviderScope.SINGLETON) {
			if (this.resolvedSingletoneDependencies.has(identifier)) {
				return this.resolvedSingletoneDependencies.get(identifier);
			}

			const resolvedDependency = this.containerResolver.resolveProvider(identifier);
			this.resolvedSingletoneDependencies.set(identifier, resolvedDependency);
			return resolvedDependency;
		}

		if (dependencyEntry.scope === ProviderScope.TRANSIENT) {
			return this.containerResolver.resolveProvider(identifier);
		}

		throw new Error(`Dependency ${identifier} has an invalid scope`);
	}

	public resolveAsyncProvider<
		Ticket extends ProviderTicket<ProviderIdentifier, ProviderScope, unknown>,
		TicketReturnType = Ticket extends ProviderTicket<ProviderIdentifier, ProviderScope, infer R> ? R : never,
	>(providerToken: Ticket): TicketReturnType;
	public resolveAsyncProvider(providerToken: ProviderIdentifier): Promise<unknown>;
	public resolveAsyncProvider(
		providerToken: ProviderIdentifier | ProviderTicket<ProviderIdentifier, ProviderScope, unknown>,
	): Promise<unknown> {
		if ("token" in providerToken) {
			const identifier = providerToken.token;
			return this.containerHierarchyResolver.resolveProviderAsync(identifier);
		}

		return this.containerHierarchyResolver.resolveProviderAsync(providerToken);
	}

	public resolveAsyncLocalProvider<
		Ticket extends ProviderTicket<ProviderIdentifier, ProviderScope, unknown>,
		TicketReturnType = Ticket extends ProviderTicket<ProviderIdentifier, ProviderScope, infer R> ? R : never,
	>(providerToken: Ticket): TicketReturnType;
	public resolveAsyncLocalProvider(providerToken: ProviderIdentifier): Promise<unknown>;
	public async resolveAsyncLocalProvider(
		providerToken: ProviderIdentifier | ProviderTicket<ProviderIdentifier, ProviderScope, unknown>,
	): Promise<unknown> {
		let identifier: ProviderIdentifier;

		if ("token" in providerToken) {
			identifier = providerToken.token;
		} else {
			identifier = providerToken;
		}

		const dependencyEntry = this.containerRepresentation.lookupProviderEntry(identifier);

		if (!dependencyEntry) {
			throw new Error(`Dependency ${providerToken} not found`);
		}

		if (dependencyEntry.scope === ProviderScope.SINGLETON) {
			if (this.resolvedSingletoneDependencies.has(identifier)) {
				return this.resolvedSingletoneDependencies.get(identifier);
			}

			const resolvedDependency = await this.containerResolver.resolveProviderAsync(identifier);
			this.resolvedSingletoneDependencies.set(identifier, resolvedDependency);
			return resolvedDependency;
		}

		if (dependencyEntry.scope === ProviderScope.TRANSIENT) {
			return this.containerResolver.resolveProviderAsync(identifier);
		}

		throw new Error(`Dependency ${identifier} has an invalid scope`);
	}
}
