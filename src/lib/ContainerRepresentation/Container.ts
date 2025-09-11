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

	public constructor(
		public readonly containerRepresentation: ContainerRepresentation,
		public readonly parentContainer: Container | null = null,
	) {
		this.containerResolver = new ContainerResolver(this);
		this.containerHierarchyResolver = new ContainerHierarchyResolver(this);
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
