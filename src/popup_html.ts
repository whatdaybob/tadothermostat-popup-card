import { html } from 'lit-element';

export const tado_temp = html`
  <div class="tado-card--slider">
    <div class="temperature-slider--header " style="">
      <div class="temperature-slider--toolbar">
        <div @click="${() => this._thermostat_mouseclick()}">
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
        <svg class="panel-btn " tabindex="2" id="confirm-button" viewBox="0 0 28 28">
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
      <div class="value-label">
        <div class="app-temperature-display"></div>
        <div class="">
          <div class="b-temperature">18°</div>
        </div>
      </div>
    </div>
    <div class="room-thermostat-area--slider" tabindex="0">
      <div class="app-temperature-slider" style="width: 300px; height: 400px; opacity: 1;">
        <div id="track" class="track" style="height: 0%;"></div>
        <input
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
`;

export const tado_default = html`
  <!-- Tado Thermostat START -->
  <div
    class="tado-card"
    @mousedown="${() => this._thermostat_mousedown()}"
    @mouseup="${() => this._thermostat_mouseup()}"
    @click="${() => this._thermostat_mouseclick()}"
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
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" width="24" height="24">
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
        </div>
        <div class="thermostat__footer  ng-trigger ng-trigger-closeFooter" style="max-height: 0%; opacity: 0"></div>
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
`;
