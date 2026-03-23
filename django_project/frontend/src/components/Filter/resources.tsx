import { TFunction } from "i18next";

export const permissionFilter =
  (t: TFunction, withDataPermission = false) =>
  () => {
    const options = withDataPermission
      ? [
          { label: t("List"), value: "list" },
          { label: t("Read"), value: "read" },
          { label: t("Read Data"), value: "read_data" },
          { label: t("Write"), value: "write" },
          { label: t("Write Data"), value: "write_data" },
          { label: t("Share"), value: "share" },
          { label: t("Delete"), value: "delete" },
        ]
      : [
          { label: t("List"), value: "list" },
          { label: t("Read"), value: "read" },
          { label: t("Write"), value: "write" },
          { label: t("Share"), value: "share" },
          { label: t("Delete"), value: "delete" },
        ];
    return {
      field: "permission",
      headerName: t("Permission"),
      serverKey: "permission",
      type: "select",
      options: options,
    };
  };
