<!-- Hero-bild -->
<section class="relative h-[50vh] w-full overflow-hidden">
	<img src="/hero-life.png" alt="Horisont" class="absolute inset-0 h-full w-full object-cover" />
	<div class="absolute inset-0 flex flex-col items-center justify-center bg-black/30 text-white">
		<h1
			class="py-36 pb-8 text-center font-serif text-4xl leading-tight italic md:m-0 md:pb-56 md:text-7xl"
		>
			Små steg med stora tankar
		</h1>
	</div>
</section>

<!-- Kortsektion under -->
<section
	class="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-end gap-6 px-6 md:grid-cols-3"
>
	<!-- Vänsterkort – Bild, visas endast på md och uppåt -->
	<div class="hidden h-full overflow-hidden rounded-lg bg-white pt-6 shadow-xl md:block">
		<img src="/hero-cloud.png" alt="Symbolbild" class=" h-full w-full rounded-lg object-cover" />
	</div>

	<!-- Högerkort – lyfts upp, men linjeras i botten -->
	<div
		class="-mt-44 flex flex-col justify-end gap-6 rounded-lg bg-white p-6 shadow-xl md:col-span-2 md:flex-row"
	>
		<!-- Textkolumn -->
		<div class="flex flex-1 flex-col justify-center">
			<span class="text-xs tracking-wide text-gray-500 uppercase">Välkommen</span>
			<h2 class="mt-2 font-serif text-2xl font-light md:text-3xl">Ord som inte behövde ropas.</h2>
			<p class="mt-4 space-y-3 text-gray-600">
				I ett hörn av det digitala bruset viskar den här bloggen.<br />
				Om det svåra, det enkla, det vackra. Här landar fragment av liv – utan filter, utan krav.
				<br />
				Ord som letar efter mening, men inte efter applåder.
				<br /><br />
				Här får tystnaden forma mening. Tankar får ta sin tid. Du kommer inte att mötas av lösningar
				– men kanske av något som känns igen.<br />
				Det du känner igen, får gärna stanna. Det du inte förstår, får finnas ändå.
			</p>

			<a
				href="/news"
				class="mt-6 inline-block rounded-full bg-black px-6 py-3 text-white transition hover:bg-gray-800"
			>
				Läs mer →
			</a>
		</div>

		<!-- Bildkolumn -->
		<div class="flex-1">
			<img
				src="/hero-write.png"
				alt="Symbolisk bild"
				class="h-full w-full rounded-md object-cover"
			/>
		</div>
	</div>
</section>
