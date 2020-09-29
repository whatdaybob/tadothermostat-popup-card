import { html, css, TemplateResult } from 'lit-element';

export function _render_graphpos(x: number, y: number): TemplateResult {
  return html`
    <svg
      width="15"
      height="15"
      xmlns="http://www.w3.org/2000/svg"
      class="b-bubble-graph__current_position ng-star-inserted"
      style="top: ${x}px; left: ${y}px;"
    >
      <circle cx="7.5" cy="7.5" r="7.5" fill="white"></circle>
    </svg>
  `;
}

export function _air_comfort(temperature, humidity): TemplateResult {
  const best_temperature = 20;
  const temp_range = 10;
  const svg_size = 153;
  const svg_outer_stroke = 2;
  const y = humidity;
  let temp_start = 0,
    x = 0,
    __type = 'none';
  // calculate temp y range
  if (temperature > best_temperature) {
    __type = 'hot';
    temp_start = temperature - best_temperature;
    if (temp_start > temp_range) {
      x = 100;
    } else {
      x = (temp_start / best_temperature) * 100;
    }
  } else {
    __type = 'cold';
    temp_start = temperature - best_temperature + temp_range;
    if (temp_start < 0) {
      x = 0;
    } else {
      x = (temp_start / best_temperature) * 100;
    }
  }
  return html`
    <div class="b-card" style="background: linear-gradient(110deg, rgb(107, 176, 179), rgb(77, 150, 153));">
      <header class="b-card__header">
        <h2 class="b-card-header__room-name">Master Bedroom</h2>
        <div class="b-thermal-comfort ng-star-inserted">
          <h3 class="b-thermal-comfort_status">
            <span class="ng-star-inserted">Cold</span>
          </h3>
        </div>
      </header>
      <main class="b-bubble">
        <span class="b-bubble__label-top">Too warm</span>
        <span class="b-bubble__label-bottom">Cold</span>
        <span class="b-bubble__label-left">Dry</span>
        <span class="b-bubble__label-right">Humid</span>
        <div class="b-bubble__graph">
          ${_render_graphpos(x, y)}
          <svg width="${svg_size}" height="${svg_size}" xmlns="http://www.w3.org/2000/svg">
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
              r="${(svg_size / 100) * 39.2}"
              fill="white"
              opacity=".6"
            ></circle>
          </svg>
        </div>
        <div class="b-bubble__alert"></div>
      </main>
      <footer class="b-card__footer">
        <div>
          <h4 class="b-measurement__label">Temperature</h4>
          <div class="b-measurement__content">
            <div class="b-value-with-alert">
              <svg appSvgSymbol="warning" class="b-value-with-alert__alert ng-star-inserted">
                <path
                  d="M6 12A6 6 0 1 1 6 0a6 6 0 0 1 0 12zM6 1.5a1 1 0 0 0-1 1v4a1 1 0 1 0 2 0v-4a1 1 0 0 0-1-1zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
                />
              </svg>
              <div class="app-temperature-display b-value-with-alert__value">
                <div class="ng-star-inserted">
                  <div class="b-temperature ng-star-inserted">20°</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <h4 class="b-measurement__label">Humidity</h4>
          <div class="b-measurement__content">
            <div class="b-value-with-alert">
              <app-humidity class="b-value-with-alert__value" _nghost-coq-c70="">
                <div _ngcontent-coq-c70="" class="b-humidity ng-star-inserted">
                  {' '} 52%
                </div>
              </app-humidity>
            </div>
          </div>
        </div>
      </footer>
      <app-air-comfort-message class="b-card__message ng-star-inserted" _nghost-coq-c96="">
        <aside _ngcontent-coq-c96="" class="message">
          <figure _ngcontent-coq-c96="" class="stacked">
            <figcaption _ngcontent-coq-c96="" class="message__text text-center" style="width: 100%;">
              <p _ngcontent-coq-c96="">
                Feel like getting under a warm blanket? Turn up your heating a bit to stay comfy in here.
              </p>
            </figcaption>
          </figure>
          <footer _ngcontent-coq-c96="" class="message__link text-center stacked ng-star-inserted">
            <a
              _ngcontent-coq-c96=""
              class="b-btn b-btn--more text-center ng-star-inserted"
              href="/app/en/main/home/zone/1"
            >
              <span _ngcontent-coq-c96="">Adjust heating</span>
            </a>
          </footer>
        </aside>
      </app-air-comfort-message>
    </div>
  `;
}

export const animation_styling = css`
  .b-card {
    font-size: 0.8em;
    color: #fff;
    margin-bottom: 10px;
    max-width: 360px;
    min-height: 375px;
    border-radius: 10px;
    box-shadow: 0 5px 5px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-flow: column nowrap;
    justify-content: space-between;
    align-items: center;
    overflow: hidden;
  }
  .b-card__header {
    width: 100%;
    flex: 0 0 auto;
    padding: 16px;
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    align-items: flex-start;
  }
  .b-card-header__room-name {
    min-width: 30%;
    margin-top: 0;
    margin-right: 15px;
    font-size: 1.8em;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .b-thermal-comfort {
    max-width: 70%;
  }
  .b-thermal-comfort_status {
    margin: 0;
    font-family: DIN2014, serif;
    font-size: 1.8em;
    text-transform: uppercase;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: right;
  }
  .b-bubble {
    flex: 0 0 246px;
    padding-top: 10px;
    position: relative;
    display: grid;
    grid-template-columns: 1fr 153px 1fr;
    grid-auto-rows: -webkit-min-content;
    grid-auto-rows: min-content;
    text-align: center;
    align-items: center;
    grid-column-gap: 5px;
    grid-row-gap: 5px;
    text-transform: uppercase;
  }
  .b-bubble__label-top {
    grid-row-start: 1;
    grid-column-start: 2;
  }
  .b-bubble__label-bottom {
    grid-row-start: 3;
    grid-column-start: 2;
  }
  .b-bubble__label-left {
    grid-row-start: 2;
    grid-column-start: 1;
    text-align: right;
  }
  .b-bubble__label-right {
    grid-row-start: 2;
    grid-column-start: 3;
  }
  .b-bubble__graph {
    grid-row-start: 2;
    grid-column-start: 2;
    position: relative;
    overflow: hidden;
  }
  .b-bubble-graph__current_position,
  .b-bubble__alert {
    position: absolute;
  }
  .b-bubble__alert {
    bottom: 10px;
    left: 0;
    right: 0;
  }
  .b-card__footer {
    width: 100%;
    flex: 0 0 51px;
    padding-bottom: 16px;
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-around;
    align-items: flex-end;
  }
  .b-measurement__label {
    margin-bottom: 3px;
    text-transform: uppercase;
    font-weight: 400;
  }
  .b-measurement__content,
  .b-value-with-alert {
    display: flex;
    justify-content: center;
  }
  .b-value-with-alert {
    align-items: center;
    position: relative;
  }
  .b-value-with-alert__alert {
    width: 12px;
    height: 12px;
    position: absolute;
    right: 100%;
    bottom: 5px;
    margin-right: 4px;
    fill: #fff;
    opacity: 0.7;
  }
  .b-value-with-alert__value {
    font-size: 1.5em;
  }
  .b-temperature {
    font-family: DIN2014DEGREE, serif;
    font-weight: 400;
  }
  .b-humidity {
    font-family: DIN2014DEGREE, serif;
    font-weight: 400;
  }
  .app-air-comfort-message {
    display: block;
    width: 100%;
    background-color: #fff;
  }
  .message {
    color: #485258;
    font-size: 14px;
  }
  .message figure {
    display: flex;
  }
  .stacked {
    margin: 16px 0;
    padding: 0 16px;
  }
  .text-center {
    text-align: center;
  }
`;
