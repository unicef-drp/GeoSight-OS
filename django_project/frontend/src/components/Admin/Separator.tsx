import React, { ReactElement } from "react";

/** Multiple admin content */
export interface Props {
  children: string | ReactElement;
}

export const Separator = ({ children }: Props) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 0px",
      }}
    >
      <div
        style={{
          flexGrow: 0.5,
          height: "1px",
          borderBottom: "1px solid var(--border-gray)",
        }}
      />
      <div
        style={{
          width: "100px",
          textAlign: "center",
          opacity: 0.5,
        }}
      >
        {children}
      </div>
      <div
        style={{
          flexGrow: 0.5,
          height: "1px",
          borderBottom: "1px solid var(--border-gray)",
        }}
      />
    </div>
  );
};
export default Separator;
