import React, { useEffect, useRef, useState } from "react";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import { CLOUD_NATIVE_DOWNLOAD_FORMATS } from "../../pages/Dashboard/Toolbars/DataDownloader/ContextLayer";
import { Notification, NotificationStatus } from "../Notification";
import { DjangoRequests } from "../../Requests"; // Declare global urls type

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

  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(
    null,
  );
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  baseUrl = baseUrl || urls.api.download.replace("/0", `/${id}`);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const checkDownloadStatus = async (path: string): Promise<number> => {
    try {
      const response = await DjangoRequests.head(path);
      return response.status;
    } catch (error) {
      // Network errors or other exceptions
      const errorMessage = `Error on downloading, please retry`;
      notify(errorMessage, NotificationStatus.ERROR);
      return 500;
    }
  };

  const startPolling = (path: string) => {
    pollIntervalRef.current = setInterval(async () => {
      const status = await checkDownloadStatus(path);
      if (status === 200 || status === 500 || status === 404) {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        setDownloadingFormat(null);
        if (path) {
          window.open(path, "_blank");
        }
      }
    }, 1000);
  };

  const handleDownload = async (format: DownloadFormat) => {
    setDownloadingFormat(format);

    try {
      const downloadUrl = baseUrl + "?file_format=" + format;
      const response = await DjangoRequests.post(downloadUrl, {});
      if (response.status !== 200) {
        throw new Error("Download request failed");
      }

      const data: DownloadResponse = await response.data;
      startPolling(data.path);
    } catch (error) {
      notify("Error initiating download:" + error, NotificationStatus.ERROR);
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
