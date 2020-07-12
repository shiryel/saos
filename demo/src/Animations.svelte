<script>
  import Saos from "saos";
</script>

<style>
  section {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-around;
    margin: 0 auto;
    max-width: 800px;
    overflow-x: visible;
  }

  div {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-items: center;
    justify-content: space-around;
    width: 300px;
    height: 300px;
    margin-top: 50%;
    border: 4px solid white;
    border-radius: 5px;
    padding: 1em;
    background-color: #333;
  }

  p {
    color: white;
    text-align: center;
  }

  div > p:nth-child(2) {
    text-align: start;
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

  /* ----------------------------------------------
 * Animations below by Animista on 2020-7-11
 * Licensed under FreeBSD License.
 * See http://animista.net/license for more info. 
 * w: http://animista.net, t: @cssanimista
 * ---------------------------------------------- */

  @keyframes -global-scale-in-center {
    0% {
      transform: scale(0);
      opacity: 1;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes -global-rotate-in-center {
    0% {
      transform: rotate(-360deg);
      opacity: 0;
    }
    100% {
      transform: rotate(0);
      opacity: 1;
    }
  }

  @keyframes -global-slide-in-top {
    0% {
      transform: translateY(-1000px);
      opacity: 0;
    }
    100% {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes -global-slide-in-fwd-tr {
    0% {
      transform: translateZ(-1200px) translateY(-700px) translateX(500px);
      opacity: 0;
    }
    100% {
      transform: translateZ(0) translateY(0) translateX(0);
      opacity: 1;
    }
  }

  @keyframes -global-slide-in-elliptic-top-fwd {
    0% {
      transform: translateY(-600px) rotateX(-30deg) scale(0);
      transform-origin: 50% 100%;
      opacity: 0;
    }
    100% {
      transform: translateY(0) rotateX(0) scale(1);
      transform-origin: 50% 1400px;
      opacity: 1;
    }
  }

  @keyframes -global-roll-in-left {
    0% {
      transform: translateX(-800px) rotate(-540deg);
      opacity: 0;
    }
    100% {
      transform: translateX(0) rotate(0deg);
      opacity: 1;
    }
  }

  @keyframes -global-roll-in-blurred-left {
    0% {
      transform: translateX(-1000px) rotate(-720deg);
      filter: blur(50px);
      opacity: 0;
    }
    100% {
      transform: translateX(0) rotate(0deg);
      filter: blur(0);
      opacity: 1;
    }
  }

  @keyframes -global-tilt-in-fwd-tr {
    0% {
      transform: rotateY(20deg) rotateX(35deg) translate(300px, -300px)
        skew(-35deg, 10deg);
      opacity: 0;
    }
    100% {
      transform: rotateY(0) rotateX(0deg) translate(0, 0) skew(0deg, 0deg);
      opacity: 1;
    }
  }

  @keyframes -global-swing-in-top-fwd {
    0% {
      transform: rotateX(-100deg);
      transform-origin: top;
      opacity: 0;
    }
    100% {
      transform: rotateX(0deg);
      transform-origin: top;
      opacity: 1;
    }
  }

  @keyframes -global-puff-in-center {
    0% {
      transform: scale(2);
      filter: blur(4px);
      opacity: 0;
    }
    100% {
      transform: scale(1);
      filter: blur(0px);
      opacity: 1;
    }
  }

  @keyframes -global-fade-in {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  /* EXITS */
  @keyframes -global-scale-out-center {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    100% {
      transform: scale(0);
      opacity: 1;
    }
  }

  @keyframes -global-rotate-out-center {
    0% {
      transform: rotate(0);
      opacity: 1;
    }
    100% {
      transform: rotate(-360deg);
      opacity: 0;
    }
  }

  @keyframes -global-rotate-out-2-cw {
    0% {
      transform: rotate(0);
      opacity: 1;
    }
    100% {
      transform: rotate(45deg);
      opacity: 0;
    }
  }

  @keyframes -global-swirl-out-bck {
    0% {
      transform: rotate(0) scale(1);
      opacity: 1;
    }
    100% {
      transform: rotate(-540deg) scale(0);
      opacity: 0;
    }
  }

  @keyframes -global-flip-out-hor-top {
    0% {
      transform: rotateX(0);
      opacity: 1;
    }
    100% {
      transform: rotateX(70deg);
      opacity: 0;
    }
  }

  @keyframes -global-slide-out-top {
    0% {
      transform: translateY(0);
      opacity: 1;
    }
    100% {
      transform: translateY(-1000px);
      opacity: 0;
    }
  }

  @keyframes -global-slide-out-fwd-center {
    0% {
      transform: translateZ(1);
      opacity: 1;
    }
    100% {
      transform: translateZ(600px);
      opacity: 0;
    }
  }

  @keyframes -global-slide-out-elliptic-top-bck {
    0% {
      transform: translateY(0) rotateX(0) scale(1);
      transform-origin: 50% 1400px;
      opacity: 1;
    }
    100% {
      transform: translateY(-600px) rotateX(-30deg) scale(0);
      transform-origin: 50% 100%;
      opacity: 1;
    }
  }
</style>

<section>
  <Saos animation={'from-left 2s cubic-bezier(0.35, 0.5, 0.65, 0.95) both'}>
    <div>
      <p>
        From Left
        <br />
        (Repeat)
      </p>
      <p>
        {`animation={'from-left 2s cubic-bezier(0.35, 0.5, 0.65, 0.95) both'}`}
      </p>
    </div>
  </Saos>

  <Saos
    once={true}
    animation={'from-left 2s cubic-bezier(0.35, 0.5, 0.65, 0.95) both'}>
    <div>
      <p>
        From Left
        <br />
        (No Repeat)
      </p>
      <p>
        {`once={true}`}
        <br />
        {`animation={'from-left 2s cubic-bezier(0.35, 0.5, 0.65, 0.95) both'}`}
      </p>
    </div>
  </Saos>

  <Saos
    animation={'scale-in-center 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both'}>
    <div>
      <p>Scale In Center</p>
      <p>
        {`animation={'scale-in-center 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both'}`}
      </p>
    </div>
  </Saos>

  <Saos
    animation={'rotate-in-center 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both'}>
    <div>
      <p>Rotate In Center</p>
      <p>
        {`animation={'rotate-in-center 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both'}`}
      </p>
    </div>
  </Saos>

  <Saos
    animation={'slide-in-top 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both'}>
    <div>
      <p>Slide In Top</p>
      <p>
        {`animation={'slide-in-top 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both'}`}
      </p>
    </div>
  </Saos>

  <Saos
    animation={'slide-in-fwd-tr 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both'}
    animation_out={'scale-out-center 0.5s cubic-bezier(0.550, 0.085, 0.680, 0.530) both'}
    top={400}
    bottom={400}>
    <div>
      <p>
        Slide in Fwd / scale Out Center
        <br />
        (400 top/bottom)
      </p>
      <p>
        {`animation={'slide-in-fwd-tr 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both'}`}
        <br>
        {`
        animation_out={'scale-out-center 0.5s cubic-bezier(0.550, 0.085, 0.680, 0.530) both'}`}
        <br>
        {`top={400}`}
        <br>
        {`bottom={400}`}
      </p>
    </div>
  </Saos>

  <Saos
    animation={'slide-in-elliptic-top-fwd 0.7s cubic-bezier(0.250, 0.460, 0.450, 0.940) both'}
    animation_out={'rotate-out-center 0.6s cubic-bezier(0.550, 0.085, 0.680, 0.530) both'}
    top={400}
    bottom={400}>
    <div>
      <p>
        Slide in Elliptic / Rotate Out Center
        <br />
        (400 top/bottom)
      </p>
      <p>
        {`animation={'slide-in-elliptic-top-fwd 0.7s cubic-bezier(0.250, 0.460, 0.450, 0.940) both'}`}
        <br>{`
        animation_out={'rotate-out-center 0.6s cubic-bezier(0.550, 0.085, 0.680, 0.530) both'}`}
        <br>
        {`
        top={400}`}
        <br>
        {`bottom={400}`}
      </p>
    </div>
  </Saos>

  <Saos
    animation={'roll-in-left 0.6s ease-out both'}
    animation_out={'rotate-out-2-cw 0.6s cubic-bezier(0.250, 0.460, 0.450, 0.940) both'}
    top={400}
    bottom={400}>
    <div>
      <p>
        Roll In Left / Rotate Out
        <br />
        (400 top/bottom)
      </p>
      <p>
        {`animation={'roll-in-left 0.6s ease-out both'}`}
        <br>
        {`animation_out={'rotate-out-2-cw 0.6s cubic-bezier(0.250, 0.460, 0.450, 0.940) both'}`}
        <br>
        {`top={400}`}
        <br>
        {`bottom={400}`}
      </p>
    </div>
  </Saos>

  <Saos
    animation={'roll-in-blurred-left 0.65s cubic-bezier(0.230, 1.000, 0.320, 1.000) both'}
    animation_out={'swirl-out-bck 0.6s ease-in both'}
    top={400}
    bottom={400}>
    <div>
      <p>
        Roll In Blurred / Swirl Out Bck
        <br />
        (400 top/bottom)
      </p>
      <p>
        {`animation={'roll-in-blurred-left 0.65s cubic-bezier(0.230, 1.000, 0.320, 1.000) both'}`}
        <br>
        {`animation_out={'swirl-out-bck 0.6s ease-in both'}`}
        <br>
        {`top={400}`}
        <br>
        {`bottom={400}`}
      </p>
    </div>
  </Saos>

  <Saos
    animation={'tilt-in-fwd-tr 0.6s cubic-bezier(0.250, 0.460, 0.450, 0.940) both'}
    animation_out={'flip-out-hor-top 0.45s cubic-bezier(0.550, 0.085, 0.680, 0.530) both'}
    top={400}
    bottom={400}>
    <div>
      <p>
        Tilt In Fwd / Flip Out Hor Top
        <br />
        (400 top/bottom)
      </p>
      <p>
        {`animation={'tilt-in-fwd-tr 0.6s cubic-bezier(0.250, 0.460, 0.450, 0.940) both'}`}
        <br>
        {`animation_out={'flip-out-hor-top 0.45s cubic-bezier(0.550, 0.085, 0.680, 0.530) both'}`}
        <br>
        {`top={400}`}
        <br>
        {`bottom={400}`}
      </p>
    </div>
  </Saos>

  <Saos
    animation={'swing-in-top-fwd 0.5s cubic-bezier(0.175, 0.885, 0.320, 1.275) both'}
    animation_out={'slide-out-top 0.5s cubic-bezier(0.550, 0.085, 0.680, 0.530) both'}
    top={400}
    bottom={400}>
    <div>
      <p>
        Swing in Top / Slide Out Top
        <br />
        (400 top/bottom)
      </p>
      <p>
        {`animation={'swing-in-top-fwd 0.5s cubic-bezier(0.175, 0.885, 0.320, 1.275) both'}`}
        <br>
        {`animation_out={'slide-out-top 0.5s cubic-bezier(0.550, 0.085, 0.680, 0.530) both'}`}
        <br>
        {`top={400}`}
        <br>
        {`bottom={400}>`}
      </p>
    </div>
  </Saos>

  <Saos
    animation={'fade-in 1.2s cubic-bezier(0.390, 0.575, 0.565, 1.000) both'}
    animation_out={'slide-out-fwd-center 0.7s cubic-bezier(0.550, 0.085, 0.680, 0.530) both'}
    top={400}
    bottom={400}>
    <div>
      <p>
        Fade In / Slide Out
        <br />
        (400 top/bottom)
      </p>
      <p>
        {`animation={'fade-in 1.2s cubic-bezier(0.390, 0.575, 0.565, 1.000) both'}`}
        <br>
        {`animation_out={'slide-out-fwd-center 0.7s cubic-bezier(0.550, 0.085, 0.680, 0.530) both'}`}
        <br>
        {`top={400}`}
        <br>
        {`bottom={400}`}
      </p>
    </div>
  </Saos>

  <Saos
    animation={'puff-in-center 0.7s cubic-bezier(0.470, 0.000, 0.745, 0.715) both'}
    animation_out={'slide-out-elliptic-top-bck 0.7s ease-in both'}
    top={400}
    bottom={400}>
    <div>
      <p>
        Puff In Center / Slide Out Elliptic Top
        <br />
        (400 top/bottom)
      </p>
      <p>
        {`animation={'puff-in-center 0.7s cubic-bezier(0.470, 0.000, 0.745, 0.715) both'}`}
        <br>
        {`animation_out={'slide-out-elliptic-top-bck 0.7s ease-in both'}`}
        <br>
        {`top={400}`}
        <br>
        {`bottom={400}`}
      </p>
    </div>
  </Saos>
</section>
