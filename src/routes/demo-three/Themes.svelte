<script lang="ts">
	import Icon from 'heroicons-for-svelte';
	const items = [
		{
			icon: 'eye',
			title: 'Det som speglar',
			body: 'Ofta ser vi oss själva tydligast i det vi inte förstår.'
		},
		{
			icon: 'dots-horizontal',
			title: 'I mellanrummet',
			body: 'I pauserna föds de största insikterna.'
		},
		{
			icon: 'heart',
			title: 'Att få vara människa',
			body: 'Här behöver du inte prestera. Bara känna.'
		}
	];

	const circleColor = (i: number) =>
		i === 0 ? 'oklch(65% 0.16 50)' : i === 1 ? 'oklch(75% 0.09 150)' : 'oklch(40% 0.05 260)';
</script>

<section class="bg-white">
	<div class="mx-auto max-w-6xl px-6 py-16 text-center">
		<h2 class="mb-2 text-sm tracking-wide text-[color:oklch(45%_0.03_80)] uppercase">
			Tre små tankespår – som kanske följer dig längre än du anar.
		</h2>
		<p class="mb-10 font-serif text-2xl text-[color:oklch(22%_0.03_260)] md:text-3xl">
			Kanske är vi inte här för att förstå – utan för att känna.
		</p>

		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each items as { icon, title, body }, i}
				<div
					class="group rounded-2xl border border-[color:oklch(90%_0.03_80)] bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
				>
					<div class="mb-4 flex justify-center">
						<div
							class="grid h-12 w-12 place-items-center rounded-full transition-transform duration-300 group-hover:scale-110"
							style={`background-color: ${circleColor(i)}`}
						>
							<Icon name={icon} class="text-white opacity-90" style="font-size: 24px" />
						</div>
					</div>
					<h3 class="mb-3 font-serif text-xl text-[color:oklch(22%_0.03_260)]">{title}</h3>
					<p class="leading-relaxed text-[color:oklch(35%_0.03_260)]">{body}</p>
				</div>
			{/each}
		</div>
	</div>
</section>
