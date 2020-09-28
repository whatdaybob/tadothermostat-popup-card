import { css } from 'lit-element';

export const shared_styling = css`
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
    flex: 0 0 100px;
    width: 100%;
    opacity: 1;
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
  :host([temp_selection]) .thermostat_part_bottom {
    opacity: 0;
    flex: 0 0 0px;
  }
  /* Main Thermostat Start */
  .thermostat_part_top {
    line-height: 50px;
    flex: 0 0 50px;
    text-align: center;
    width: 100%;
    transition-property: flex, opacity;
    transition-delay: 0s;
    transition-duration: 0.5s;
    transition-timing-function: ease-in-out;
    overflow: hidden;
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
    /* display: inline-flex; */
  }

  :host([temp_selection]) .tado-card-top {
    flex: 0 0 75px;
    display: inline-flex;
    width: 100%;
    justify-content: space-between;
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
    margin: 0 auto;
    transition-property: flex;
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

  .thermostat__footer {
    flex: 0 0 0%;
    background-color: #fff;
    color: #213953;
    opacity: 0;
    transition-property: flex, opacity;
    transition-delay: 2s, 2s;
    transition-duration: 2s;
    transition-timing-function: ease-in-out;
  }

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
  }
  :host([temp_overlay]) .thermostat__footer {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    opacity: 1;
    flex: 0 0 100px;
  }
  /* Temp Overlay End */

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

  .info_sensor_container {
    display: flex;
    align-items: center;
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
