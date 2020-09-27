import { LitElement, customElement, html, TemplateResult, property } from 'lit-element';
import { HassEntity } from 'home-assistant-js-websocket';

// import { classMap } from 'lit-html/directives/class-map';
import { HomeAssistant, LovelaceCard, computeDomain } from 'custom-card-helpers';
import { CustomCardConfig } from './types';
import { back_btn, confirm_btn, heat_request } from './components/html_svg';
import { closePopUp } from 'card-tools/src/popup';
import { animation_styling } from './css/popup_animations';
import { shared_styling } from './css/popup_shared_styles';
import { slider_styling } from './css/popup_slider_styles';
import { thermostat_styling } from './css/popup_thermostat_styles';
import { CARD_VERSION } from './const';

// log information of card to the console
console.info(
  `%c  TADOTHERMOSTATPOPUP-CARD  \n%c  Version ${CARD_VERSION}    `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray',
);
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'tadothermostatpopup-card',
  name: 'Tado Thermostat Popup',
  description: 'A popup card to replace tado climate entities more-info page.',
});

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
      target_temp_step,
      preset_modes,
      current_temperature,
      temperature,
      current_humidity,
      hvac_action,
      preset_mode,
      friendly_name,
      supported_features,
    } = this.entity!.attributes;

    const unused = [
      min_temp,
      max_temp,
      target_temp_step,
      preset_modes,
      current_temperature,
      preset_mode,
      friendly_name,
      supported_features,
    ];
    // const targetTemp =
    //   stateObj.attributes.temperature !== null && stateObj.attributes.temperature
    //     ? stateObj.attributes.temperature
    //     : stateObj.attributes.min_temp;

    // const currentHum = parseInt(stateObj.attributes.current_humidity);
    // const currentHum = parseInt(stateObj.attributes.current_humidity);
    // let mode = '';
    // mode = stateObj.state in this.modeIcons ? stateObj.state : 'unknown-mode';
    let thermostat__body: string;
    let thermostat__target: number;
    let thermostat__header: string;

    if (hvac_action == 'off') {
      // mode = 'off';
      thermostat__header = 'Frost Protection';
      thermostat__target = 0;
      thermostat__body = 'OFF';
    } else if (hvac_action == 'heating') {
      // mode = 'heat';
      thermostat__header = 'Set to';
      thermostat__body = temperature.toString() + '°';
      thermostat__target = temperature;
    } else if (hvac_action == 'idle') {
      // mode = 'idle';
      thermostat__header = 'Set to';
      thermostat__body = temperature.toString() + '°';
      thermostat__target = temperature;
    } else {
      // mode = stateObj.state in this.modeIcons ? stateObj.state : 'unknown-mode';
      thermostat__header = 'No remote access';
      thermostat__body = 'replace with svg';
      thermostat__target = 0;
    }

    // if (stateObj in hvac_modes) {
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
            ${this.temp_selection
              ? html`
                  <!-- Tado set temp START -->
                  <div class="tado-card-top">
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
                  </div>
                  <div class="tado-card-middle">
                    <div class="thermostat">
                      <div class="thermostat_top"></div>
                      <div class="thermostat_middle" tabindex="0">
                        <div class="thermostat__header "></div>

                        <div class="thermostat__body">
                          <div id="track" class="track" style="height: ${track_height};"></div>

                          <input
                            id="tempvaluerange"
                            type="range"
                            min="${min_temp - 1}"
                            max="${max_temp}"
                            step="1"
                            style="width: 444px; height: 300px; transform-origin: 222px 222px;"
                            @change="${(e: MouseEvent | null | undefined): void => this._change_track(e)}"
                            @input="${(e: MouseEvent | null | undefined): void => this._change_track(e)}"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="info"></div>
                  <!-- Tado set temp END -->
                `
              : html`
                  <!-- Tado Thermostat START -->
                  <div class="tado-card-top"></div>
                  <div
                    class="tado-card-middle"
                    @mousedown="${(): void => this._thermostat_mousedown()}"
                    @mouseup="${(): void => this._thermostat_mouseup()}"
                    @click="${(e: MouseEvent | null | undefined): void => this._thermostat_mouseclick(e)}"
                  >
                    <!-- <div  class="room-thermostat-area" tabindex="0"></div> -->
                    <div id="thermostat" class="thermostat">
                      <div class="thermostat_part_top"></div>
                      <div class="thermostat_part_middle">
                        <div class="thermostat__header ">
                          <span>${thermostat__header}</span>
                        </div>
                        <div class="thermostat__body">
                          <div class="body_temperature">${thermostat__body}</div>
                          <div class="body_heatreq">
                            <div class="body_heatreq_inner">
                              ${heat_request}
                            </div>
                          </div>
                        </div>
                        ${this.temp_overlay
                          ? html`
                              <div class="thermostat__footer">
                                <div class="thermostat__footer_termination_content_text">Manual Override Active</div>
                                <button class="btn btn--cancel">Cancel</button>
                              </div>
                            `
                          : html`
                              <div class="thermostat__footer"></div>
                            `}
                      </div>
                      <div class="thermostat_part_bottom"></div>
                    </div>
                  </div>
                  <div class="info">
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
                  </div>
                  <!-- Tado Sensors END -->
                `}
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
    if (e !== null && this._isCancelOverrideButton(e.target as HTMLButtonElement)) {
      this._handleModeClick();
      thermostat.getElementById('popup').classList.add('temp-backed');
      return; // Dont toggle view
    }
    // Handle Back Button when setting temperature
    if (e !== null && this._isBackButton(e.target as HTMLDivElement)) {
      this.shadowRoot.getElementById('popup').className = this.shadowRoot
        .getElementById('popup')
        .className.replace(/temp.*/g, '');
      thermostat.getElementById('popup').classList.add('temp-backed');
      thermostat.getElementById('popup').classList.add(this.temp_class);
    }
    // Handle Confirmation Button when setting temperature
    if (e !== null && this._isConfirmButton(e.target as HTMLDivElement)) {
      this._setTemperature(this.temp_wanted);
      this.shadowRoot.getElementById('popup').className = this.shadowRoot
        .getElementById('popup')
        .className.replace(/temp.*/g, '');
      thermostat.getElementById('popup').classList.add('temp-backed');
      thermostat.getElementById('popup').classList.add('temp-' + this.temp_wanted.toString());
    }
    // toggle thermostat view

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

  _isCancelOverrideButton(target: HTMLButtonElement): boolean {
    /**
     * Temperature Override Cancel button check
     */
    const cancelOverrideClass = 'btn--cancel';
    const exists = target.classList.contains(cancelOverrideClass);
    return exists;
  }
  _isBackButton(target: HTMLDivElement): boolean {
    /**
     * Temperature Slider Back button check
     */
    const BackBtnClass = 'btn-back';
    const exists = target.classList.contains(BackBtnClass);
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
    // if (this.settings && !this.settingsCustomCard) {
    //   const mic = this.shadowRoot.querySelector('more-info-controls').shadowRoot;
    //   mic.removeChild(mic.querySelector('app-toolbar'));
    // } else if (this.settings && this.settingsCustomCard) {
    //   this.shadowRoot.querySelectorAll('card-maker').forEach(customCard => {
    //     let card = {
    //       type: customCard.dataset.card,
    //     };
    //     card = Object.assign({}, card, JSON.parse(customCard.dataset.options));
    //     customCard.config = card;
    //     let style = '';
    //     if (customCard.dataset.style) {
    //       style = customCard.dataset.style;
    //     }
    //     if (style != '') {
    //       let itterations = 0;
    //       const interval = setInterval(function() {
    //         const el = customCard.children[0];
    //         if (el) {
    //           window.clearInterval(interval);
    //           const styleElement = document.createElement('style');
    //           styleElement.innerHTML = style;
    //           el.shadowRoot.appendChild(styleElement);
    //         } else if (++itterations === 10) {
    //           window.clearInterval(interval);
    //         }
    //       }, 100);
    //     }
    //   });
    // }
  }

  updated(): void {
    /**
     * Main updater handler.
     */
    // this._setTemp = this._getSetTemp(this.entity?.state);
    // this._setTemp = this._getSetTemp(this.hass.states[this.config.entity]);
    this.temp_overlay = this._getOverlayState(this.hass.states[this.config.overlay]);
  }

  // _openSettings(): void {
  //   /**
  //    * Handles classes on opening settings popup.
  //    */
  //   this.shadowRoot.getElementById('popup').classList.add('off');
  //   this.shadowRoot.getElementById('settings').classList.add('on');
  // }
  // _closeSettings(): void {
  //   /**
  //    * Handles classes on closing settings popup.
  //    */
  //   this.shadowRoot.getElementById('settings').classList.remove('on');
  //   this.shadowRoot.getElementById('popup').classList.remove('off');
  // }
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

  _getOverlayState(overlayObj): boolean {
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
