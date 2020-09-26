# Tado Tadothermostat Popup Card by [@whatdaybob](https://www.github.com/whatdaybob)

<!-- [![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg?style=for-the-badge)](https://github.com/custom-components/hacs) -->

A custom popup lovelace card for use with my other card, the [Tado Thermostat Card](https://github.com/whatdaybob/tadothermostat-card).

Depends on having [@thomasloven]'s [browser_mod](https://github.com/thomasloven/hass-browser_mod) installed.

<!-- markdownlint-disable MD033 -->

<a href="https://www.buymeacoffee.com/whatdaybob" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/lato-orange.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 167px !important;" ></a>

<!-- markdownlint-enable MD033 -->

## Configuration

### Installation instructions

**HACS installation:**
Go to the hacs store and use the repo url `https://github.com/whatdaybob/tadothermostat-popup-card` and add this as a custom repository under settings.

Add the following to your ui-lovelace.yaml:

```yaml
resources:
  url: /hacsfiles/tadothermostat-popup-card/tadothermostat-popup-card.js
  type: module
```

**Manual installation:**
Copy the .js file from the dist directory to your www directory and add the following to your ui-lovelace.yaml file:

```yaml
resources:
  url: /local/tadothermostat-popup-card.js
  type: module
```

### Main Options

| Name      | Type   | Required     | Default | Description                                                    |
| --------- | ------ | ------------ | ------- | -------------------------------------------------------------- |
| `type`    | string | **Required** |         | `custom:tado-popup-card`                                       |
| `entity`  | string | **Required** |         | Entity of the tado climate integration (e.g `climate.hallway`) |
| `heating` | string | **Required** |         | Heating sensor related to the climate entity                   |
| `overlay` | string | **Required** |         | Overlay sensor related to the climate entity                   |
| `title`   | string | **Required** |         | Title for the popup card                                       |

Example configuration in lovelace-ui.yaml with use of browser_mod (https://github.com/thomasloven/hass-browser_mod).

```
popup_cards:
  climate.master_bedroom:
    card:
      type: custom:tado-popup-card
      entity: climate.master_bedroom
      heating: sensor.master_bedroom_heating
      overlay: sensor.master_bedroom_overlay
      title: Master Bedroom
```

**FYI: browser_mod replaces any more-info for the climate entity globally**

![Screenshot of popup](https://github.com/whatdaybob/tadothermostat-popup-card/blob/master/media/screenshots/main_page.png)
![Screenshot of popup in off state](https://github.com/whatdaybob/tadothermostat-popup-card/blob/master/media/screenshots/main_off_page.png)
![Screenshot of popup setting temperature](https://github.com/whatdaybob/tadothermostat-popup-card/blob/master/media/screenshots/tempset_page.png)
![Screenshot of popup dynamic temperature background](https://github.com/whatdaybob/tadothermostat-popup-card/blob/master/media/screenshots/tempset-high_page.png)
![Screenshot of popup with manual override](https://github.com/whatdaybob/tadothermostat-popup-card/blob/master/media/screenshots/tempset-high_page.png)
