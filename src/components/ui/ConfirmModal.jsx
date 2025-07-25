import PropTypes from "prop-types";

export default function ConfirmModal({
  show,
  onClose,
  onConfirm,
  message = "هل أنت متأكد؟",
}) {
  if (!show) return null;

  return (
    <div className="modal-backdrop show">
      <div className="modal d-block" tabIndex="-1">
        <div className="modal-header">
          <h5 className="modal-title">تأكيد الحذف</h5>
          <button className="btn-close" onClick={onClose}></button>
        </div>
        <div className="modal-body">
          <p>{message}</p>
        </div>
        <div className="modal-footer d-flex justify-content-end gap-2">
          <button className="btn btn-secondary" onClick={onClose}>
            إلغاء
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            حذف
          </button>
        </div>
      </div>
    </div>
  );
}

ConfirmModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  message: PropTypes.string,
};
