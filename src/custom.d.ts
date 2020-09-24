import { LitElement, html, css, svg, CSSResult, TemplateResult, SVGTemplateResult } from 'lit-element';

declare module '*.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.scss' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.sass' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.less' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.styl' {
  const classes: { [key: string]: string };
  export default classes;
}
