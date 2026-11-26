import React, { useEffect, useRef, useState } from "react";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import { CLOUD_NATIVE_DOWNLOAD_FORMATS } from "../../pages/Dashboard/Toolbars/DataDownloader/ContextLayer";
import { Notification, NotificationStatus } from "../Notification";
import { DjangoRequests } from "../../Requests";
import { useTranslation } from "react-i18next";

// Declare global urls type
declare const urls: {
  api: {
    download: string;
  };
};

interface Props {
  id: number;
  baseUrl?: string;
  ItemComponent?: React.ComponentType<any>;
}

interface DownloadResponse {
  uuid: string;
  path: string;
}

type DownloadFormat = keyof typeof CLOUD_NATIVE_DOWNLOAD_FORMATS;

/** Poll every second, give up after 5 minutes. */
const POLL_INTERVAL_MS = 1000;
const POLL_TIMEOUT_MS = 5 * 60 * 1000;

/** Do not throw on HTTP error codes; the status is handled by the caller. */
const ANY_STATUS = { validateStatus: () => true };

export function CloudNativeDownloadComponent({
  id,
  baseUrl,
  ItemComponent = MenuItem,
}: Props) {
  // Notification
  const notificationRef = useRef(null);
  const notify = (
    newMessage: string,
    newSeverity = NotificationStatus.INFO,
  ) => {
    notificationRef?.current?.notify(newMessage, newSeverity);
  };

  const { t } = useTranslation();
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(
    null,
  );
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  baseUrl = baseUrl || urls.api.download.replace("/0", `/${id}`);

  const stopPolling = () => {
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return stopPolling;
  }, []);

  /** Read the reason of a failed download from the JSON error response. */
  const getErrorDetail = async (path: string): Promise<string> => {
    try {
      const response = await DjangoRequests.get(path, ANY_STATUS);
      return response.data?.note || response.data?.error || "";
    } catch (error) {
      return "";
    }
  };

  const notifyDownloadError = (detail: string) => {
    const message = t("components.contextLayerDownload.downloadError");
    notify(detail ? `${message} ${detail}` : message, NotificationStatus.ERROR);
  };

  const finish = () => {
    stopPolling();
    setDownloadingFormat(null);
  };

  const poll = (path: string, startedAt: number) => {
    pollTimeoutRef.current = setTimeout(async () => {
      let status: number;
      try {
        status = (await DjangoRequests.head(path, ANY_STATUS)).status;
      } catch (error) {
        // Network error
        notifyDownloadError("");
        finish();
        return;
      }

      // Ready: download the file
      if (status === 200) {
        finish();
        window.open(path, "_blank");
        return;
      }

      // 400 = not ready yet: keep polling until the timeout
      if (status === 400) {
        if (Date.now() - startedAt < POLL_TIMEOUT_MS) {
          poll(path, startedAt);
        } else {
          notify(
            t("components.contextLayerDownload.timeout"),
            NotificationStatus.ERROR,
          );
          finish();
        }
        return;
      }

      // Failed (500), file not found (404) or other errors
      notifyDownloadError(await getErrorDetail(path));
      finish();
    }, POLL_INTERVAL_MS);
  };

  const handleDownload = async (format: DownloadFormat) => {
    setDownloadingFormat(format);

    try {
      const downloadUrl = baseUrl + "?file_format=" + format;
      const response = await DjangoRequests.post(downloadUrl, {}, ANY_STATUS);
      if (response.status !== 200) {
        const detail = response.data?.error || "";
        const message = t("components.contextLayerDownload.startError");
        notify(
          detail ? `${message} ${detail}` : message,
          NotificationStatus.ERROR,
        );
        setDownloadingFormat(null);
        return;
      }

      const data: DownloadResponse = response.data;
      poll(data.path, Date.now());
    } catch (error) {
      notify(
        t("components.contextLayerDownload.startError"),
        NotificationStatus.ERROR,
      );
      setDownloadingFormat(null);
    }
  };

  return (
    <>
      {(Object.keys(CLOUD_NATIVE_DOWNLOAD_FORMATS) as DownloadFormat[]).map(
        (format) => (
          <ItemComponent
            key={format}
            onClick={() => handleDownload(format)}
            disabled={downloadingFormat !== null}
          >
            {CLOUD_NATIVE_DOWNLOAD_FORMATS[format]}
            {downloadingFormat === format && (
              <>
                <CircularProgress size={16} style={{ marginLeft: 4 }} />
              </>
            )}
          </ItemComponent>
        ),
      )}
      <Notification ref={notificationRef} />
    </>
  );
}
