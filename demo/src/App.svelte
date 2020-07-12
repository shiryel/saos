<script>
  import Animations from "./Animations.svelte";
</script>

<style>
  main {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: auto;
    justify-items: center;
    margin: 0 auto;
    background-image: linear-gradient(to bottom right, #61427A, #151019);
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

  aside {
    position: absolute;
    display: block;
    top: 0;
    right: 0;
    padding: 4em;
  }

  @media (min-width: 1000px) {
    aside {
      position: fixed;
      display: block;
      top: 0;
      right: 0;
      padding: 4em;
    }
  }
</style>

<aside>
  <a
    class="github-button"
    href="https://github.com/shiryel/saos"
    data-icon="octicon-star"
    data-size="large"
    aria-label="Star shiryel/saos on GitHub">
    Star
  </a>
</aside>
<main>
  <h1>SAoS</h1>
  <h2>Svelte Animation on Scroll</h2>
  <Animations />
  <footer>
    <section>
      <h3>SAoS</h3>
      <a
        class="github-button"
        href="https://github.com/shiryel/saos"
        data-color-scheme="no-preference: dark; light: dark; dark: dark;"
        data-size="large"
        aria-label="Star shiryel/saos on GitHub">
        Github
      </a>
      <a
        class="github-button"
        href="https://github.com/shiryel/saos/archive/master.zip"
        data-color-scheme="no-preference: dark; light: dark; dark: dark;"
        data-icon="octicon-download"
        data-size="large"
        aria-label="Download shiryel/saos on GitHub">
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
