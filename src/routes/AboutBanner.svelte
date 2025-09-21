<script lang="ts">
	let { title = 'Om bloggen /', heading = 'NÄR ORD FÅR VILA' } = $props();
</script>

<div class="mx-auto max-w-5xl md:-translate-y-20 md:-translate-y-28">
	<div class=" bg-black/90 px-8 py-10 text-gray-200 shadow-lg lg:rounded-md">
		<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
			<div class="flex items-center">
				<h3 class="font-serif text-3xl tracking-wider text-white md:col-span-1">{title}</h3>
			</div>
			<div class="md:col-span-2">
				<h4 class="mb-2 font-serif text-xl whitespace-pre-line text-white">{heading}</h4>
				<p class="mb-4 text-sm text-gray-300">
					En plats för ord som får ta tid. Tankar som andas långsamt – utan krav, utan fasader.
				</p>
				<p class="mb-4 text-sm text-gray-300">
					Här samsas vardagliga reflektioner med djupare känslor – ärliga, sårbara och hoppfulla.
					Små steg i text kan ibland bära de största tankarna. Och kanske, mellan raderna, hittar du
					något som också rör vid ditt eget liv.
				</p>
			</div>
		</div>
	</div>
</div>

<style>
	.font-serif {
		font-family: ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif;
	}
</style>
