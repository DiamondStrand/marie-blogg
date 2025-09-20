declare module 'heroicons-for-svelte' {
	import type { Component } from 'svelte';
	export interface IconProps {
		name: string;
		class?: string;
		style?: string;
		[key: string]: unknown;
	}
	const Icon: Component<IconProps, any, any>;
	export default Icon;
}
