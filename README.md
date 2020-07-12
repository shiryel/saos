# Svelte Animation on Scroll

## Examples
```html
<script>
  import Saos from "./test.svelte";
</script>

<main>
  <Saos once={false} animation={"from-left 4s cubic-bezier(0.35, 0.5, 0.65, 0.95) both"}>
    <div class="a"><p>once: false, animation: from-left</p></div>
  </Saos>
  <Saos once={false} animation={"from-left 4s cubic-bezier(0.35, 0.5, 0.65, 0.95) both"}>
    <div class="b"><p>once: false, animation: from-left</p></div>
  </Saos>
  <Saos once={false} animation={"from-left 4s cubic-bezier(0.35, 0.5, 0.65, 0.95) both"}>
    <div class="c"><p>once: true, animation: from-left</p></div>
  </Saos>
  <Saos animation={"from-left 4s cubic-bezier(0.35, 0.5, 0.65, 0.95) both"}>
    <div class="d"><p>once: true, animation: from-left</p></div>
  </Saos>
  <Saos animation={"from-left 4s cubic-bezier(0.35, 0.5, 0.65, 0.95) both"}>
    <div class="e"><p>test c</p></div>
  </Saos>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
    height: 100%;
    align-content: center;
	}
  
  @keyframes -global-from-left {
    0% {
      transform: rotateX(50deg) translateX(-200vw) skewX(-50deg);
      opacity: 1;
    }
    100% {
      transform: rotateX(0deg) translateX(0) skewX(0deg);
      opacity: 1;
    }
  }

  .a {
    background-color: blue;
  }

  .b {
    background-color: grey;
  }

  .c {
    background-color: red;
  }

  .d {
    background-color: #712B2B;
  }

  .e {
    background-color: #5F5796;
  }

  div {
    width: 500px;
    height: 400px;
  }

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
```
