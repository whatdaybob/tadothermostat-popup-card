import { LitElement, html, TemplateResult } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';
import { closePopUp } from 'card-tools/src/popup';
import { animation_styling } from './css/popup_animations';
import { shared_styling } from './css/popup_shared_styles';
import { slider_styling } from './css/popup_slider_styles';
import { thermostat_styling } from './css/popup_thermostat_styles';

// import { computeRTLDirection } from 'custom-card-helpers';
// import { computeStateDisplay, computeStateName } from 'custom-card-helpers';

class TadoPopupCard extends LitElement {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  hass: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  shadowRoot: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _setTemp: any;
  _setTrack: string | undefined;
  temp_selection: boolean;
  temp_overlay: boolean;
  temp_class: string;
  temp_wanted: number;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dragging: any;

  hvacModeOrdering = {
    // 0: "off",
    // 1: "auto",
    // 2: "heat"
    auto: 1,
    heat: 2,
    off: 3,
    // heat_cool: 2,
    // cool: 4,
    // dry: 5,
    // fan_only: 6,
  };
  modeIcons = {
    auto: 'hass:calendar-repeat',
    // auto: 'mdi:repeat',
    // heat_cool: 'hass:autorenew',
    heat: 'hass:fire',
    // cool: 'hass:snowflake',
    off: 'hass:power',
    // fan_only: 'hass:fan',
    // dry: 'hass:water-percent',
  };
  settings = false;
  settingsCustomCard = false;
  settingsPosition = 'bottom';

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  static get properties() {
    return {
      hass: {},
      config: {},
      active: {},
      temp_selection: { type: Boolean },
      temp_overlay: { type: Boolean, reflect: true },
      temp_class: { type: String },
      temp_wanted: { type: Number, reflect: true },
      dragging: { type: Boolean, reflect: true },
    };
  }

  constructor() {
    super();
    this.temp_wanted = 0;
    this.temp_class = 'temp-off';
    this.temp_selection = false;
    this.temp_overlay = false;
    this.dragging = false;
  }

  protected render(): TemplateResult | void {
    this.temp_wanted = 0;

    const entity = this.config.entity;
    const stateObj = this.hass.states[entity];
    const currentTemp = stateObj.attributes.current_temperature;
    // console.log(stateObj);
    // const icon = this.config.icon
    //   ? this.config.icon
    //   : stateObj.attributes.icon
    //   ? stateObj.attributes.icon
    //   : 'mdi:lightbulb';

    // REAL DATA
    // const name = this.config.name || stateObj.attributes.friendly_name;
    const targetTemp =
      stateObj.attributes.temperature !== null && stateObj.attributes.temperature
        ? stateObj.attributes.temperature
        : stateObj.attributes.min_temp;

    // const max_temp = stateObj.attributes.max_temp;
    // const min_temp = stateObj.attributes.min_temp;
    // const preset_mode = stateObj.attributes.preset_mode;
    // const preset_modes = stateObj.attributes.preset_modes;

    const currentHum = parseInt(stateObj.attributes.current_humidity);
    // const hvac_action = stateObj.attributes.hvac_action;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let mode: any = '';
    mode = stateObj.state in this.modeIcons ? stateObj.state : 'unknown-mode';
    let thermostat__body: string;
    let thermostat__target: number;
    let thermostat__header: string;

    if (stateObj.attributes.hvac_action == 'off') {
      mode = 'off';
      thermostat__header = 'Frost Protection';
      thermostat__target = 0;
      thermostat__body = 'OFF';
    } else if (stateObj.attributes.hvac_action == 'heating') {
      mode = 'heat';
      thermostat__header = 'Set to';
      thermostat__body = targetTemp.toString() + '°';
      thermostat__target = targetTemp;
    } else if (stateObj.attributes.hvac_action == 'idle') {
      mode = 'idle';
      thermostat__header = 'Set to';
      thermostat__body = targetTemp.toString() + '°';
      thermostat__target = targetTemp;
    } else {
      mode = stateObj.state in this.modeIcons ? stateObj.state : 'unknown-mode';
      thermostat__header = 'No remote access';
      thermostat__body = 'replace with svg';
      thermostat__target = 0;
    }
    // let thermostat__class: string;
    if (stateObj.state in this.modeIcons) {
      if (stateObj.attributes.hvac_action == 'off') {
        this.temp_class = 'temp-off';
      } else {
        this.temp_class = 'temp-' + parseInt(targetTemp).toString();
      }
    } else {
      this.temp_class = 'disconnected';
    }

    const track_height = ((100 / 21) * (thermostat__target - 4)).toString() + '%';

    const fullscreen = 'fullscreen' in this.config ? this.config.fullscreen : true;
    this.settings = 'settings' in this.config ? true : false;
    this.settingsCustomCard = 'settingsCard' in this.config ? true : false;
    this.settingsPosition = 'settingsPosition' in this.config ? this.config.settingsPosition : 'bottom';
    if (this.settingsCustomCard && this.config.settingsCard.cardOptions) {
      if (this.config.settingsCard.cardOptions.entity && this.config.settingsCard.cardOptions.entity == 'this') {
        this.config.settingsCard.cardOptions.entity = entity;
      } else if (
        this.config.settingsCard.cardOptions.entity_id &&
        this.config.settingsCard.cardOptions.entity_id == 'this'
      ) {
        this.config.settingsCard.cardOptions.entity_id = entity;
      } else if (this.config.settingsCard.cardOptions.entities) {
        for (const key in this.config.settingsCard.cardOptions.entities) {
          if (this.config.settingsCard.cardOptions.entities[key] == 'this') {
            this.config.settingsCard.cardOptions.entities[key] = entity;
          }
        }
      }
    }

    // console.log(this.active);
    return html`
      <div class="${fullscreen === true ? 'popup-wrapper' : ''}">
        <div class="${classMap({ [mode]: true })}" style="display:flex;width:100%;height:100%;">
          <!-- <div id="popup" class="popup-inner ${this.temp_class}" @click="${e => this._close(e)}"> -->
          <div id="popup" class="popup-inner ${this.temp_class}">
            ${this.temp_selection
              ? html`
                  <!-- Tado set temp START -->
                  <div class="tado-card--slider">
                    <div class="temperature-slider--header " style="">
                      <div class="temperature-slider--toolbar">
                        <div>
                          <div class="btn-back" @click="${e => this._thermostat_mouseclick(e)}">
                            <svg class="panel-btn" tabindex="2" id="back-button" viewBox="0 0 28 28">
                              <path
                                fill-rule="evenodd"
                                clip-rule="evenodd"
                                d="M0 14C0 21.732 6.26801 28 14 28C21.732 28 28 21.732 28 14C28 6.26801 21.732 0 14 0C6.26801 0 0 6.26801 0 14ZM26.7272 14C26.7272 21.0291 21.029 26.7273 14 26.7273C6.97089 26.7273 1.27269 21.0291 1.27269 14C1.27269 6.97091 6.97089 1.27272 14 1.27272C21.029 1.27272 26.7272 6.97091 26.7272 14Z"
                                fill="#007AFF"
                              ></path>
                              <path
                                fill-rule="evenodd"
                                clip-rule="evenodd"
                                d="M14 0C6.26734 0 0 6.26734 0 14C0 21.7315 6.26734 28 14 28C21.7315 28 28 21.7315 28 14C28 6.26734 21.7315 0 14 0Z"
                              ></path>
                              <path
                                fill-rule="evenodd"
                                clip-rule="evenodd"
                                d="M11.9318 14.1273C11.806 13.9964 11.8079 13.7891 11.9362 13.6606L17.0778 8.50739C17.4034 8.18102 17.4023 7.653 17.0753 7.32802L16.9897 7.24301C16.6627 6.91802 16.1337 6.91914 15.808 7.24551L9.43074 13.6372C9.30248 13.7657 9.30054 13.973 9.42636 14.1039L15.8075 20.7433C16.1269 21.0757 16.6559 21.0867 16.989 20.7679L17.0761 20.6845C17.4091 20.3657 17.4201 19.8378 17.1007 19.5054L11.9318 14.1273Z"
                                fill="white"
                              ></path>
                            </svg>
                          </div>
                        </div>
                        <div class="btn-confirm" @click="${e => this._thermostat_mouseclick(e)}">
                          <svg class="panel-btn" tabindex="2" id="confirm-button" viewBox="0 0 28 28">
                            <path
                              fill-rule="evenodd"
                              clip-rule="evenodd"
                              d="M14 0C6.26734 0 0 6.26734 0 14C0 21.7315 6.26734 28 14 28C21.7315 28 28 21.7315 28 14C28 6.26734 21.7315 0 14 0Z"
                            ></path>
                            <path
                              d="M12.2465 18.0302L19.8067 8.95796C20.0929 8.61449 20.6033 8.56809 20.9468 8.85431C21.2902 9.14052 21.3367 9.65098 21.0504 9.99444L12.9552 19.7087C12.6625 20.0599 12.1372 20.0992 11.7955 19.7955L6.93839 15.4781C6.60423 15.181 6.57413 14.6693 6.87116 14.3352C7.16819 14.001 7.67986 13.9709 8.01402 14.268L12.2465 18.0302Z"
                              fill="white"
                            ></path>
                          </svg>
                        </div>
                      </div>
                      <div class="value-label">
                        <div class="app-temperature-display"></div>
                        <div class="">
                          <div id="target_temp_track" class="b-temperature">${thermostat__body}</div>
                        </div>
                      </div>
                    </div>
                    <div class="room-thermostat-area--slider" tabindex="0">
                      <div class="app-temperature-slider" style="width: 300px; height: 400px; opacity: 1;">
                        <div id="track" class="track" style="height: ${track_height};"></div>

                        <input
                          id="tempvaluerange"
                          type="range"
                          min="4"
                          max="25"
                          step="1"
                          style="width: 444px; height: 300px; transform-origin: 222px 222px;"
                          @change="${e => this._change_track(e)}"
                          @input="${e => this._change_track(e)}"
                        />
                      </div>
                    </div>
                  </div>
                  <!-- Tado set temp END -->
                `
              : html`
                  <!-- Tado Thermostat START -->
                  <div
                    class="tado-card"
                    @mousedown="${() => this._thermostat_mousedown()}"
                    @mouseup="${() => this._thermostat_mouseup()}"
                    @click="${e => this._thermostat_mouseclick(e)}"
                  >
                    <div id="thermostat" class="room-thermostat-area" tabindex="0">
                      <div class="thermostat">
                        <div role="button" class="thermostat__header_and_body ">
                          <div class="thermostat__header ">
                            <span>${thermostat__header}</span>
                          </div>
                          <div class="thermostat__body">
                            <span class="b-temperature  " style="text-transform: uppercase">${thermostat__body}</span>
                            <div class="app-heat-request-indicator">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                width="24"
                                height="24"
                              >
                                <path
                                  d="M1.87697 2.77194C1.39922 2.16421 1.50209 1.28228 2.10674 0.802095C2.71138 0.321909 3.58884 0.425306 4.06658 1.03304C6.82192 4.53804 6.82192 8.44325 4.12153 12.3907C2.12537 15.3087 2.36258 18.1189 4.92785 21.197C5.42268 21.7907 5.34493 22.6753 4.75418 23.1726C4.16344 23.67 3.2834 23.5918 2.78857 22.9981C-0.555716 18.9852 -0.909462 14.7944 1.82202 10.8015C3.84928 7.83808 3.84928 5.28087 1.87697 2.77194Z"
                                ></path>
                                <path
                                  d="M10.8069 2.77194C10.3292 2.16421 10.432 1.28228 11.0367 0.802095C11.6413 0.321909 12.5188 0.425306 12.9965 1.03304C15.7519 4.53804 15.7519 8.44325 13.0515 12.3907C11.0553 15.3087 11.2925 18.1189 13.8578 21.197C14.3526 21.7907 14.2749 22.6753 13.6841 23.1726C13.0934 23.67 12.2133 23.5918 11.7185 22.9981C8.37422 18.9852 8.02047 14.7944 10.752 10.8015C12.7792 7.83808 12.7792 5.28087 10.8069 2.77194Z"
                                ></path>
                                <path
                                  d="M19.7371 2.77194C19.2593 2.16421 19.3622 1.28228 19.9668 0.802095C20.5715 0.321909 21.4489 0.425306 21.9267 1.03304C24.682 4.53804 24.682 8.44325 21.9816 12.3907C19.9855 15.3087 20.2227 18.1189 22.788 21.197C23.2828 21.7907 23.205 22.6753 22.6143 23.1726C22.0235 23.67 21.1435 23.5918 20.6487 22.9981C17.3044 18.9852 16.9506 14.7944 19.6821 10.8015C21.7094 7.83808 21.7094 5.28087 19.7371 2.77194Z"
                                ></path>
                              </svg>
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
                                <div class="thermostat__footer" style="max-height: 0%; opacity: 0"></div>
                              `}
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- Tado Thermostat END -->
                  <!-- Tado Sensors START -->
                  <div class="info">
                    <div class="sensors-container">
                      <div class="sensor">
                        <div class="temperature sensor__label">Inside now</div>
                        <div class="temperature sensor__value">
                          <div class="b-temperature">${currentTemp}&#176;</div>
                        </div>
                      </div>
                      <div class="sensor">
                        <div class="sensor__label">Humidity</div>
                        <div class="sensor__value">
                          <div class="b-humidity">${currentHum}%</div>
                        </div>
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
    if (e !== null && this._isCancelOverrideButton(e.target as HTMLButtonElement)) {
      console.log('cancel');
      this._handleModeClick();
      return;
    }
    if (e !== null && this._isBackButton(e.target as HTMLDivElement)) {
      console.log('back');
      this.shadowRoot.getElementById('popup').className = this.shadowRoot
        .getElementById('popup')
        .className.replace(/temp.*/g, '');
      this.shadowRoot.getElementById('popup').classList.add(this.temp_class);
    }
    if (e !== null && this._isConfirmButton(e.target as HTMLDivElement)) {
      console.log('confirm');

      this._setTemperature(this.temp_wanted);
      this.shadowRoot.getElementById('popup').className = this.shadowRoot
        .getElementById('popup')
        .className.replace(/temp.*/g, '');
      this.shadowRoot.getElementById('popup').classList.add(this.temp_class);
    }
    // if (event.target.classList.contains('btn-confirm')) {
    //   console.log('set heat');
    //   this._setTemperature(this.temp_wanted);
    // }

    // if (event.target.classList.contains('btn-back')) {
    //   this.shadowRoot.getElementById('popup').className = this.shadowRoot
    //     .getElementById('popup')
    //     .className.replace(/temp.*/g, '');
    //   this.shadowRoot.getElementById('popup').classList.add(this.temp_class);
    // }
    console.log(e);
    const thermostat = this.shadowRoot;
    if (this.temp_selection) {
      this.temp_selection = false;
      thermostat.getElementById('popup').classList.remove('settemp');
      thermostat.getElementById('popup').classList.add('backed');
    } else {
      this.temp_selection = true;
      thermostat.getElementById('popup').classList.add('settemp');
      thermostat.getElementById('popup').classList.remove('backed');
    }
  }

  private _isCancelOverrideButton(target: HTMLButtonElement): boolean {
    console.log({ target });
    const cancelOverrideClass = 'btn--cancel';
    const exists = target.classList.contains(cancelOverrideClass);
    return exists;
  }
  private _isBackButton(target: HTMLDivElement): boolean {
    console.log({ target });
    const BackBtnClass = 'btn-back';
    const exists = target.classList.contains(BackBtnClass);
    return exists;
  }
  private _isConfirmButton(target: HTMLDivElement): boolean {
    console.log({ target });
    const confirmBtnClass = 'btn-confirm';
    const exists = target.classList.contains(confirmBtnClass);
    return exists;
  }

  firstUpdated() {
    if (this.settings && !this.settingsCustomCard) {
      const mic = this.shadowRoot.querySelector('more-info-controls').shadowRoot;
      mic.removeChild(mic.querySelector('app-toolbar'));
    } else if (this.settings && this.settingsCustomCard) {
      this.shadowRoot.querySelectorAll('card-maker').forEach(customCard => {
        let card = {
          type: customCard.dataset.card,
        };
        card = Object.assign({}, card, JSON.parse(customCard.dataset.options));
        customCard.config = card;

        let style = '';
        if (customCard.dataset.style) {
          style = customCard.dataset.style;
        }

        if (style != '') {
          let itterations = 0;
          const interval = setInterval(function() {
            const el = customCard.children[0];
            if (el) {
              window.clearInterval(interval);

              const styleElement = document.createElement('style');
              styleElement.innerHTML = style;
              el.shadowRoot.appendChild(styleElement);
            } else if (++itterations === 10) {
              window.clearInterval(interval);
            }
          }, 100);
        }
      });
    }
  }

  updated(): void {
    this._setTemp = this._getSetTemp(this.hass!.states[this.config!.entity]);
    this.temp_overlay = this._getOverlayState(this.hass!.states[this.config!.overlay]);
  }

  _openSettings(): void {
    this.shadowRoot.getElementById('popup').classList.add('off');
    this.shadowRoot.getElementById('settings').classList.add('on');
  }
  _closeSettings(): void {
    this.shadowRoot.getElementById('settings').classList.remove('on');
    this.shadowRoot.getElementById('popup').classList.remove('off');
  }
  _thermostat_mousedown(): void {
    this.shadowRoot.getElementById('thermostat').classList.add('mousedown');
  }
  _thermostat_mouseup(): void {
    this.shadowRoot.getElementById('thermostat').classList.remove('mousedown');
  }

  _change_track(e): void {
    this.shadowRoot.getElementById('track').style.height = ((100 / 21) * (e.srcElement.value - 4)).toString() + '%';
    const temp_string = e.srcElement.value.toString();
    const temp_string_deg = e.srcElement.value.toString() + '&#176;';
    if (e.srcElement.value - 4 > 0) {
      this.shadowRoot.getElementById('popup').className = this.shadowRoot
        .getElementById('popup')
        .className.replace(/temp.*/g, '');
      this.shadowRoot.getElementById('popup').classList.add('temp-' + temp_string);
      this.shadowRoot.getElementById('target_temp_track').innerHTML = temp_string_deg;
    } else {
      this.shadowRoot.getElementById('popup').className = this.shadowRoot
        .getElementById('popup')
        .className.replace(/temp.*/g, '');
      this.shadowRoot.getElementById('popup').classList.add('temp-off');
      this.shadowRoot.getElementById('target_temp_track').innerHTML = 'OFF';
    }
    console.log(e.srcElement.value);
    this.temp_wanted = e.srcElement.value;
  }

  _getSetTemp(stateObj) {
    if (stateObj.state === 'unavailable') {
      return this.hass!.localize('state.default.unavailable');
    }
    if (stateObj.attributes.target_temp_low && stateObj.attributes.target_temp_high) {
      return [stateObj.attributes.target_temp_low, stateObj.attributes.target_temp_high];
    }
    return stateObj.attributes.temperature;
  }

  _getOverlayState(stateObj) {
    const overlay = stateObj.state;
    if (overlay === 'unavailable') {
      return this.hass!.localize('state.default.unavailable');
    }
    const isTrueSet = overlay === 'True';
    return isTrueSet;
  }

  _close(event): void {
    if (event && event.target.classList.length > 0) {
      if (event.target.classList.contains('popup-inner') || event.target.classList.contains('settings-inner')) {
        closePopUp();
      }
    }
  }

  _setTemperature(temperature: number): void {
    console.log(temperature);
    this.hass!.callService('climate', 'set_temperature', {
      entity_id: this.config!.entity,
      temperature: temperature,
    });
  }
  _handleModeClick(): void {
    this.hass!.callService('climate', 'set_hvac_mode', {
      entity_id: this.config!.entity,
      hvac_mode: 'auto',
    });
  }
  // _compareClimateHvacModes = (mode1, mode2) => this.hvacModeOrdering[mode1] - this.hvacModeOrdering[mode2];

  setConfig(config: { entity: string; heating: string; overlay: string; title: string }): void {
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

  // getCardSize(): number {
  //   return 1;
  // }

  // Import Styling Externally
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  static get styles() {
    return [animation_styling, shared_styling, thermostat_styling, slider_styling];
  }
}

customElements.define('tado-popup-card', TadoPopupCard);
