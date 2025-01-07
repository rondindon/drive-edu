import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "src/components/ui/dialog";
import { Test } from "./AdminTests";

interface TestDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  test: Test | null;
}

const TestDetailsDialog: React.FC<TestDetailsDialogProps> = ({ open, onClose, test }) => {
  if (!test) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Test Details - ID: {test.id}</DialogTitle>
          <DialogClose />
        </DialogHeader>
        <div className="space-y-2">
          <p><strong>User:</strong> {test.user.username} ({test.user.email})</p>
          <p><strong>Group:</strong> {test.group}</p>
          <p><strong>Score:</strong> {test.score}</p>
          <p><strong>Time Taken:</strong> {Math.floor(test.timeTaken / 60)}m {test.timeTaken % 60}s</p>
          <p><strong>Passed:</strong> {test.isPassed ? "Yes" : "No"}</p>
          <p><strong>Created At:</strong> {new Date(test.createdAt).toLocaleString()}</p>
          <p><strong>Updated At:</strong> {new Date(test.updatedAt).toLocaleString()}</p>
          {/* Add more details as necessary */}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TestDetailsDialog;