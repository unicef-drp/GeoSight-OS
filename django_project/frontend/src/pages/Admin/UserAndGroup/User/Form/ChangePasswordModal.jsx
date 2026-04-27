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
 * __date__ = '27/04/2026'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React, { useState } from "react";
import Modal, {
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "../../../../../components/Modal";
import { SaveButton } from "../../../../../components/Elements/Button";
import { PasswordInput } from "../../../../../components/Input/PasswordInput";
import { DjangoRequests } from "../../../../../Requests";

export default function ChangePasswordModal({ open, onClosed }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setOldPassword("");
    setNewPassword("");
    setRepeatPassword("");
    setError("");
  };

  const handleClose = () => {
    reset();
    onClosed();
  };

  const handleSubmit = async () => {
    if (!oldPassword || !newPassword || !repeatPassword) {
      setError("All fields are required.");
      return;
    }
    if (newPassword !== repeatPassword) {
      setError("New passwords do not match.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await DjangoRequests.post(`/api/user/${user.id}/change-password`, {
        old_password: oldPassword,
        new_password: newPassword,
      });
      reset();
      onClosed(true);
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to change password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClosed={handleClose} className="ChangePasswordModal">
      <ModalHeader onClosed={handleClose}>Change Password</ModalHeader>
      <ModalContent>
        <div className="BasicForm">
          <div className="BasicFormSection">
            <label>Old Password</label>
            <PasswordInput
              fullWidth
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </div>
          <div className="BasicFormSection">
            <label>New Password</label>
            <PasswordInput
              fullWidth
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="BasicFormSection">
            <label>Repeat New Password</label>
            <PasswordInput
              fullWidth
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
            />
          </div>
          {error && <div className="form-error">{error}</div>}
        </div>
      </ModalContent>
      <ModalFooter>
        <SaveButton
          variant="primary"
          text="Change Password"
          disabled={submitting}
          onClick={handleSubmit}
        />
      </ModalFooter>
    </Modal>
  );
}
