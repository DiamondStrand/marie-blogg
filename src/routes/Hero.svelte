<script lang="ts">
	let { onExplore }: { onExplore?: () => void } = $props();
	let query = '';
	function submit(e: Event) {
		e.preventDefault();
		// No search backend yet – noop
	}
</script>

<section class="mx-auto max-w-6xl px-6 py-40 text-center">
	<p class="mb-4 text-xs tracking-widest text-gray-500 uppercase">TANKAR SOM VÄXER VARJE DAG</p>
	<h1 class="mx-auto max-w-3xl font-serif text-4xl leading-tight font-light md:text-6xl">
		Små Steg <span class="italic">med</span><br />
		<span class="uppercase">Stora Tankar</span>
	</h1>
</section>

<style>
	.font-serif {
		font-family: ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif;
	}
</style>
