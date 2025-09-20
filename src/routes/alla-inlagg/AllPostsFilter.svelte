<script lang="ts">
	import Icon from '@iconify/svelte';
	let {
		search = $bindable(''),
		tag = $bindable(''),
		category = $bindable(''),
		view = $bindable('grid' as 'grid' | 'list'),
		allTags = [] as string[],
		categories = [] as string[]
	} = $props();

	function handleSubmit(e: Event) {
		// Normal GET submit
	}

	function clearSearch() {
		search = '';
	}

	const popularTags = allTags.slice(0, 8);
</script>

<form
	method="get"
	class=" flex flex-col gap-6 py-6"
	role="search"
	aria-label="Sök och filter"
	onsubmit={handleSubmit}
>
	<input type="hidden" name="view" bind:value={view} />
	<!-- Search full width top -->
	<div class="w-full">
		<label
			for="q"
			class="sr-only mb-2 block text-[11px] font-semibold tracking-wide text-gray-600 uppercase"
			>Sök</label
		>
		<div class="relative">
			<input
				id="q"
				name="q"
				bind:value={search}
				placeholder="Sök bland alla inlägg..."
				class="w-full rounded-xl border border-gray-300/80 bg-white/90 py-4 pr-12 pl-12 text-base leading-snug shadow-sm transition focus:border-gray-400 focus:ring-2 focus:ring-gray-900/15 focus:outline-none"
			/>
			<Icon
				icon="lucide:search"
				class="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-gray-400"
				width="20"
				height="20"
			/>
			{#if search}
				<button
					type="button"
					onclick={clearSearch}
					class="group absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-gray-400 transition hover:text-gray-600 focus:ring-2 focus:ring-gray-900/20 focus:outline-none"
					title="Rensa sök"
					aria-label="Rensa sök"
				>
					<Icon icon="lucide:x" width="18" height="18" />
				</button>
			{/if}
		</div>
	</div>

	<!-- Filters row -->
	<div class="flex items-center justify-between">
		<div>
			<button
				type="submit"
				class="inline-flex items-center justify-center rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-medium tracking-wide text-white shadow-sm transition hover:bg-black focus:ring-2 focus:ring-gray-900/30 focus:outline-none"
				>Filtrera</button
			>
			<a
				href="/alla-inlagg"
				class="inline-flex items-center justify-center rounded-lg bg-gray-100 px-6 py-2.5 text-sm font-medium tracking-wide text-gray-700 ring-1 ring-gray-200 transition ring-inset hover:bg-gray-50 hover:text-gray-900"
				>Rensa</a
			>
		</div>
		<div class="flex h-full items-center justify-end gap-0" role="group" aria-label="Välj vy">
			<button
				type="submit"
				onclick={() => (view = 'grid')}
				aria-pressed={view === 'grid'}
				class={`${
					view === 'grid'
						? 'rounded-l-lg bg-gray-900 text-white shadow-sm hover:bg-black'
						: 'rounded-l-lg bg-white text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50'
				} inline-flex cursor-pointer items-center justify-center px-6 py-2.5 text-sm font-medium tracking-wide transition focus:ring-2 focus:ring-gray-900/30 focus:outline-none`}
				title="Visa som rutnät"
			>
				<Icon icon="lucide:layout-grid" width="20" height="20" />
			</button>
			<button
				type="submit"
				onclick={() => (view = 'list')}
				aria-pressed={view === 'list'}
				class={`${
					view === 'list'
						? 'rounded-r-lg bg-gray-900 text-white shadow-sm hover:bg-black'
						: 'rounded-r-lg bg-white text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50'
				} inline-flex cursor-pointer items-center justify-center px-6 py-2.5 text-sm font-medium tracking-wide transition focus:ring-2 focus:ring-gray-900/30 focus:outline-none`}
				title="Visa som lista"
			>
				<Icon icon="lucide:layout-list" width="20" height="20" />
			</button>
		</div>
	</div>
</form>

<style>
	/* Optional thin scrollbar styling for horizontal popular tags scroller */
	.scrollbar-thin::-webkit-scrollbar {
		height: 6px;
	}
	.scrollbar-thin::-webkit-scrollbar-track {
		background: transparent;
	}
	.scrollbar-thin::-webkit-scrollbar-thumb {
		background: rgba(0, 0, 0, 0.25);
		border-radius: 3px;
	}
</style>
