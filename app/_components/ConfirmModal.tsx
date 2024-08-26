import { FC } from 'react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    message: string;
}

const ConfirmModal: FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  message,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-primary w-[75%] p-6 rounded-lg shadow-lg md:w-[50%]">
        <p className="mb-4 text-center relative">{message}</p>
        <div className="flex justify-center">
          <button
            className="px-2 py-1 rounded-lg  bg-gray-200 text-gray-800 mr-2"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-2 py-1 bg-red-500 text-white rounded-lg"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;