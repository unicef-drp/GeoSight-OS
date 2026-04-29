import React from "react";
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
          label={"Override admin level configuration"}
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
