import { Container } from "@lib/lib/ContainerRepresentation/Container.js";
import { ContainerRepresentation } from "@lib/lib/ContainerRepresentation/ContainerRepresentation.js";
import type { ProviderScope } from "@lib/lib/enums/ProviderScope.js";
import {
	ProviderConstructionMethodForAsyncFactory,
	ProviderConstructionMethodForClass,
	ProviderConstructionMethodForFactory,
	ProviderConstructionMethodForValue,
} from "@lib/lib/ProviderRepresentation/ProviderConstructionMethod.js";
import {
	ProviderDefinitionForAsyncFunction,
	ProviderDefinitionForClass,
	ProviderDefinitionForFunction,
	ProviderDefinitionForValue,
} from "@lib/lib/ProviderRepresentation/ProviderDefinition.js";
import { ProviderDependencyForFunction } from "@lib/lib/ProviderRepresentation/ProviderDependency.js";
import type { ProviderIdentifier } from "@lib/lib/ProviderRepresentation/ProviderIdentifierDefinition.js";
import {
	type ProviderTicket,
	ProviderTicketForAsyncFunction,
	ProviderTicketForClass,
	ProviderTicketForFunction,
	ProviderTicketForValue,
} from "@lib/lib/UsageImplementation/ProviderTicketMaster.js";

export class ContainerBuilder {
	private readonly containerRepresentation: ContainerRepresentation = new ContainerRepresentation();

	private constructor() {}

	public static create(): ContainerBuilder {
		return new ContainerBuilder();
	}

	public register(ticket: ProviderTicket<ProviderIdentifier, ProviderScope, unknown>): ContainerBuilder {
		if (ticket instanceof ProviderTicketForFunction) {
			const definition = new ProviderDefinitionForFunction(
				ticket.token,
				new ProviderConstructionMethodForFactory(ticket.factory),
				ticket.scope,
				ticket.dependencies.map(
					(dependency, index) => new ProviderDependencyForFunction(index, dependency.token),
				),
			);
			this.containerRepresentation.registerDependency(definition);
			return this;
		}

		if (ticket instanceof ProviderTicketForAsyncFunction) {
			const definition = new ProviderDefinitionForAsyncFunction(
				ticket.token,
				new ProviderConstructionMethodForAsyncFactory(ticket.factory),
				ticket.scope,
				ticket.dependencies.map(
					(dependency, index) => new ProviderDependencyForFunction(index, dependency.token),
				),
			);
			this.containerRepresentation.registerDependency(definition);
			return this;
		}

		if (ticket instanceof ProviderTicketForClass) {
			const definition = new ProviderDefinitionForClass(
				ticket.token,
				new ProviderConstructionMethodForClass(ticket.classConstructor),
				ticket.scope,
				ticket.dependencies.map(
					(dependency, index) => new ProviderDependencyForFunction(index, dependency.token),
				),
			);
			this.containerRepresentation.registerDependency(definition);
			return this;
		}

		if (ticket instanceof ProviderTicketForValue) {
			const definition = new ProviderDefinitionForValue(
				ticket.token,
				new ProviderConstructionMethodForValue(ticket.value),
				ticket.scope,
			);
			this.containerRepresentation.registerDependency(definition);
			return this;
		}

		throw new Error("Invalid ticket type");
	}

	public build(): Container {
		return new Container(this.containerRepresentation);
	}
}
