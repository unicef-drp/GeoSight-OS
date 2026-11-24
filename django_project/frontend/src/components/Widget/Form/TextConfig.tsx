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
   TEXT WIDGET SETTINGS
   The text in Markdown, optionally with HTML; the preview shows it as the
   dashboard will (sanitised).
   ========================================================================== */

import React from "react";
import { useTranslation } from "react-i18next";
import { FormControl } from "@mui/material";
import FormLabel from "@mui/material/FormLabel";

export interface Props {
  text: string;
  setText: (text: string) => void;
}

/** Markdown shown as a hint when the text is empty. */
const PLACEHOLDER = `## Title

Some **bold** text, a [link](https://example.org) and a list:

- first
- second

<span style="color: #1a6ccc; font-size: 1.2rem">Styled text</span>`;

export function TextConfigForm({ text, setText }: Props) {
  const { t } = useTranslation();
  return (
    <FormControl className="MuiForm-RadioGroup TextConfig">
      <FormLabel className="MuiInputLabel-root" htmlFor="text-config-input">
        {t("admin.widget.textContent")}
      </FormLabel>
      <textarea
        id="text-config-input"
        data-testid="text-config"
        className="TextConfig-Input"
        spellCheck={true}
        placeholder={PLACEHOLDER}
        value={text}
        onChange={(evt) => setText(evt.target.value)}
      />
      <div className="TextConfig-Help">{t("admin.widget.textHelp")}</div>
    </FormControl>
  );
}
