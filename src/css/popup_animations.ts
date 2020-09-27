import { css } from 'lit-element';

export const animation_styling = css`
  @keyframes popup_grow {
    0% {
      height: 540px;
    }
    100% {
      height: 600px;
    }
  }
  @keyframes popup_shrink {
    0% {
      height: 600px;
    }
    100% {
      height: 540px;
    }
  }

  @keyframes temp_slider_start {
    0% {
      height: 300px;
      top: -80px;
    }
    100% {
      height: 400px;
      top: 0px;
    }
  }
  @keyframes tempend {
    0% {
      /* min-height: 400px; */
      opacity: 0;
      transform: translate(0%, 10%);
    }
    100% {
      /* min-height: 300px; */
      opacity: 1;
      transform: translate(0%, 0%);
    }
  }

  @keyframes track_fadein {
    0% {
      opacity: 0;
      transform: translate(0%, 500%);
    }
    50% {
      opacity: 0.5;
      transform: translate(0%, 200%);
    }
    75% {
      opacity: 1;
      transform: translate(0%, 50%);
    }
    85% {
      opacity: 1;
      transform: translate(0%, 20%);
    }
    100% {
      opacity: 1;
      transform: translate(0%, 0%);
    }
  }
`;
