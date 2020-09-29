import { css } from 'lit-element';

export const maincss = css`
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
    max-height: 600px;
    min-height: 600px;
    max-width: 400px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    overflow: hidden;
    color: white;
  }

  /* Main Popup Top */

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

  .track {
    opacity: 0;
    visibility: hidden;
    transition-property: visibility, opacity;
    transition-delay: 0.5s, 0s;
    transition-duration: 0s, 0.5s;
    transition-timing-function: ease-in-out;
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
  }
  :host([temp_selection]) .track {
    visibility: visible;
    transition-delay: 0s, 0.5s;
    transition-duration: 0s, 0.5s;
    opacity: 1;
    /* transition-property: none; */
  }
  /* Animation upon exiting the thermostat */
  /* .popup-inner.temp-backed #thermostat {
    animation: 0.5s ease-in 0s 1 tempend;
  } */
  /* Make sure svg is not passed into mouseclick events */
  .btn-confirm svg,
  .btn-back svg {
    pointer-events: none;
  }

  :host([temp_selection]) .thermostat {
    flex: 0 0 444px;
    margin: 31px 0px 50px 0;
  }
  .tado-card-middle {
    box-shadow: rgba(100, 100, 100, 0.2) 0px 0px 30px;
    transition-property: flex, opacity;
    transition-delay: 0s;
    transition-duration: 0.5s;
    transition-timing-function: ease-in-out;
    will-change: transform;
    position: relative;
    max-width: 300px;
    height: 300px;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 75px;
    display: flex;
    flex-direction: column;
    flex: 0 1 300px;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    width: 100%;
  }
  :host([temp_selection]) .tado-card-middle {
    flex: 0 0 444px;
  }

  .thermostat_part_bottom {
    flex: 0 0 75px;
    width: 100%;
    opacity: 1;
    transition-property: flex, opacity;
    transition-delay: 0s;
    transition-duration: 1s;
    transition-timing-function: ease-in-out;
    overflow: hidden;
    position: relative;
  }

  :host([temp_selection]) .thermostat_part_bottom {
    opacity: 0;
    flex: 0 0 0px;
  }
  /* Main Thermostat Start */
  .thermostat_part_top {
    line-height: 75px;
    flex: 0 0 75px;
    text-align: center;
    width: 100%;
    transition-property: flex, opacity;
    transition-delay: 0s;
    transition-duration: 0.5s;
    transition-timing-function: ease-in-out;
    overflow: hidden;
  }

  :host([temp_selection]) .thermostat_part_top {
    opacity: 0;
    flex: 0 0 0px;
  }

  .thermostat_part_top_toolbar {
    padding: 18px;
    position: absolute;
    width: calc(100% - 36px);
    display: flex;
    justify-content: space-between;
  }

  .thermostat:hover {
    transform: scale(1.03);
  }
  .thermostat.mousedown {
    transform: scale(0.95);
  }
  .tado-card-top {
    flex: 0 0 100px;
    transition-property: flex, opacity;
    transition-delay: 0s;
    transition-duration: 0.5s;
    transition-timing-function: ease-in-out;
    display: inline-flex;
    width: 100%;
    justify-content: space-between;
    /* display: inline-flex; */
  }

  :host([temp_selection]) .tado-card-top {
    flex: 0 0 75px;
  }

  /* Animate Hide */
  :host([temp_selection]) .btn-confirm,
  :host([temp_selection]) .btn-back,
  :host([temp_selection]) .temperature_text,
  .maintemp {
    visibility: visible;
    opacity: 1;
    transition-property: visibility, opacity;
    transition-delay: 0s, 0.5s;
    transition-duration: 0s, 0.5s;
    transition-timing-function: ease-in-out;
  }
  /* Animate Reveal On Main */
  :host([temp_selection]) .maintemp {
    transition-property: visibility, opacity;
    transition-delay: 1s, 0s;
    visibility: hidden;
    opacity: 0;
  }
  /* Animate Hide On Main */
  .temperature_text,
  .btn-confirm,
  .btn-back {
    transition-property: visibility, opacity;
    transition-delay: 0.5s, 0s;
    visibility: hidden;
    opacity: 0;
  }

  .btn-confirm,
  .btn-back {
    pointer-events: none;
  }

  .maintemp {
    pointer-events: none;
  }
  .temperature_text {
    font-size: 48px;
    align-self: center;
    text-align: center;
    text-transform: uppercase;
    font-weight: 700;
  }
  :host([temp_selection]) .btn-confirm,
  :host([temp_selection]) .btn-back,
  :host([temp_selection]) .temperature_text {
    pointer-events: all;
  }

  :host([temp_selection]) .btn-confirm,
  :host([temp_selection]) .btn-back {
    margin: 20px;
    width: 28px;
    height: 28px;
  }
  /* Main Thermostat End */

  .thermostat_part_middle {
    flex: 0 0 150px;
    width: 100%;
    height: 100%;
    overflow: hidden;
    display: flex;
    font-size: 6rem;
    text-align: center;
    justify-content: center;
    flex-flow: column;
  }

  :host([temp_selection]) .thermostat__header {
    margin: 0px;
    flex: 0 0 0px;
  }

  .thermostat__header {
    line-height: 50px;
    flex: 0 0 50px;
    text-align: center;
  }

  :host([temp_selection]) .thermostat_part_middle {
    width: 300px;
    flex: 0 0 400px;
  }

  .body_temperature {
    flex: 0 0 150px;
    line-height: 190px;
    font-weight: 700;
    font-size: 5.5rem;
    text-align: center;
  }

  .body_heatreq_inner {
    flex: 0 0 100px;
    width: 24px;
    margin: 0px auto;
    transition-property: flex, margin;
    transition-delay: 0s;
    transition-duration: 0.5s;
    transition-timing-function: ease-in-out;
  }
  .body_heatreq_inner svg path {
    opacity: 0.38;
    fill: #fff;
  }

  :host([temp_heating~='heating_one']) .body_heatreq_inner svg path:nth-child(1) {
    opacity: 1;
  }
  :host([temp_heating~='heating_two']) .body_heatreq_inner svg path:nth-child(1),
  :host([temp_heating~='heating_two']) .body_heatreq_inner svg path:nth-child(2) {
    opacity: 1;
  }
  :host([temp_heating~='heating_three']) .body_heatreq_inner svg path:nth-child(1),
  :host([temp_heating~='heating_three']) .body_heatreq_inner svg path:nth-child(2),
  :host([temp_heating~='heating_three']) .body_heatreq_inner svg path:nth-child(3) {
    opacity: 1;
  }
  /* FOOTER START */

  /* Temp Overlay Start */
  :host([temp_overlay]) .thermostat_part_top {
    flex: 0 0 50px;
  }
  :host([temp_overlay]) .thermostat_part_middle {
    flex: 0 0 100px;
    font-size: 5.5em;
  }
  :host([temp_overlay]) .thermostat_part_bottom {
    flex: 0 0 150px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  :host([temp_overlay]) .body_heatreq_inner {
    flex: 0 0 50px;
    overflow: hidden;
    margin: 0 auto;
  }

  .thermostat__footer {
    flex: 0 0 0%;
    background-color: #fff;
    color: #213953;
    opacity: 0;
    transition-property: bottom, opacity;
    transition-delay: 0s, 0s;
    transition-duration: 250ms, 250ms;
    transition-timing-function: ease-in-out;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: fixed;
    width: 100%;
    padding: 0 0 26px 0;
    bottom: -100px;
  }

  :host([temp_overlay]) .thermostat__footer {
    opacity: 1;
    transition-duration: 1s, 1s;
    bottom: 0px;
  }

  .thermostat__footercontent {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-flow: column;
    height: 100%;
    padding: 1em;
  }
  .thermostat__footer_termination_content_text {
    text-align: center;
    padding: 10px;
    width: calc(100% - 20px);
  }

  /* FOOTER END */

  /* INFO START */
  :host([temp_selection]) .tado-card-bottom {
    flex: 0 0 0px;
    opacity: 0;
  }
  .tado-card-bottom {
    display: flex;
    flex-direction: row;
    flex: 0 0 200px;
    opacity: 1;
    transition-property: flex, opacity;
    transition-delay: 0s;
    transition-duration: 0.5s;
    transition-timing-function: ease-in-out;
  }
  .tado-card-bottom .temp {
    background-color: #67cd67;
    height: 60px;
    width: 60px;
    text-align: center;
    line-height: 60px;
    border-radius: 100%;
    color: #fff;
    font-size: 18px;
  }

  /* INFO END */

  /* INFO SENSORS START */
  :host([temp_selection]) .info_sensor_container {
    max-height: 0;
    opacity: 0;
    transition-delay: 0s, 0s;
    overflow: hidden;
  }
  .info_sensor_container {
    display: flex;
    align-items: center;
    max-height: 200px;
    opacity: 1;
    transition-property: max-height, opacity;
    transition-delay: 0s, 0s;
    transition-duration: 0.5s, 0.5s;
    transition-timing-function: ease-in-out;
  }
  .info_sensor {
    display: flex;
    align-items: center;
    flex-direction: column;
    width: 100px;
  }
  .info_sensor_label {
    font-size: 1rem;
    line-height: 3rem;
    font-weight: 300;
  }
  .info_sensor_value {
    font-size: 1.8rem;
    line-height: 1.8rem;
    font-weight: 700;
  }

  /* INFO SENSORS END */
`;
