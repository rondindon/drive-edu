// src/pages/admin/reports/ReportDetailModal.tsx

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "src/components/ui/dialog";
import { Button } from "src/components/ui/button";
import { Report } from "./ReportTypes";
import { FaExclamationTriangle } from "react-icons/fa";

interface ReportDetailModalProps {
  report: Report;
  onClose: () => void;
  onApprove: (reportId: number) => void;
  onResolve: (reportId: number) => void;
  onDelete: (reportId: number) => void;
}

const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  report,
  onClose,
  onApprove,
  onResolve,
  onDelete,
}) => {
  // Local handlers that call parent callbacks with `report.id`
  const handleApprove = () => onApprove(report.id);
  const handleResolve = () => onResolve(report.id);
  const handleDelete = () => onDelete(report.id);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FaExclamationTriangle className="text-red-500" />
            Report Details
          </DialogTitle>
          <DialogDescription>
            Detailed information about the reported question and the issue.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <h3 className="font-semibold">User Information</h3>
            <p>Name: {report.user.name}</p>
            <p>Email: {report.user.email}</p>
          </div>

          <div>
            <h3 className="font-semibold">Question Details</h3>
            <p>ID: {report.question.id}</p>
            <p>Text: {report.question.text}</p>
            {report.question.imageUrl && (
              <img
                src={report.question.imageUrl}
                alt="Question"
                className="w-32 h-auto mt-2 rounded"
              />
            )}
          </div>

          <div>
            <h3 className="font-semibold">Report Description</h3>
            <p>{report.description}</p>
          </div>

          <div>
            <h3 className="font-semibold">Submitted At</h3>
            <p>{new Date(report.createdAt).toLocaleString()}</p>
          </div>

          {report.comments && (
            <div>
              <h3 className="font-semibold">Admin Comments</h3>
              <p>{report.comments}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          {/* Always visible close */}
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>

          {/* Status-based actions */}
          {report.status === "Pending" && (
            <>
              <Button
                onClick={handleApprove}
                className="bg-yellow-500 text-white hover:bg-yellow-600"
              >
                Mark as Reviewed
              </Button>
              <Button
                onClick={handleResolve}
                className="bg-green-500 text-white hover:bg-green-600"
              >
                Resolve
              </Button>
              <Button
                onClick={handleDelete}
                className="bg-red-500 text-white hover:bg-red-600"
              >
                Delete
              </Button>
            </>
          )}
          {report.status === "Reviewed" && (
            <>
              <Button
                onClick={handleResolve}
                className="bg-green-500 text-white hover:bg-green-600"
              >
                Resolve
              </Button>
              <Button
                onClick={handleDelete}
                className="bg-red-500 text-white hover:bg-red-600"
              >
                Delete
              </Button>
            </>
          )}
          {report.status === "Resolved" && (
            <Button
              onClick={onClose}
              className="bg-gray-500 text-white hover:bg-gray-600"
            >
              Close
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportDetailModal;