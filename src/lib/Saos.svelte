<script>
  import { onMount } from "svelte";
  import { createEventDispatcher } from 'svelte';

  export let animation = "none";
  export let animation_out = "none; opacity: 0";
  export let once = false;
  export let top = 0;
  export let bottom = 0;
  export let css_observer = "";
  export let css_animation = "";

  // cute litle reactive dispatch to get if is observing :3
  const dispatch = createEventDispatcher();
  $: dispatch('update', {'observing': observing});

  // be aware... he's looking...
  let observing = true;

  // for some reason the 'bind:this={box}' on div stops working after npm run build... so... workaround time >:|
  const countainer = `__saos-${Math.random()}__`;

  /// current in experimental support, no support for IE (only Edge)
  /// see more in: https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver
  function intersection_verify(box) {
    // bottom left top right
    const rootMargin = `${-bottom}px 0px ${-top}px 0px`;

    const observer = new IntersectionObserver(
      (entries) => {
        observing = entries[0].isIntersecting;
        if (observing && once) {
          observer.unobserve(box);
        }
      },
      {
        rootMargin,
      }
    );

    observer.observe(box);
    return () => observer.unobserve(box);
  }

  /// Fallback in case the browser not have the IntersectionObserver
  function bounding_verify(box) {
    const c = box.getBoundingClientRect();
    observing = c.top + top < window.innerHeight && c.bottom - bottom > 0;

    if (observing && once) {
      window.removeEventListener("scroll", verify);
    }

    window.addEventListener("scroll", bounding_verify);
    return () => window.removeEventListener("scroll", bounding_verify);
  }

  onMount(() => {
    // for some reason the 'bind:this={box}' on div stops working after npm run build... so... workaround time >:|
    const box = document.getElementById(countainer);

    if (IntersectionObserver) {
      return intersection_verify(box);
    } else {
      return bounding_verify(box);
    }
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
