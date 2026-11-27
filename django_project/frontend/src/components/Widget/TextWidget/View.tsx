/**
 * GeoSight is UNICEF's geospatial web-based business intelligence platform.
 *
 * Contact : geosight-no-reply@unicef.org
 *
 * .. note:: This program is free software; you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published by
 *     the Free Software Foundation; either version 3 of the License, or
 *     (at your option) any later version.
 *
 * __date__ = '24/11/2026'
 * __copyright__ = ('Copyright 2026, Unicef')
 */

/* ==========================================================================
   TEXT WIDGET
   Markdown (GitHub flavour) with optional HTML. The text is written by the
   dashboard's editors and shown to every viewer, so it is sanitised: no
   scripts, event handlers or javascript: links; links and images use
   http(s) only; inline styles keep only a short list of text properties.
   ========================================================================== */

import React, { memo } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import { Widget } from "../../../types/Widget";

import "./style.scss";

/** CSS properties a text may set inline; anything else is dropped. */
export const ALLOWED_STYLES = [
  "color",
  "background-color",
  "font-size",
  "font-weight",
  "font-style",
  "font-family",
  "text-align",
  "text-decoration",
  "line-height",
  "margin",
  "margin-top",
  "margin-bottom",
  "padding",
  "border",
  "border-radius",
  "width",
  "max-width",
  "height",
];

/** Keep only the allowed declarations of a style attribute. */
export function cleanStyle(style: string): string {
  return style
    .split(";")
    .map((declaration) => declaration.trim())
    .filter((declaration) => {
      const [property, ...rest] = declaration.split(":");
      const value = rest.join(":").toLowerCase();
      return (
        !!property &&
        ALLOWED_STYLES.includes(property.trim().toLowerCase()) &&
        !!value.trim() &&
        // No external resources or expressions in values.
        !/url\s*\(|expression\s*\(|javascript:|@import|\\/.test(value)
      );
    })
    .join("; ");
}

/** The sanitize schema: GitHub's defaults plus style and link targets. */
const schema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    "*": [...(defaultSchema.attributes?.["*"] || []), "style"],
    a: [...(defaultSchema.attributes?.a || []), "target", "rel"],
    img: [...(defaultSchema.attributes?.img || []), "width", "height"],
  },
  protocols: {
    ...defaultSchema.protocols,
    href: ["http", "https", "mailto"],
    src: ["http", "https"],
  },
  // No id/name clobbering prefixes needed in a widget.
  clobberPrefix: "text-widget-",
};

/** After sanitising: clean the styles and open links in a new tab. */
function rehypeSafeStyles() {
  const visit = (node: any) => {
    if (node.type === "element") {
      const props = node.properties || {};
      if (typeof props.style === "string") {
        const cleaned = cleanStyle(props.style);
        if (cleaned) {
          props.style = cleaned;
        } else {
          delete props.style;
        }
      }
      if (node.tagName === "a" && props.href) {
        props.target = "_blank";
        props.rel = "noopener noreferrer";
      }
    }
    (node.children || []).forEach(visit);
  };
  return (tree: any) => visit(tree);
}

export interface Props {
  data: Widget;
}

/** A text widget: the sanitised Markdown/HTML of its config. */
function TextWidgetView({ data }: Props) {
  const text = data.config?.text || "";
  return (
    <div className="widget__text" data-testid="text-widget">
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, schema], rehypeSafeStyles]}
      >
        {text}
      </Markdown>
    </div>
  );
}

export default memo(TextWidgetView);
