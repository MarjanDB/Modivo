import type { ConstructableClassType } from "@lib/utils/ClassType.js";

export interface ProviderOnResolvedSync {
	$afterResolvedSync(): void;
}

export interface ProviderOnResolvedAsync {
	$afterResolvedAsync(): Promise<void>;
}

export function isProviderOnResolvedSync(
	instance: InstanceType<ConstructableClassType<any>>,
): instance is ProviderOnResolvedSync {
	return "$afterResolvedSync" in instance && typeof instance.$afterResolvedSync === "function";
}

export function isProviderOnResolvedAsync(
	instance: InstanceType<ConstructableClassType<any>>,
): instance is ProviderOnResolvedAsync {
	return "$afterResolvedAsync" in instance && typeof instance.$afterResolvedAsync === "function";
}

// There are only really relevant for class providers,
// As factory providers are essentially the OnResolved method itself
export type ProviderOnResolved = ProviderOnResolvedSync | ProviderOnResolvedAsync;

export interface ProviderOnDestroyedSync {
	$beforeDestroyedSync(): void;
}

export function isProviderOnDestroyedSync(
	instance: InstanceType<ConstructableClassType<any>>,
): instance is ProviderOnDestroyedSync {
	return "$beforeDestroyedSync" in instance && typeof instance.$beforeDestroyedSync === "function";
}

export interface ProviderOnDestroyedAsync {
	$beforeDestroyedAsync(): Promise<void>;
}

export function isProviderOnDestroyedAsync(
	instance: InstanceType<ConstructableClassType<any>>,
): instance is ProviderOnDestroyedAsync {
	return "$beforeDestroyedAsync" in instance && typeof instance.$beforeDestroyedAsync === "function";
}

// These are relevant to both class and factory providers
export type ProviderOnDestroyed = ProviderOnDestroyedSync | ProviderOnDestroyedAsync;
