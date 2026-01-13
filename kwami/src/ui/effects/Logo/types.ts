export interface KwamiLogoOptions {
  className?: string;
  gradientId?: string;
  strokeWidth?: number;
  /** Optional inline styles for the SVG element. */
  style?: Partial<CSSStyleDeclaration>;
}

export interface KwamiLogoLinkOptions extends KwamiLogoOptions {
  href?: string;
  target?: string;
  rel?: string;
  ariaLabel?: string;
  linkClassName?: string;
}
