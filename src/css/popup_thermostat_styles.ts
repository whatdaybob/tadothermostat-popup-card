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
    animation: 0.5s ease-out 0s 1 popup_grow;
  }
  .popup-inner.backed {
    animation: 0.5s ease-out 0s 1 popup_shrink;
  }

  .popup-inner.off {
    display: none;
  }
  #settings {
    display: none;
  }
  .settings-inner {
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  }
  #settings.on {
    display: flex;
  }
  .settings-btn {
    position: absolute;
    right: 30px;
    background-color: #7f8082;
    color: #fff;
    border: 0;
    padding: 5px 20px;
    border-radius: 10px;
    font-weight: 500;
    cursor: pointer;
  }
  .settings-btn.bottom {
    bottom: 15px;
  }
  .settings-btn.top {
    top: 25px;
  }
  .settings-btn.bottom.fullscreen {
    margin: 0;
  }
  .fullscreen {
    margin-top: -64px;
  }
  .info {
    display: flex;
    flex-direction: row;
    margin-bottom: 40px;
    height: 100px;
  }
  .info .temp {
    background-color: #67cd67;
    height: 60px;
    width: 60px;
    text-align: center;
    line-height: 60px;
    border-radius: 100%;
    color: #fff;
    font-size: 18px;
  }

  .info .temp.heat_cool {
    background-color: var(--auto-color);
  }
  .info .temp.cool {
    background-color: var(--cool-color);
  }
  .info .temp.heat {
    background-color: var(--heat-color);
  }
  .info .temp.manual {
    background-color: var(--manual-color);
  }
  .info .temp.off {
    background-color: var(--off-color);
  }
  .info .temp.fan_only {
    background-color: var(--fan_only-color);
  }
  .info .temp.eco {
    background-color: var(--eco-color);
  }
  .info .temp.dry {
    background-color: var(--dry-color);
  }
  .info .temp.idle {
    background-color: var(--idle-color);
  }
  .info .temp.unknown-mode {
    background-color: var(--unknown-color);
  }

  .info .right {
    display: flex;
    flex-direction: column;
    margin-left: 15px;
    height: 60px;
    align-items: center;
    justify-content: center;
  }
  .info .right .name {
    color: #fff;
    font-size: 24px;
  }
  .info .right .action {
    color: #8b8a8f;
    font-size: 12px;
  }

  /* CONTROLS */

  .heat_cool {
    --mode-color: var(--auto-color);
  }
  .cool {
    --mode-color: var(--cool-color);
  }
  .heat {
    --mode-color: var(--heat-color);
  }
  .manual {
    --mode-color: var(--manual-color);
  }
  .off {
    --mode-color: var(--off-color);
  }
  .fan_only {
    --mode-color: var(--fan_only-color);
  }
  .eco {
    --mode-color: var(--eco-color);
  }
  .dry {
    --mode-color: var(--dry-color);
  }
  .idle {
    --mode-color: var(--idle-color);
  }
  .unknown-mode {
    --mode-color: var(--unknown-color);
  }
  #controls {
    display: flex;
    justify-content: center;
    /* padding: 16px; */
    position: relative;
    /* width: 500px; */
    width: 100%;
  }
  /* #slider {
    height: 100%;
    width: 100%;
    position: relative;
    max-width: 300px;
    min-width: 250px;
  }
  round-slider {
    --round-slider-path-color: var(--disabled-text-color);
    --round-slider-bar-color: var(--mode-color);
    padding-bottom: 10%;
  }
  #slider-center {
    position: absolute;
    width: calc(100% - 120px);
    height: calc(100% - 120px);
    box-sizing: border-box;
    border-radius: 100%;
    left: 60px;
    top: 60px;
    text-align: center;
    overflow-wrap: break-word;
    pointer-events: none;
  } */

  /* .values {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
  }
  .values .action {
    color: #f4b941;
    font-size: 10px;
    text-transform: uppercase;
  }
  .values .value {
    color: #fff;
    font-size: 60px;
    line-height: 60px;
  }

  #modes > * {
    color: var(--disabled-text-color);
    cursor: pointer;
    display: inline-block;
  }
  #modes .selected-icon {
    --iron-icon-fill-color: var(--mode-color);
  } */
  text {
    color: var(--primary-text-color);
  }
  /* Bottom Card Sensors Panel */
  .sensors-container {
    min-height: 64px;
    display: flex;
    flex: 1 1 120px;
    align-items: center;
    overflow: hidden;
  }
  .sensors {
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    width: 100%;
  }
  .sensor {
    display: flex;
    align-items: center;
    flex-direction: column;
    width: 100px;
  }
  .sensor__label {
    font-size: 0.85em;
    opacity: 0.6;
    text-transform: uppercase;
    height: 2em;
    display: flex;
    text-align: center;
    align-items: center;
  }
  .sensor__value .b-temperature,
  .sensor__value .b-humidity {
    font-size: 2rem;
    line-height: 2rem;
    font-weight: 700;
  }
  /* Main Popup Top */
  .thermostat__body .b-temperature {
    font-weight: 700;
  }

  .popup-inner {
    color: white;
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
  .tado-card {
    display: flex;
    flex-direction: column;
    flex: 1 1 400px;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    width: 100%;
  }

  .room-thermostat-area:hover,
  .room-thermostat-area--slider:hover {
    transform: scale(1.03);
  }
  .room-thermostat-area.mousedown {
    transform: scale(0.95);
  }
  .room-thermostat-area {
    background-color: hsla(0, 0%, 100%, 0.2);
    box-shadow: 0 0 30px hsla(0, 0%, 39.2%, 0.2);
    transition: transform 0.15s ease, box-shadow 0.15s ease, flex-basis 0.3s ease-out;
    will-change: transform;
    flex: 0 1 300px;
    position: relative;
    width: 100%;
    max-width: 300px;
    height: 300px;
    margin-top: 30px;
    background-color: hsla(0, 0%, 100%, 0.1);
    border-radius: 75px;
    overflow: hidden;
  }
  .thermostat {
    height: 100%;
    display: flex;
    flex-flow: column nowrap;
    text-align: center;
  }
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
  .thermostat__header {
    flex-basis: 0;
    height: 0;
    position: relative;
    top: 14px;
    opacity: 0.6;
    transition: height 0.3s ease-in-out, top 0.3s ease-in-out, padding-top 0.3s ease-in-out;
  }

  :host([temp_overlay]) .thermostat__body {
    font-size: 5.5em;
  }

  .thermostat__body {
    position: relative;
    font-size: 6em;
    overflow: hidden;
    flex-basis: 100%;
    display: flex;
    flex-flow: column;
    justify-content: center;
    align-items: center;
    transition-property: width; /* Apply transition effect on the width */
    transition-duration: 1s; /* Transition will last 1 second */
    transition-timing-function: linear; /* Timing function to specify a linear transition type */
    transition-delay: 0s; /* Transition starts after 1 second */
  }
  :host([temp_overlay]) .thermostat__footer {
    display: block;
    flex: 0 0 35%;
  }
  .thermostat__footer {
    display: none;
    background-color: #fff;
    color: #213953;
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
    color: #213953;
    border: 1px solid #213953;
    text-align: center;
    background-color: #fff;
    min-width: 144px;
    margin-bottom: 10px;
  }

  :host([temp_overlay]) .app-heat-request-indicator {
    bottom: 20px;
  }
  .app-heat-request-indicator {
    position: absolute;
    display: inline-flex;
    bottom: 33px;
  }
  .app-heat-request-indicator svg path {
    opacity: 0.38;
    fill: #fff;
  }
  /* Temperature Slider */
  .tado-card--slider {
    flex: 0 1 400px;
    background-color: hsla(0, 0%, 100%, 0.2);
    box-shadow: 0 0 30px hsla(0, 0%, 39.2%, 0.2);
    /* transition: transform 0.15s ease, box-shadow 0.15s ease, flex-basis 0.3s ease-out; */
    /* will-change: transform; */
    width: 100%;
    /* max-height: 120px; */
    overflow: hidden;
    min-height: 600px;
  }

  .temperature-slider--header {
    /* position: absolute; */
    /* left: 0; */
    /* right: 0; */
    /* top: 0; */
    height: 120px;
    display: flex;
  }
  .temperature-slider--toolbar {
    padding: 18px;
    position: absolute;
    width: calc(100% - 36px);
    display: flex;
    justify-content: space-between;
  }
  .panel-btn {
    width: 2em;
    height: 2em;
    border-radius: 2em;
    fill: hsla(0, 0%, 100%, 0.2);
  }
  .temperature-slider--header .value-label {
    font-size: 55px;
    align-self: center;
    flex: 1 1 auto;
    text-align: center;
    text-transform: uppercase;
  }
  .room-thermostat-area--slider {
    flex: 0 1 400px;
    background-color: hsla(0, 0%, 100%, 0.2);
    box-shadow: 0 0 30px hsla(0, 0%, 39.2%, 0.2);
    transition: transform 0.15s ease, box-shadow 0.15s ease, flex-basis 0.3s ease-out;
    will-change: transform;
    position: relative;
    width: 100%;
    max-width: 300px;
    /* height: 300px; */
    /* margin-top: 30px; */
    margin: 30px auto 60px auto;
    border-radius: 75px;
    overflow: hidden;
  }
  .app-temperature-slider {
    /* width: 300px;
    height: 400px; */
    position: relative;
    top: 0;
    opacity: 1;
    left: 50%;
    transform: translateX(-50%);
    animation: 0.5s ease-out 0s 1 temp_slider_start;
  }
  input[type='range'] {
    background-color: transparent;
    -webkit-appearance: none;
    transform: rotate(-90deg);
    -ms-writing-mode: bt-lr;
    writing-mode: bt-lr;
    position: absolute;
    top: -22px;
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
