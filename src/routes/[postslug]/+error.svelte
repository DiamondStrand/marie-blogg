<script lang="ts">
	import { page } from '$app/stores';
	let status: number;
	let message: string;
	$: status = $page.status;
	$: message = $page.error?.message || 'Inlägget kunde inte hittas';
</script>

<svelte:head>
	<title>{status === 404 ? 'Inlägget saknas' : 'Fel inträffade'} – Små steg med stora tankar</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="flex min-h-screen flex-col items-center justify-center bg-white text-gray-900">
	<!-- Hero-lik sektion -->
	<section class="relative mx-auto max-w-6xl text-center">
		<p class="mb-4 text-xs tracking-widest text-gray-500 uppercase">
			{status === 404 ? `${message}` : 'ETT FEL UPPSTOD'}
		</p>
		<h3 class="mb-10 font-serif text-2xl tracking-wider text-slate-600 md:text-3xl">{status}</h3>
		<h1 class="mx-auto mb-6 max-w-3xl font-serif text-4xl leading-tight font-light md:text-6xl">
			{#if status === 404}
				Hittar inte <span class="italic">det du</span><br />
				<span class="uppercase">Letade efter</span>
			{:else}
				Något gick <span class="italic">snett</span><br />
				<span class="uppercase">Försök igen</span>
			{/if}
		</h1>
		<p class="mx-auto mb-8 max-w-xl text-sm text-gray-600 md:text-base">
			{#if status === 404}
				Inlägget verkar ha flyttat, blivit borttaget – eller så skrev du kanske fel adress. Men
				lugn, det finns fler ord att utforska.
			{:else}
				Ett oväntat fel inträffade. Om det fortsätter kan du komma tillbaka lite senare. Under tiden
				kan du läsa något annat.
			{/if}
		</p>

		<div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
			<a
				href="/"
				class="inline-block rounded-full bg-black px-6 py-3 text-sm font-medium tracking-wide text-white transition hover:bg-gray-800"
			>
				← Till startsidan
			</a>
			<a
				href="/alla"
				class="inline-block rounded-full border border-black px-6 py-3 text-sm font-medium tracking-wide text-black transition hover:bg-black hover:text-white"
			>
				Utforska alla inlägg
			</a>
		</div>
	</section>
</main>

<style>
	.font-serif {
		font-family: ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif;
	}
</style>
