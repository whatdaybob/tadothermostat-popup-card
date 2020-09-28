import { LitElement, customElement, html, TemplateResult, property } from 'lit-element';
import { HassEntity } from 'home-assistant-js-websocket';
import { HomeAssistant, LovelaceCard, computeDomain } from 'custom-card-helpers';
import { CustomCardConfig } from './types';
import { back_btn, confirm_btn, heat_request } from './components/html_svg';
import { animation_styling } from './css/popup_animations';
import { shared_styling } from './css/popup_shared_styles';
import { slider_styling } from './css/popup_slider_styles';
import { thermostat_styling } from './css/popup_thermostat_styles';
import { infotoconsole, cctoconsole } from './modules/card_information';

infotoconsole();
cctoconsole();

@customElement('tadothermostatpopup-card')
export class TadoPopupCard extends LitElement implements LovelaceCard {
  @property({ type: Object }) hass!: HomeAssistant;
  @property({ type: Object }) private config!: CustomCardConfig;

  private get entity(): HassEntity | undefined {
    return this.hass.states[this.config.entity];
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  shadowRoot: any;
  // _setTemp: string;
  // _setTrack: string | undefined;
  temp_selection: boolean;
  temp_overlay: boolean;
  temp_heating: string;
  temp_class: string;
  temp_wanted: number;

  // modeIcons = {
  //   auto: 'hass:calendar-repeat',
  //   heat: 'hass:fire',
  //   off: 'hass:power',
  // };
  // settings = false;
  // settingsCustomCard = false;
  // settingsPosition = 'bottom';

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  static get properties() {
    return {
      // hass: {},
      // config: {},
      active: {},
      temp_selection: { type: Boolean, reflect: true },
      temp_overlay: { type: Boolean, reflect: true },
      temp_heating: { type: String, reflect: true },
      temp_class: { type: String },
      temp_wanted: { type: Number },
      // dragging: { type: Boolean, reflect: true },
    };
  }

  constructor() {
    super();
    // this._setTemp = '';
    this.temp_wanted = 0;
    this.temp_class = 'temp-off';
    this.temp_selection = false;
    this.temp_heating = 'heating_off';
    this.temp_overlay = false;
    // this.dragging = false;
  }

  render(): TemplateResult | null {
    if (!this.entity) {
      throw new Error('Entity not found');
    }
    if (computeDomain(this.entity.entity_id) !== 'climate') {
      throw new Error('You must set a climate entity');
    }
    // const { hour, minute } = this.entity!.attributes;

    // this.temp_wanted = 0;

    // const entity = this.config.entity;
    const stateObj = this.entity?.state;
    // const currentTemp = this.entity?.attributes.current_temperature;
    const {
      hvac_modes,
      min_temp,
      max_temp,
      __target_temp_step,
      __preset_modes,
      current_temperature,
      temperature,
      current_humidity,
      hvac_action,
      __preset_mode,
      __friendly_name,
      __supported_features,
    } = this.entity!.attributes;

    let thermostat__body: string;
    let thermostat__target: number;
    let thermostat__header: string;

    if (hvac_action == 'off') {
      thermostat__header = 'Frost Protection';
      thermostat__target = 0;
      thermostat__body = 'OFF';
    } else if (hvac_action == 'heating') {
      thermostat__header = 'Heating to';
      thermostat__body = temperature.toString() + '°';
      thermostat__target = temperature;
    } else if (hvac_action == 'idle') {
      thermostat__header = 'Set to';
      thermostat__body = temperature.toString() + '°';
      thermostat__target = temperature;
    } else {
      thermostat__header = 'No remote access';
      thermostat__body = 'replace with svg';
      thermostat__target = 0;
    }

    if (hvac_modes.indexOf(stateObj) > -1) {
      if (hvac_action == 'off') {
        this.temp_class = 'temp-off';
      } else {
        this.temp_class = 'temp-' + parseInt(temperature).toString();
      }
    } else {
      this.temp_class = 'disconnected';
    }

    const track_height = ((100 / 21) * (thermostat__target - 4)).toString() + '%';

    return html`
      <div class="popup-wrapper">
        <div style="display:flex;width:100%;height:100%;">
          <div id="popup" class="popup-inner ${this.temp_class}">
            <!-- Tado set temp START -->
            <div class="tado-card-top">
              ${this.temp_selection
                ? html`
                    <div
                      class="btn-back"
                      @click="${(e: MouseEvent | null | undefined): void => this._thermostat_mouseclick(e)}"
                    >
                      ${back_btn}
                    </div>
                    <div id="target_temp_track" class="temperature_text">${thermostat__body}</div>
                    <div
                      class="btn-confirm"
                      @click="${(e: MouseEvent | null | undefined): void => this._thermostat_mouseclick(e)}"
                    >
                      ${confirm_btn}
                    </div>
                  `
                : html``}
            </div>
            <div
              id="thermostat"
              class="tado-card-middle thermostat"
              @mousedown="${(): void => this._thermostat_mousedown()}"
              @mouseup="${(): void => this._thermostat_mouseup()}"
              @click="${(e: MouseEvent | null | undefined): void => this._thermostat_mouseclick(e)}"
            >
              ${this.temp_selection
                ? html`
                    <div class="thermostat_part_top"></div>
                    <div class="thermostat_part_middle">
                      <div id="track" class="track" style="height: ${track_height};"></div>
                      <input
                        id="tempvaluerange"
                        class="tempvaluerange"
                        type="range"
                        min="${min_temp - 1}"
                        max="${max_temp}"
                        step="1"
                        style="width: 444px; height: 300px; transform-origin: 222px 222px;"
                        @change="${(e: MouseEvent | null | undefined): void => this._change_track(e)}"
                        @input="${(e: MouseEvent | null | undefined): void => this._change_track(e)}"
                      />
                    </div>
                    <div class="thermostat_part_bottom"></div>
                  `
                : html`
                    <div class="thermostat_part_top tempoverview">
                      <span>${thermostat__header}</span>
                    </div>
                    <div class="thermostat_part_middle tempoverview">
                      ${thermostat__body}
                    </div>
                    <div class="thermostat_part_bottom tempoverview">
                      <div class="body_heatreq_inner">
                        ${heat_request}
                      </div>
                      ${this.temp_overlay
                        ? html`
                            <div class="thermostat__footer">
                              <div class="thermostat__footer_termination_content_text">
                                Manual Override Active
                              </div>
                              <button class="btn btn--cancel">Cancel</button>
                            </div>
                          `
                        : html`
                            <div class="thermostat__footer"></div>
                          `}
                    </div>
                  `}
            </div>
            <div class="tado-card-bottom">
              ${this.temp_selection
                ? html``
                : html`
                    <div class="info_sensor_container">
                      <div class="info_sensor">
                        <div class="info_sensor_label">Inside now</div>
                        <div class="info_sensor_value">${current_temperature}&#176;</div>
                      </div>
                      <div class="info_sensor">
                        <div class="info_sensor_label">Humidity</div>
                        <div class="info_sensor_value">${parseInt(current_humidity)}%</div>
                      </div>
                    </div>
                  `}
            </div>
            <!-- Tado set temp END -->
            <!-- Tado Thermostat START -->
            <!-- <div
                  > -->
            <!-- <div  class="room-thermostat-area" tabindex="0"></div> -->
            <!-- Tado Sensors END -->
          </div>
        </div>
      </div>
    `;
  }

  _thermostat_mouseclick(e: MouseEvent | null = null): void {
    /**
     * Main mouse event handler for thermostat popup
     */
    // Handle Cancel Button on main popup when overlay active
    const thermostat = this.shadowRoot;
    let toggle = false;
    if (e !== null && this._isCancelOverrideButton(e.target as HTMLButtonElement)) {
      this._handleModeClick();
      thermostat.getElementById('popup').classList.add('temp-backed');
      console.log('CANCEL CALLED');
      // return; // Dont toggle view
    }

    // Handle main thermostat click
    if (e !== null && this._isTempOverview(e.target as HTMLDivElement)) {
      console.log('TOGGLE CALLED');
      toggle = true;
    }

    // Handle Back Button when setting temperature
    if (e !== null && this._isBackButton(e.target as HTMLDivElement)) {
      this.shadowRoot.getElementById('popup').className = this.shadowRoot
        .getElementById('popup')
        .className.replace(/temp.*/g, '');
      thermostat.getElementById('popup').classList.add('temp-backed');
      thermostat.getElementById('popup').classList.add(this.temp_class);
      console.log('BACK CALLED');
      toggle = true;
    }
    // Handle Confirmation Button when setting temperature
    if (e !== null && this._isConfirmButton(e.target as HTMLDivElement)) {
      this._setTemperature(this.temp_wanted);
      this.shadowRoot.getElementById('popup').className = this.shadowRoot
        .getElementById('popup')
        .className.replace(/temp.*/g, '');
      thermostat.getElementById('popup').classList.add('temp-backed');
      thermostat.getElementById('popup').classList.add('temp-' + this.temp_wanted.toString());
      console.log('CONFIRM CALLED');
      toggle = true;
    }
    // toggle thermostat view
    if (toggle) {
      const oldVal = this.temp_selection;
      if (this.temp_selection) {
        this.temp_selection = false;
        thermostat.getElementById('popup').classList.remove('settemp');
        thermostat.getElementById('popup').classList.add('temp-backed');
        this.requestUpdate('temp_selection', oldVal);
      } else {
        this.temp_selection = true;
        thermostat.getElementById('popup').classList.add('settemp');
        thermostat.getElementById('popup').classList.remove('temp-backed');
        this.requestUpdate('temp_selection', oldVal);
      }
    }
    console.log(e);
  }

  _isCancelOverrideButton(target: HTMLButtonElement): boolean {
    /**
     * Temperature Override Cancel button check
     */
    const cancelOverrideClass = 'btn--cancel';
    const exists = target.classList.contains(cancelOverrideClass);
    return exists;
  }
  _isTempOverview(target: HTMLDivElement): boolean {
    /**
     * Temperature Override Cancel button check
     */
    const tempoverview = 'tempoverview';
    const exists = target.classList.contains(tempoverview);
    return exists;
  }
  _isBackButton(target: HTMLDivElement): boolean {
    /**
     * Temperature Slider Back button check
     */
    const backBtnClass = 'btn-back';
    const exists = target.classList.contains(backBtnClass);
    return exists;
  }
  _isConfirmButton(target: HTMLDivElement): boolean {
    /**
     * Temperature Slider Confirmation button check
     */
    const confirmBtnClass = 'btn-confirm';
    const exists = target.classList.contains(confirmBtnClass);
    return exists;
  }

  firstUpdated(): void {
    /**
     * First Update Handler.
     */
  }

  updated(): void {
    /**
     * Main updater handler.
     */
    // this._setTemp = this._getSetTemp(this.entity?.state);
    // this._setTemp = this._getSetTemp(this.hass.states[this.config.entity]);
    this.temp_overlay = this._getOverlayState(this.hass.states[this.config.overlay]);
    this.temp_heating = this._getHeatingState(this.hass.states[this.config.heating]);
  }

  _thermostat_mousedown(): void {
    /**
     * Mouse Down Animation helper.
     */
    this.shadowRoot.getElementById('thermostat').classList.add('mousedown');
  }
  _thermostat_mouseup(): void {
    /**
     * Mouse Up animation helper.
     */
    this.shadowRoot.getElementById('thermostat').classList.remove('mousedown');
  }

  _change_track(e): void {
    /**
     * Sets the SVG track on the temperature picker.
     */
    this.shadowRoot.getElementById('track').style.height = ((100 / 21) * (e.srcElement.value - 4)).toString() + '%';
    const temp_string = e.srcElement.value.toString();
    const temp_string_deg = e.srcElement.value.toString() + '&#176;';
    if (e.srcElement.value - 4 > 0) {
      this.shadowRoot.getElementById('popup').className = this.shadowRoot
        .getElementById('popup')
        .className.replace(/temp.*/g, '');
      this.shadowRoot.getElementById('popup').classList.add('temp-' + temp_string);
      this.shadowRoot.getElementById('target_temp_track').innerHTML = temp_string_deg;
      this.temp_wanted = e.srcElement.value;
    } else {
      this.shadowRoot.getElementById('popup').className = this.shadowRoot
        .getElementById('popup')
        .className.replace(/temp.*/g, '');
      this.shadowRoot.getElementById('popup').classList.add('temp-off');
      this.shadowRoot.getElementById('target_temp_track').innerHTML = 'OFF';
      this.temp_wanted = e.srcElement.value;
    }
  }

  // _getSetTemp(stateObj): string {
  //   /**
  //    * Gets the climates current temperature
  //    */
  //   if (stateObj.state === 'unavailable') {
  //     return this.hass.localize('state.default.unavailable');
  //   }
  //   return stateObj.attributes.temperature;
  // }

  _getHeatingState(heatingObj: HassEntity): string {
    // throw new Error('Method not implemented.');
    const heat_percent = parseInt(heatingObj.state);
    let heat_class = 'heating_off';
    if (heat_percent == 0) {
      return heat_class;
    } else if (heat_percent <= 33) {
      heat_class = 'heating_one';
      return heat_class;
    } else if (heat_percent <= 66) {
      heat_class = 'heating_two';
      return heat_class;
    } else if (heat_percent <= 100) {
      heat_class = 'heating_three';
      return heat_class;
    } else {
      heat_class = 'heating_err';
      return heat_class;
    }
  }
  _getOverlayState(overlayObj: HassEntity): boolean {
    /**
     * Correctly sets the Overlay boolean as it reads it as a string
     */
    const isTrueSet = overlayObj.state === 'True';
    return isTrueSet;
  }

  // _close(event): void {
  //   /**
  //    * Closes the browser_mod popup.
  //    */
  //   if (event && event.target.classList.length > 0) {
  //     if (event.target.classList.contains('popup-inner') || event.target.classList.contains('settings-inner')) {
  //       closePopUp();
  //     }
  //   }
  // }

  private _setTemperature(temperature: number): Promise<void> {
    /**
     * Calls the Home Assistant set_temperature service.
     */
    if (!this.hass) {
      throw new Error('Unable to update temperature');
    }
    return this.hass.callService('climate', 'set_temperature', {
      entity_id: this.config.entity,
      temperature: temperature,
    });
  }

  _handleModeClick(): Promise<void> {
    /**
     * Sets the Tado thermostat back to auto mode.
     */
    if (!this.hass) {
      throw new Error('Unable to update climate mode');
    }
    return this.hass.callService('climate', 'set_hvac_mode', {
      entity_id: this.config.entity,
      hvac_mode: 'auto',
    });
  }

  public setConfig(config: CustomCardConfig): void {
    /**
     * Imports and sets up configuration
     */
    if (!config) {
      throw new Error('Invalid configuration');
    }
    if (!config.entity) {
      throw new Error('You need to define a climate entity');
    }
    if (!config.heating) {
      throw new Error('You need to define a heating entity');
    }
    if (!config.title) {
      throw new Error('You need to give this a title via title: <title>');
    }
    if (!config.overlay) {
      throw new Error('You need to give this a title via title: <title>');
    }

    this.config = config;
  }
  getCardSize(): number {
    return 1;
  }

  // Import Styling Externally
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  static get styles() {
    return [animation_styling, shared_styling, thermostat_styling, slider_styling];
  }
}

// customElements.define('tadothermostatpopup-card', TadoPopupCard);
