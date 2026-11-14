import React from "react";
import { useTranslation } from "react-i18next";

interface Props {
  name: string;
  description: string;
  onChangeName: (name: string) => void;
  onChangeDescription: (description: string) => void;
  nameHelp?: React.ReactNode;
  descriptionHelp?: React.ReactNode;
}

export default function LayerNameDescription({
  name,
  description,
  onChangeName,
  onChangeDescription,
  nameHelp,
  descriptionHelp,
}: Props) {
  const { t } = useTranslation();
  return (
    <>
      <div className="BasicFormSection">
        <div>
          <label className="form-label required">{t('name')}</label>
        </div>
        <div className="ContextLayerConfig-IconSize">
          <input
            className="LayerNameInput"
            type="text"
            spellCheck={false}
            value={name}
            onChange={(evt) => onChangeName(evt.target.value)}
          />
        </div>
        {nameHelp}
      </div>
      <div className="BasicFormSection">
        <div>
          <label className="form-label">{t('description')}</label>
        </div>
        <div className="ContextLayerConfig-IconSize">
          <textarea
            className="LayerDescriptionInput"
            value={description}
            onChange={(evt) => onChangeDescription(evt.target.value)}
          />
        </div>
        {descriptionHelp}
      </div>
    </>
  );
}