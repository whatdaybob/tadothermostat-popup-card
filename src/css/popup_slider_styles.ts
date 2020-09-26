import { css } from 'lit-element';

export const slider_styling = css`
  .track {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="450" height="472" viewBox="0 0 450 472" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M199 22L0 22L3.93402e-05 472L450 472L450 22H251C251 36.3594 239.359 48 225 48C210.641 48 199 36.3594 199 22Z"    fill="white"  /><path fill-rule="evenodd" clip-rule="evenodd" d="M203 22C203 9.84974 212.85 0 225 0C237.15 0 247 9.84974 247 22C247 34.1503 237.15 44 225 44C212.85 44 203 34.1503 203 22ZM220 12L218.5 10.5L225 4L231.5 10.5L230 12L225 7L220 12ZM231.5 33.5L230 32L225 37L220 32L218.5 33.5L225 40L231.5 33.5Z"    fill="white"  /></svg>');
    background-position: center 0;
    background-repeat: no-repeat;
    background-clip: padding-box;
    padding: 22px 0 0;
    box-sizing: content-box;
    animation: 1s ease-out 0s 1 track_fadein;
  }
  /* Animation upon exiting the thermostat */
  .popup-inner.backed #thermostat {
    animation: 0.5s ease-in 0s 1 tempend;
  }
  /* Make sure svg is not passed into mouseclick events */
  .btn-confirm svg,
  .btn-back svg {
    pointer-events: none;
  }
`;
