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
 * __date__ = '02/04/2026'
 * __copyright__ = ('Copyright 2023, Unicef')
 */
import React, { useEffect, useRef, useState } from "react";
import Modal, { ModalContent, ModalFooter } from "../Modal";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useConfirmDialog } from "../../providers/ConfirmDialog";

import "./styles.scss";

declare const dataRestorerEnabled: boolean;
declare const csrfmiddlewaretoken: string;

interface FixtureInfo {
  name: string;
  count: number;
}

interface FixtureType {
  name: string;
  description: string;
  info: FixtureInfo[];
}

interface RestoreStatus {
  data_type: string;
  state: "created" | "running" | "finish" | "failed";
  note: string;
}

const POLL_INTERVAL = 3000;

export default function DataRestorerModal() {
  const [open, setOpen] = useState(dataRestorerEnabled);
  const [loading, setLoading] = useState<string | null>(null);
  const [fixtureTypes, setFixtureTypes] = useState<FixtureType[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [restoreStatus, setRestoreStatus] = useState<RestoreStatus | null>(
    null,
  );
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStatus = async () => {
    const r = await fetch("/api/v1/data-restorer/request/status/");
    if (r.status === 404) {
      setRestoreStatus(null);
      return null;
    }
    const data: RestoreStatus = await r.json();
    setRestoreStatus(data);
    return data;
  };

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const startPolling = () => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      const data = await fetchStatus();
      if (!data || data.state === "finish") {
        stopPolling();
        window.location.reload();
      } else if (data.state === "failed") {
        stopPolling();
      }
    }, POLL_INTERVAL);
  };

  useEffect(() => {
    if (!dataRestorerEnabled) return;

    Promise.all([
      fetch("/api/v1/data-restorer/fixture-types/").then((r) => r.json()),
      fetchStatus(),
    ]).then(([types, status]) => {
      setFixtureTypes(types);
      if (status && status.state !== "finish") {
        startPolling();
      }
    });

    return stopPolling;
  }, []);

  const { openConfirmDialog } = useConfirmDialog();

  const doRestore = async (dataType: string) => {
    setLoading(dataType);
    try {
      await fetch("/api/v1/data-restorer/request/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfmiddlewaretoken,
        },
        body: JSON.stringify({ data_type: dataType }),
      });
      await fetchStatus();
      startPolling();
    } finally {
      setLoading(null);
    }
  };

  const handleConfirm = (dataType: string) => {
    openConfirmDialog({
      header: `Restore ${dataType} data?`,
      children: `This will restore the ${dataType} dataset. Any existing data will be overwritten and cannot be recovered. Are you sure you want to continue?`,
      theme: "Error",
      onConfirmed: () => doRestore(dataType),
    });
  };

  const handleSkip = () => {
    openConfirmDialog({
      header: "Skip data restoration?",
      children:
        "You are about to skip restoring data. This option will no longer be available once dismissed. Are you sure?",
      onConfirmed: async () => {
        await fetch("/api/v1/data-restorer/preferences/disable/", {
          method: "POST",
          headers: { "X-CSRFToken": csrfmiddlewaretoken },
        });
        setOpen(false);
      },
    });
  };

  const isFailed = restoreStatus?.state === "failed";
  const isRestoring =
    restoreStatus !== null &&
    restoreStatus.state !== "finish" &&
    restoreStatus.state !== "failed";

  return (
    <Modal
      open={open}
      onClosed={() => {}}
      className="DataRestorerModal"
      disableBackdropClick
    >
      <div className="modal--header">
        <div className="modal--header--title">Welcome to GeoSight</div>
      </div>
      <ModalContent>
        {isRestoring ? (
          <div className="DataRestorerModal__restoring">
            <div className="DataRestorerModal__restoring__spinner" />
            <div className="DataRestorerModal__restoring__text">
              <strong>Restoring {restoreStatus.data_type} data…</strong>
              <p>
                Please wait while the data is being restored. This may take a
                few moments.
              </p>
              <div className="DataRestorerModal__restoring__state">
                Status: {restoreStatus.state}
              </div>
            </div>
          </div>
        ) : isFailed ? (
          <div className="DataRestorerModal__failed">
            <strong>Restoration failed</strong>
            <p>
              An error occurred while restoring{" "}
              <em>{restoreStatus!.data_type}</em> data.
            </p>
            {restoreStatus!.note && (
              <pre className="DataRestorerModal__failed__note">
                {restoreStatus!.note}
              </pre>
            )}
            <Button
              // @ts-ignore
              variant="primary"
              onClick={() => setRestoreStatus(null)}
            >
              ← Back to welcome message
            </Button>
          </div>
        ) : (
          <>
            <p>
              Welcome! It looks like this is a fresh installation with no data
              yet. Choose a dataset below to restore and get started quickly, or
              skip if you prefer to set things up manually.
            </p>
            <div className="DataRestorerModal__warning">
              <strong>Warning:</strong> Restoring data will overwrite any
              existing data currently in the system. This action cannot be
              undone.
            </div>
            <div className="DataRestorerModal__options">
              {fixtureTypes.map((opt) => {
                const totalCount = opt.info.reduce((s, i) => s + i.count, 0);
                return (
                  <Accordion
                    key={opt.name}
                    expanded={expanded === opt.name}
                    onChange={(_, isExpanded) =>
                      setExpanded(isExpanded ? opt.name : null)
                    }
                    className="DataRestorerModal__option"
                    disableGutters
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      className="DataRestorerModal__option__row"
                    >
                      <span className="DataRestorerModal__option__name">
                        {opt.name}
                      </span>
                      <span className="DataRestorerModal__option__count">
                        {totalCount} items
                      </span>
                      <Button
                        // @ts-ignore
                        variant="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConfirm(opt.name);
                        }}
                        disabled={loading !== null}
                      >
                        {loading === opt.name ? "Restoring…" : "Restore"}
                      </Button>
                    </AccordionSummary>
                    <AccordionDetails className="DataRestorerModal__option__detail">
                      <p className="DataRestorerModal__option__description">
                        {opt.description}
                      </p>
                      {opt.info.length > 0 && (
                        <ul className="DataRestorerModal__option__items">
                          {opt.info.map((item) => (
                            <li key={item.name}>
                              <span>{item.name}</span>
                              <span>{item.count}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </div>
          </>
        )}
      </ModalContent>
      {!isRestoring && (
        <ModalFooter>
          <Button
            // @ts-ignore
            variant="primary"
            onClick={handleSkip}
            disabled={loading !== null}
          >
            Skip restoring data
          </Button>
        </ModalFooter>
      )}
    </Modal>
  );
}
