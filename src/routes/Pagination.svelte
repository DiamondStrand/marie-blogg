<script lang="ts">
	let { totalPages = 5, currentPage = 1 } = $props();
	const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
</script>

<div class="mx-auto max-w-6xl px-6 py-6">
	<div class="flex items-center justify-center gap-2 text-sm">
		<button
			class="rounded border px-2 py-1 text-gray-600 disabled:opacity-40"
			disabled={currentPage === 1}>‹</button
		>
		{#each pages as p}
			<button
				class="h-8 w-8 rounded border text-center leading-8 hover:bg-gray-50"
				class:bg-black={p === currentPage}
				class:text-white={p === currentPage}>{p}</button
			>
		{/each}
		<button class="rounded border px-2 py-1 text-gray-600">›</button>
	</div>
</div>
