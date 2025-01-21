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
 * __date__ = '08/01/2025'
 * __copyright__ = ('Copyright 2023, Unicef')
 */
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useRef,
  useState
} from "react";
import {
  ConfirmDialog,
  ConfirmDialogProps
} from "../components/ConfirmDialog";

interface ConfirmDialogContextValue {
  openConfirmDialog: (options: ConfirmDialogProps) => void;
}

const ConfirmDialogContext = createContext<ConfirmDialogContextValue | undefined>(undefined);

export const ConfirmDialogProvider: React.FC<{
  children: ReactNode
}> = ({ children }) => {
  const [dialogOptions, setDialogOptions] = useState<ConfirmDialogProps>({
    header: '',
    onConfirmed: null,
    onRejected: null,
    children: null
  });
  const confirmDialogRef = useRef<any>(null);

  const openConfirmDialog = useCallback((options: ConfirmDialogProps) => {
    if (confirmDialogRef.current) {
      setDialogOptions(options);
      confirmDialogRef.current.open();
    }
  }, []);

  return (
    <ConfirmDialogContext.Provider value={{ openConfirmDialog }}>
      {children}
      <ConfirmDialog
        header={dialogOptions.header}
        onConfirmed={dialogOptions.onConfirmed}
        onRejected={dialogOptions.onRejected}
        ref={confirmDialogRef}
      >
        {dialogOptions.children}
      </ConfirmDialog>
    </ConfirmDialogContext.Provider>
  );
};

export const useConfirmDialog = (): ConfirmDialogContextValue => {
  const context = useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error("useConfirmDialog must be used within a ConfirmDialogProvider");
  }
  return context;
};