import * as React from "react";

export interface ColorSelectorProps {
  color: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  hideInput?: boolean;
}

declare const ColorSelector: React.FC<ColorSelectorProps>;

export default ColorSelector;
