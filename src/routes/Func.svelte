<script lang="ts">
	const fcns = {
		"sin": Math.sin,
		"cos": Math.cos,
	};
	let factor = 1;
	let fcn: keyof typeof fcns = "sin";
	let theta = 1;
	let offset = 0;
	export let func: (x: number) => number;
	$: func = (x: number) => factor*(fcns[fcn](theta * x + offset));
</script>

<p>
  <input bind:value={factor} type="number" size="3"/>
	<select bind:value={fcn} id="fcn">
		{#each Object.keys(fcns) as fcn}
		  <option value="{fcn}">{fcn}</option>
		{/each}
	</select>
	(
	<input bind:value={theta} type="number" size="3"/>
	&theta; +
	<input bind:value={offset} type="number" size="3"/>
	&deg;)
</p>
