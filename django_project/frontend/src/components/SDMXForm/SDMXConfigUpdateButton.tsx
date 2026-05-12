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
 * __author__ = 'irwan@kartoza.com'
 * __date__ = '07/05/2026'
 * __copyright__ = ('Copyright 2026, Unicef')
 */
import React, { useState } from "react";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";

import { SaveButton } from "../Elements/Button";
import { SDMXConfig, SDMXDataForm } from "../../types/SDMX";

interface Props {
  sdmxConfig: SDMXConfig | null;
  data: SDMXDataForm;
  onSaved?: () => void;
}

/** Button that PUTs the current SDMXDataForm selections back to the SDMXConfig. */
const SDMXConfigUpdateButton = ({ sdmxConfig, data, onSaved }: Props) => {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSave =
    !!sdmxConfig?.id &&
    !!data.agencyId &&
    !!data.agencyName &&
    !!data.dataflowId &&
    !!data.dataflowName &&
    !!data.dataflowDsdId &&
    !!data.dataflowVersionId;

  const handleSave = () => {
    if (!canSave) return;
    setSaving(true);
    setSaved(false);
    setError(null);

    // @ts-ignore
    const csrfToken = csrfmiddlewaretoken;
    axios
      .patch(
        `/api/sdmx/${sdmxConfig.id}`,
        {
          agency_id: data.agencyId,
          dataflow_id: data.dataflowId,
          dataflow_dsd_id: data.dataflowDsdId,
          dataflow_version_id: data.dataflowVersionId,
        },
        {
          headers: { "X-CSRFToken": csrfToken },
        },
      )
      .then(() => {
        setSaved(true);
        onSaved?.();
      })
      .catch((err) =>
        setError(
          err?.response?.data?.detail || err.message || "Failed to save",
        ),
      )
      .finally(() => setSaving(false));
  };

  return (
    <section className="BasicFormSection">
      <SaveButton
        variant="primary"
        text={
          saving ? (
            <CircularProgress size="1rem" />
          ) : saved ? (
            "Saved!"
          ) : (
            "Update Config"
          )
        }
        disabled={!canSave || saving}
        onClick={handleSave}
      />
      {error && <span className="form-helptext error">{error}</span>}
    </section>
  );
};

export default SDMXConfigUpdateButton;
