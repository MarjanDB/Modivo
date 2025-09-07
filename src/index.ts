// Main container builder - primary entry point for the library

// Container class - for resolving dependencies
export { Container } from "@lib/lib/ContainerRepresentation/Container.js";
// Provider identifier utilities
export {
	createProviderIdentifier,
	type DependencyTokenType,
	type PropertyIdentifier,
	type ProviderIdentifier,
	type ProviderIdentifierAsClass,
	type ProviderIdentifierAsString,
	type ProviderIdentifierAsSymbol,
} from "@lib/lib/ProviderRepresentation/ProviderIdentifierDefinition.js";
// Provider scope enum - for defining dependency scopes
export { ProviderScope } from "@lib/lib/ProviderRepresentation/ProviderScope.js";
export { ContainerBuilder } from "@lib/lib/UsageImplementation/ContainerBuilder.js";
// Provider ticket types - for advanced usage
export type {
	DependencyTypes,
	ProviderTicket,
	ProviderTicketForAsyncFunction,
	ProviderTicketForClass,
	ProviderTicketForFunction,
	ProviderTicketForValue,
	TypeForRegisteringAsyncFunction,
	TypeForRegisteringClass,
	TypeForRegisteringDependency,
	TypeForRegisteringFunction,
	TypeForRegisteringValue,
} from "@lib/lib/UsageImplementation/ProviderTicketMaster.js";
// Provider ticket master - factory for creating provider tickets
export { ProviderTicketMaster } from "@lib/lib/UsageImplementation/ProviderTicketMaster.js";

// Utility types
export type { AbstractClassType, ClassType, ConstructableClassType } from "@lib/utils/ClassType.js";
export type { Nominal } from "@lib/utils/Nominal.js";
