import { css } from 'lit-element';

export const thermostat_styling = css`
  /* :host {
    --heat-color: #ee7600;
    --manual-color: #44739e;
    --off-color: lightgrey;
    --fan_only-color: #8a8a8a;
    --dry-color: #efbd07;
    --idle-color: #00cc66;
    --unknown-color: #bac;
  } */
  :host *:focus {
    outline: -webkit-focus-ring-color auto 0px;
  }

  .popup-inner {
    max-width: 400px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    overflow: hidden;
  }
  .popup-inner.settemp {
    /* animation: 0.5s ease-out 0s 1 popup_grow; */
  }
  .popup-inner.backed {
    /* animation: 0.5s ease-out 0s 1 popup_shrink; */
  }

  /* Main Popup Top */

  .popup-inner {
    color: white;
    display: flex;
    flex-direction: column;
  }
  /* Thermostat Colors START */
  .popup-inner.temp-off {
    background: linear-gradient(rgb(159, 179, 194), rgb(104, 131, 150));
  }
  .popup-inner.temp-5 {
    background: linear-gradient(rgb(60, 150, 114), rgb(60, 134, 139));
  }
  .popup-inner.temp-6 {
    background: linear-gradient(rgb(60, 153, 115), rgb(57, 139, 142));
  }
  .popup-inner.temp-7 {
    background: linear-gradient(rgb(60, 158, 116), rgb(54, 144, 143));
  }
  .popup-inner.temp-8 {
    background: linear-gradient(rgb(61, 162, 117), rgb(51, 147, 142));
  }
  .popup-inner.temp-9 {
    background: linear-gradient(rgb(61, 166, 117), rgb(48, 149, 140));
  }
  .popup-inner.temp-10 {
    background: linear-gradient(rgb(61, 170, 118), rgb(45, 152, 138));
  }
  .popup-inner.temp-11 {
    background: linear-gradient(rgb(62, 174, 118), rgb(42, 154, 135));
  }
  .popup-inner.temp-12 {
    background: linear-gradient(rgb(62, 178, 119), rgb(40, 157, 132));
  }
  .popup-inner.temp-13 {
    background: linear-gradient(rgb(62, 182, 119), rgb(37, 159, 129));
  }
  .popup-inner.temp-14 {
    background: linear-gradient(rgb(62, 187, 119), rgb(34, 162, 125));
  }
  .popup-inner.temp-15 {
    background: linear-gradient(rgb(62, 191, 119), rgb(31, 164, 120));
  }
  .popup-inner.temp-16 {
    background: linear-gradient(rgb(63, 194, 119), rgb(28, 166, 116));
  }
  .popup-inner.temp-17 {
    background: linear-gradient(rgb(66, 196, 120), rgb(26, 169, 110));
  }
  .popup-inner.temp-18 {
    background: linear-gradient(rgb(68, 198, 120), rgb(23, 171, 105));
  }
  .popup-inner.temp-19 {
    background: linear-gradient(rgb(255, 208, 0), rgb(255, 187, 0));
  }
  .popup-inner.temp-20 {
    background: linear-gradient(rgb(255, 197, 0), rgb(255, 170, 0));
  }
  .popup-inner.temp-21 {
    background: linear-gradient(rgb(255, 186, 0), rgb(255, 153, 0));
  }
  .popup-inner.temp-22 {
    background: linear-gradient(rgb(255, 174, 0), rgb(255, 136, 0));
  }
  .popup-inner.temp-23 {
    background: linear-gradient(rgb(255, 163, 0), rgb(255, 119, 0));
  }
  .popup-inner.temp-24 {
    background: linear-gradient(rgb(255, 152, 0), rgb(255, 102, 0));
  }
  .popup-inner.temp-25 {
    background: linear-gradient(rgb(255, 140, 0), rgb(255, 85, 0));
  }
  /* Thermostat Colors END */

  .thermostat__header_and_body {
    display: flex;
    flex-direction: column;
    height: 100%;
    position: absolute;
    width: 100%;
  }
  .thermostat__header_and_body {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  .thermostat__header_and_body[role='button'] {
    cursor: pointer;
  }

  .btn {
    display: inline-block;
    color: #fff;
    font-size: 0.9em;
    text-decoration: none;
    text-align: left;
    line-height: 2.5;
    padding: 0 1.5em;
    border-radius: 1.25em;
    border: none;
    transition: background-color 0.1s ease, box-shadow 0.15s ease;
  }

  .btn--cancel {
    color: rgb(33, 57, 83);
    border: 1px solid rgb(33, 57, 83);
    text-align: center;
    background-color: rgb(255, 255, 255);
    width: 40%;
    margin: 0px auto;
  }

  /* Temperature Slider */

  .panel-btn {
    width: 2em;
    height: 2em;
    border-radius: 2em;
    fill: hsla(0, 0%, 100%, 0.2);
  }
  .temperature_text {
    font-size: 48px;
    align-self: center;
    text-align: center;
    text-transform: uppercase;
    font-weight: 700;
  }

  input[type='range'] {
    background-color: transparent;
    -webkit-appearance: none;
    transform: rotate(-90deg);
    -ms-writing-mode: bt-lr;
    writing-mode: bt-lr;
    position: absolute;
    top: 0px;
  }
  input[type='range']::-webkit-slider-thumb {
    -webkit-appearance: none;
    border: 1px solid #000000;
    height: 36px;
    width: 16px;
    border-radius: 3px;
    background: #ffffff;
    cursor: pointer;
    margin-top: -14px; /* You need to specify a margin in Chrome, but in Firefox and IE it is automatic */
    box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d; /* Add cool effects to your sliders! */
    visibility: hidden;
  }

  /* All the same stuff for Firefox */
  input[type='range']::-moz-range-thumb {
    box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
    border: 1px solid #000000;
    height: 36px;
    width: 16px;
    border-radius: 3px;
    background: #ffffff;
    cursor: pointer;
    visibility: hidden;
  }

  /* All the same stuff for IE */
  input[type='range']::-ms-thumb {
    box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
    border: 1px solid #000000;
    height: 36px;
    width: 16px;
    border-radius: 3px;
    background: #ffffff;
    cursor: pointer;
    visibility: hidden;
  }

  /* app-toolbar {
    color: var(--primary-text-color);
    background-color: linear-gradient(rgb(159, 179, 194), rgb(104, 131, 150));
  } */
  /* Main Popup Top */
`;
