import { html, TemplateResult, svg } from 'lit-element';
export function _render_graphpos(x: number, y: number, circle_size: number): TemplateResult {
  const half = circle_size / 2;
  return html`
    <svg
      width="${circle_size}"
      height="${circle_size}"
      xmlns="http://www.w3.org/2000/svg"
      class="bubble__graph-current_position"
      style="top: ${x}px; left: ${y}px;"
    >
      <circle cx="${half}" cy="${half}" r="${half}" fill="white"></circle>
    </svg>
  `;
}

export const airqual_warning = html`
  <svg appSvgSymbol="warning" class="value-with-alert__alert">
    <path
      d="M6 12A6 6 0 1 1 6 0a6 6 0 0 1 0 12zM6 1.5a1 1 0 0 0-1 1v4a1 1 0 1 0 2 0v-4a1 1 0 0 0-1-1zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
    />
  </svg>
`;

export const bubble_humid_warn = svg`
<path style="transform: scale(1.633);" fill="#3849AC" fill-rule="nonzero" d="M125.892 24.108c-4.621-4.357-11.9-4.143-16.257.478-4.357 4.62-4.143 11.899.478 16.256 9.766 9.209 15.392 21.97 15.392 35.658 0 13.69-5.627 26.451-15.394 35.66-4.621 4.357-4.835 11.635-.478 16.256s11.635 4.836 16.256.479c14.33-13.511 22.616-32.305 22.616-52.395 0-20.089-8.285-38.881-22.613-52.392z"></path>
`;

export function _isAirQualityBackButton(target: HTMLButtonElement): boolean {
  /**
   * Temperature Override Cancel button check
   */
  const cancelOverrideClass = 'btn__overview';
  const exists = target.classList.contains(cancelOverrideClass);
  return exists;
}

export function _airquality_mouseclick(e: MouseEvent | null = null, shadowRoot): void {
  const thermostat = shadowRoot;
  if (e !== null && _isAirQualityBackButton(e.target as HTMLButtonElement)) {
    thermostat.getElementById('popup').classList.remove('airquality');
  }
}

export function _air_comfort(shadowRoot, temperature: number, humidity: number): TemplateResult {
  const point_size = 15;
  const lower_temp = 5;
  const upper_temp = 45;
  const temp_range = upper_temp - lower_temp;
  const new_temp = temperature - lower_temp;
  const svg_size = 250;
  const svg_outer_stroke = 2;
  const points = svg_size / 100;
  let x = 0,
    y = 0;
  if (temperature > upper_temp) {
    x = 0;
  } else {
    if (temperature < lower_temp) {
      x = 100 * points;
    } else {
      x = (new_temp / temp_range) * 100 * points - point_size / 2;
      x = svg_size - x;
    }
  }

  y = (svg_size / 100) * humidity - point_size / 2;
  const humwarn = humidity > 60;
  const bubble_humwarn = humidity > 70;
  const tempwarn = temperature < 20;
  let thermal_comfort = '';
  if (humwarn) {
    thermal_comfort = ' humid';
  }
  if (tempwarn) {
    thermal_comfort = thermal_comfort + ' cold';
  }
  if (thermal_comfort == '') {
    thermal_comfort = 'pleasant';
  }

  return html`
    <div class="airqual ${thermal_comfort}">
      <header class="airqual__header">
        <h2 class="airqual-header__room-name">
          <span style="display:none">Master Bedroom</span>
        </h2>
        <div class="thermal-comfort">
          <h3 class="thermal-comfort_status">
            <span>${thermal_comfort}</span>
          </h3>
        </div>
      </header>
      <main class="bubble">
        <span class="bubble__label-top">Too warm</span>
        <span class="bubble__label-bottom">Cold</span>
        <span class="bubble__label-left">Dry</span>
        <span class="bubble__label-right">Humid</span>
        <div class="bubble__graph">
          ${_render_graphpos(x, y, point_size)}
          <svg width="${svg_size}" height="${svg_size}" xmlns="http://www.w3.org/2000/svg">
            ${bubble_humwarn
              ? html`
                  ${bubble_humid_warn}
                `
              : ``}
            <circle
              cx="${svg_size / 2}"
              cy="${svg_size / 2}"
              r="${svg_size / 2 - svg_outer_stroke}"
              stroke="white"
              stroke-width="${svg_outer_stroke}"
              fill="none"
            ></circle>
            <circle
              cx="${svg_size / 2}"
              cy="${svg_size / 2}"
              r="${(svg_size / 2 / 100) * 40}"
              fill="white"
              opacity=".6"
            ></circle>
          </svg>
        </div>
        <div class="bubble__alert">
          ${bubble_humwarn
            ? html`
                <p class="alert alert--humid">Increased risk of mold</p>
              `
            : ``}
        </div>
      </main>
      <footer class="airqual__footer">
        <div>
          <h4 class="measurement__label">Temperature</h4>
          <div class="measurement__content">
            <div class="value-with-alert">
              ${tempwarn
                ? html`
                    ${airqual_warning}
                  `
                : ``}
              <div class="app-temperature-display value-with-alert__value">
                <div>
                  <div class="temperature">${temperature}°</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <h4 class="measurement__label">Humidity</h4>
          <div class="measurement__content">
            <div class="value-with-alert">
              ${humwarn
                ? html`
                    ${airqual_warning}
                  `
                : ``}
              <app-humidity class="value-with-alert__value">
                <div class="humidity">
                  ${humidity}%
                </div>
              </app-humidity>
            </div>
          </div>
        </div>
      </footer>
      <app-air-comfort-message class="airqual__message">
        <aside class="message">
          <figure style="display:none;" class="stacked">
            <figcaption class="message__text text-center" style="width: 100%;">
              <p>
                Feel like getting under a warm blanket? Turn up your heating a bit to stay comfy in here.
              </p>
            </figcaption>
          </figure>
          <footer class="message__link text-center stacked">
            <a
              class="btn btn--more text-center btn__overview"
              @click="${(e: MouseEvent | null | undefined): void => _airquality_mouseclick(e, shadowRoot)}"
            >
              <span style="pointer-events:none;">Back</span>
            </a>
          </footer>
        </aside>
      </app-air-comfort-message>
    </div>
  `;
}
