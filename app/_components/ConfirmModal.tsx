import { FC } from 'react';
import { FaExclamationCircle } from 'react-icons/fa';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    message: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  message,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-primary w-[30%] p-6 rounded-lg shadow-lg">
        <p className="mb-4 text-center relative"><FaExclamationCircle className='text-red-600 w-10 h-5 absolute left-[24px] top-[2px] '/> {message}</p>
        <div className="flex justify-center">
          <button
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded mr-2"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded"
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