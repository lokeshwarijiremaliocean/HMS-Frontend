import { useState } from "react";
import { MdWarning, MdDelete, MdClose } from "react-icons/md";
import { deleteStudent, getStudentByRollNo, getAllStudents } from "../../api/studentApi";
import { extractSingleStudent, extractStudentList, extractErrorMessage } from "./studentUtils";

function StudentDeleteModal({
  allStudents = [],
  initialQuery = "",
  initialStudent = null,
  showToast,
  onSuccess,
  onClose,
}) {
  const [deleteQuery, setDeleteQuery] = useState(initialQuery);
  const [deleteDbId, setDeleteDbId] = useState(initialStudent?.id || null);
  const [deleteInfo, setDeleteInfo] = useState(
    initialStudent
      ? `${initialStudent.first_name} ${initialStudent.last_name} (Roll No: ${initialStudent.roll_no})`
      : ""
  );
  const [modalOpen, setModalOpen] = useState(initialStudent ? true : false);
  const [deleting, setDeleting] = useState(false);
  const [resolving, setResolving] = useState(false);

  const handleOpenConfirm = async () => {
    const inputVal = deleteQuery.trim();
    if (!inputVal && !deleteDbId) {
      showToast("error", "Please enter a Student ID or Roll Number");
      return;
    }

    setResolving(true);
    let resolvedId = deleteDbId;
    let resolvedInfo = deleteInfo;

    try {
      if (!resolvedId && inputVal) {
        // 1. Check in-memory allStudents first
        let s = allStudents.find(
          (item) => String(item.id) === inputVal || String(item.roll_no) === inputVal
        );

        // 2. If not found, call roll_no API
        if (!s) {
          try {
            const rollRes = await getStudentByRollNo(inputVal);
            s = extractSingleStudent(rollRes.data);
          } catch {
            // ignore
          }
        }

        // 3. If still not found, fetch all students
        if (!s) {
          try {
            const allRes = await getAllStudents();
            const list = extractStudentList(allRes.data);
            s = list.find(
              (item) => String(item.id) === inputVal || String(item.roll_no) === inputVal
            );
          } catch {
            // ignore
          }
        }

        if (s) {
          resolvedId = s.id;
          resolvedInfo = `${s.first_name} ${s.last_name} (Roll No: ${s.roll_no}, ID: #${s.id})`;
        } else if (!isNaN(parseInt(inputVal, 10))) {
          // If user entered a direct numeric ID
          resolvedId = parseInt(inputVal, 10);
          resolvedInfo = `Student ID #${inputVal}`;
        }
      }

      if (!resolvedId) {
        showToast("error", "Student not found with specified ID or Roll Number");
        return;
      }

      setDeleteDbId(resolvedId);
      setDeleteInfo(resolvedInfo);
      setModalOpen(true);
    } finally {
      setResolving(false);
    }
  };

  const handleExecuteDelete = async () => {
    if (!deleteDbId) return;

    setDeleting(true);
    try {
      await deleteStudent(deleteDbId);
      showToast("success", "Student deleted successfully");
      setModalOpen(false);
      setDeleteQuery("");
      setDeleteDbId(null);
      setDeleteInfo("");
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      showToast("error", extractErrorMessage(err, "Failed to delete student"));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="sm-card">
      <div className="sm-card-header">
        <div>
          <h2>Delete Student</h2>
          <p>Remove a student record from the system</p>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="sm-alert-warning">
        <MdWarning className="sm-warning-icon" />
        <div>
          <h4>Warning!</h4>
          <p>
            Deleting a student will permanently remove their record from the database. This action
            cannot be undone.
          </p>
        </div>
      </div>

      <div className="sm-search-bar-inline" style={{ marginTop: "24px" }}>
        <div className="sm-field flex-1">
          <label>
            Student ID / Roll No <span className="required">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter Student ID or Roll Number"
            value={deleteQuery}
            onChange={(e) => {
              setDeleteQuery(e.target.value);
              setDeleteDbId(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleOpenConfirm()}
          />
        </div>
        <button
          className="sm-btn-danger search-btn-align"
          onClick={handleOpenConfirm}
          disabled={resolving}
        >
          {resolving ? <span className="sm-spinner" /> : <MdDelete />}
          {resolving ? "Locating..." : "Delete Student"}
        </button>
      </div>

      {/* Confirmation Modal */}
      {modalOpen && (
        <div className="sm-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="sm-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="sm-modal-icon-container">
              <MdWarning className="modal-warning-icon" />
            </div>
            <h3>Delete Student?</h3>
            <p>
              Are you sure you want to permanently delete{" "}
              <strong>{deleteInfo || `Student #${deleteDbId}`}</strong>?
            </p>
            <div className="sm-modal-actions">
              <button
                className="sm-btn-modal-cancel"
                onClick={() => setModalOpen(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="sm-btn-modal-danger"
                onClick={handleExecuteDelete}
                disabled={deleting}
              >
                {deleting ? <span className="sm-spinner" /> : <MdDelete />}
                {deleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentDeleteModal;
