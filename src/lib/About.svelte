<script lang="ts">
	import { Eye, Waves, Feather } from '@lucide/svelte';

	const thoughts = [
		{
			title: 'Det som speglar',
			body: 'Ofta ser vi oss själva tydligast i det vi inte förstår. Det okända är inte farligt – bara ovant.',
			icon: Eye
		},
		{
			title: 'I mellanrummet',
			body: 'Mellan meningar, i tystnadens paus, föds ibland de största insikterna. Det som inte sägs – bär också värde.',
			icon: Waves
		},
		{
			title: 'Att få vara människa',
			body: 'Här behöver du inte prestera. Bara känna. Tänka. Vara. Det räcker. Det har alltid räckt.',
			icon: Feather
		}
	];
</script>

<section class="bg-gray-50 px-6 py-20 lg:px-0">
	<div class="mx-auto max-w-6xl text-center">
		<span class="mb-2 text-sm tracking-wide text-gray-500 uppercase">
			Tre små tankespår – som kanske följer dig längre än du anar.
		</span>
		<h2 class="mb-12 font-serif text-2xl font-light text-gray-900 md:text-3xl">
			Kanske är vi inte här för att förstå – utan för att känna.
		</h2>

		<div class="grid grid-cols-1 gap-8 md:grid-cols-3">
			{#each thoughts as { title, body, icon }}
				<div class="p-6 text-center">
					<div class="mb-4 flex justify-center">
						<svelte:component
							this={icon}
							class="mx-auto mb-3 h-12 stroke-orange-300 transition-transform duration-300 hover:scale-110"
						/>
					</div>
					<h3 class="mb-3 font-serif text-lg text-gray-900 uppercase">{title}</h3>
					<p class="text-base leading-relaxed text-gray-600">{body}</p>
				</div>
			{/each}
		</div>
	</div>
</section>
