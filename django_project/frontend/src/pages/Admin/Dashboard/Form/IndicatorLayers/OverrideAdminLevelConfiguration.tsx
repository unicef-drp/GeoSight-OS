import React from "react";
import { useTranslation } from "react-i18next";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import { ViewLevelConfiguration } from "../../../Components/Input/ReferenceLayerLevelConfiguration";
import { LevelConfig } from "../../../../../types/IndicatorLayer";

interface ReferenceLayer {
  identifier: string;

  [key: string]: unknown;
}

interface Props {
  levelConfig: LevelConfig | undefined;
  onChange: (levelConfig: LevelConfig | null) => void;
  referenceLayer: ReferenceLayer;
}

export default function OverrideAdminLevelConfiguration({
  levelConfig,
  onChange,
  referenceLayer,
}: Props) {
  const { t } = useTranslation();
  const isEnabled = !!(levelConfig && Object.keys(levelConfig).length);

  return (
    <div className="OverrideAdminLevel">
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              checked={isEnabled}
              onChange={(evt) => {
                onChange(
                  evt.target.checked
                    ? {
                        default_level: 0,
                        levels: [],
                      }
                    : null,
                );
              }}
            />
          }
          label={t('admin.dashboard.form.indicatorLayers.overrideAdminLevel')}
        />
      </FormGroup>
      {isEnabled ? (
        <ViewLevelConfiguration
          // @ts-ignore
          data={levelConfig}
          setData={onChange}
          referenceLayer={referenceLayer}
          ableToSelectReferenceLayer={true}
        />
      ) : null}
    </div>
  );
}
