<script lang="ts">
	let { src = '/header-bg.jpg', alt = 'Banner' } = $props();
</script>

<div class="z-10">
	<div class="aspect-video w-full overflow-hidden md:aspect-[21/6]">
		<img class="z-10 h-full w-full object-cover" {src} {alt} />
	</div>
</div>
