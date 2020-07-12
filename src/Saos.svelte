<script>
  import { onMount } from "svelte";

  export let animation = "none";
  export let animation_out = "none; opacity: 0";
  export let once = false;
  export let top = 0;
  export let bottom = 0;
  export let css_observer = "";
  export let css_animation = "";

  let observing = true;
  // for some reason the 'bind:this={box}' on div stops working after npm run build... so... workaround time >:|
  const countainer = `__saos-${Math.random()}__`;

  onMount(() => {
    function verify() {
      // for some reason the 'bind:this={box}' on div stops working after npm run build... so... workaround time >:|
      const box = document.getElementById(countainer);
      const c = box.getBoundingClientRect();
      observing = c.top - top < window.innerHeight && c.bottom + bottom > 0;

      if (observing && once) {
        window.removeEventListener("scroll", verify);
      }
    }

    window.addEventListener("scroll", verify);

    return () => window.removeEventListener("scroll", verify);
  });
</script>

<div id={countainer} style={css_observer}>
  {#if observing}
    <div style="animation: {animation}; {css_animation}">
      <slot />
    </div>
  {:else}
    <div style="animation: {animation_out}; {css_animation}">
      <slot />
    </div>
  {/if}
</div>
