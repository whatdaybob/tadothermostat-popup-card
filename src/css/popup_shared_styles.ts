import { css } from 'lit-element';

export const shared_styling = css`
  #thermostat {
    box-shadow: rgba(100, 100, 100, 0.2) 0px 0px 30px;
    transition: transform 0.15s ease 0s, box-shadow 0.15s ease 0s, flex-basis 0.3s ease-out 0s;
    will-change: transform;
    flex: 0 1 300px;
    position: relative;
    width: 100%;
    max-width: 300px;
    height: 300px;
    /* margin-top: 30px; */
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 75px;
    overflow: hidden;
  }

  .tado-card-middle {
    display: flex;
    flex-direction: column;
    flex: 1 1 450px;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    width: 100%;
  }

  .thermostat_part_bottom {
    flex: 1 1 100px;
    width: 100%;
  }

  :host([temp_selection]) .tado-card-middle {
    flex: 1 1 525px;
  }
  :host([temp_selection]) .thermostat_part_top {
    display: none;
  }
  :host([temp_selection]) .thermostat_part_bottom {
    display: none;
  }
  /* Main Thermostat Start */
  .thermostat_part_top {
    line-height: 50px;
    flex: 1 1 50px;
    text-align: center;
    width: 100%;
  }
  .thermostat_part_top_toolbar {
    padding: 18px;
    position: absolute;
    width: calc(100% - 36px);
    display: flex;
    justify-content: space-between;
  }
  /* .thermostat_part_middle {
    box-shadow: rgba(100, 100, 100, 0.2) 0px 0px 30px;
    transition: transform 0.15s ease 0s, box-shadow 0.15s ease 0s, flex-basis 0.3s ease-out 0s;
    will-change: transform;
    flex: 0 1 300px;
    position: relative;
    width: 100%;
    max-width: 300px;
    height: 300px;

    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 75px;
    overflow: hidden;
  } */
  .thermostat:hover {
    transform: scale(1.03);
  }
  .thermostat.mousedown {
    transform: scale(0.95);
  }
  .tado-card-top {
    flex: 0 0 100px;
    /* display: inline-flex; */
  }
  :host([temp_selection]) .thermostat {
    box-shadow: rgba(100, 100, 100, 0.2) 0px 0px 30px;
    will-change: transform;
    max-width: 300px;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 75px;
    overflow: hidden;
    flex: 1 1 444px;
    margin: 31px 0px 50px 0;
  }
  :host([temp_selection]) .tado-card-top {
    flex: 1 1 75px;
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
  /* .thermostat {
    width: 300px;
    height: 300px;
    margin-top: 110px;
  } */

  .thermostat_part_middle {
    width: 100%;
    height: 100%;
    overflow: hidden;
    display: flex;
    font-size: 6rem;
    text-align: center;
    justify-content: center;
    flex-flow: column;
  }
  /* :host([temp_selection]) .thermostat_part_middle {
    flex: 0 1 400px;
    background-color: hsla(0, 0%, 100%, 0.2);
    box-shadow: 0 0 30px hsla(0, 0%, 39.2%, 0.2);
    transition: transform 0.15s ease, box-shadow 0.15s ease, flex-basis 0.3s ease-out;
    will-change: transform;
    position: relative;
    width: 100%;
    max-width: 300px;
    height: 300px;
    margin-top: 30px;
    margin: 30px auto 60px auto;
    border-radius: 75px;
    overflow: hidden;
  } */
  :host([temp_selection]) .thermostat__header {
    margin: 0px;
    flex: 1 1 0px;
  }

  .thermostat__header {
    line-height: 50px;
    flex: 1 1 50px;
    text-align: center;
  }

  :host([temp_selection]) .thermostat_part_middle {
    width: 300px;
    flex: 1 1 400px;
    /* animation: 0.5s ease-out 0s 1 temp_slider_start; */
  }

  .body_temperature {
    flex: 1 1 150px;
    line-height: 190px;
    font-weight: 700;
    font-size: 5.5rem;
    text-align: center;
  }

  .body_heatreq_inner {
    width: 24px;
    margin: 0 auto;
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
    width: 100%;
  }

  /* FOOTER END */

  /* INFO START */
  :host([temp_selection]) .tado-card-bottom {
    display: none;
  }
  .tado-card-bottom {
    display: flex;
    flex-direction: row;
    flex: 1 1 200px;
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
