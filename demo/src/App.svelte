<script>
  import Animations from "./Animations.svelte";
  import Particles from "particlesjs";
  import { onMount } from "svelte";

  onMount(() => {
    Particles.init({
      selector: ".particles",
      color: ["#DA0463", "#404B69", "#DBEDF3"],
      connectParticles: true,
      maxParticles: 100,
      responsive: [
        {
          breakpoint: 768,
          options: {
            maxParticles: 50,
            color: "#48F2E3",
            connectParticles: false,
          },
        },
        {
          breakpoint: 425,
          options: {
            maxParticles: 25,
            connectParticles: true,
          },
        },
        {
          breakpoint: 320,
          options: {
            maxParticles: 10,
            connectParticles: true,
          },
        },
      ],
    });
  });
</script>

<style>
  main {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: auto;
    justify-items: center;
    margin: 0 auto;
    overflow: hidden;
  }

  h1 {
    padding-top: 10%;
    color: white;
  }

  h2 {
    color: #adadad;
    padding: 3%;
    border-bottom: 1px solid white;
  }

  footer {
    margin-top: 3em;
    margin-bottom: 5em;
    background-color: rgb(21, 16, 25);
  }

  footer section {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: auto;
    justify-items: center;
  }

  h3 {
    color: white;
    font-size: 2em;
  }

  p {
    color: white;
    font-size: 1.2em;
  }

  code {
    color: white;
    font-size: 1.2em;
  }

  .particles {
    position: fixed;
    display: block;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgb(21, 16, 25);
    z-index: -1;
  }

  @media (min-width: 640px) {
  }
</style>

<main>
  <canvas class="particles" />
  <h1>SAoS</h1>
  <h2>Svelte Animation on Scroll</h2>
  <Animations />
  <footer>
    <section>
      <h3>SAoS</h3>
      <a href="https://github.com/shiryel/saos" target="_blank">Github</a>
      <a
        href="https://github.com/shiryel/saos/archive/master.zip"
        target="_blank">
        Download
      </a>
    </section>

    <section>
      <h3>Install via Yarn, Npm</h3>
      <p>yarn add saos</p>
      <p>npm i saos --save</p>
    </section>

    <section>
      <h3>How to use</h3>
      <p>
        Make your animation or (if you are lazy like me) get it from:
        <a href="https://animista.net/" target="_blank">animista</a>
      </p>
      <p>Add the -global- before the name, like:</p>
      <code>{'@keyframes -global-slide-out-fwd-center {'}</code>
      <p>And use it with Saos, like:</p>
      <code>
        {`<Saos animation={'from-left 2s cubic-bezier(0.35, 0.5, 0.65, 0.95) both'}>`}
      </code>
      <code>{`>>Your code here<<`}</code>
      <code>{`</Saos>`}</code>
      <p>
        See the
        <a href="https://github.com/shiryel/saos" target="_blank">README</a>
        for more examples
      </p>
    </section>
  </footer>
</main>
