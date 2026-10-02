import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  DocumentApprovalWorkflow,
  ControlledDocumentRevision,
  DocumentCommentItem,
  LIFECYCLE_STATUS_LABELS,
} from '../../types/documentControl';
import { DocumentControlService } from '../../services/documentControlService';

interface ApprovalWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentCode: string;
  revisionNumber: string;
  onStatusChanged?: () => void;
}

export const ApprovalWorkflowModal: React.FC<ApprovalWorkflowModalProps> = ({
  isOpen,
  onClose,
  documentCode,
  revisionNumber,
  onStatusChanged,
}) => {
  const { showToast } = useApp();

  const [workflow, setWorkflow] = useState<DocumentApprovalWorkflow | null>(null);
  const [revisions, setRevisions] = useState<ControlledDocumentRevision[]>([]);
  const [currentRev, setCurrentRev] = useState<ControlledDocumentRevision | null>(null);
  const [comments, setComments] = useState<DocumentCommentItem[]>([]);
  const [activeTab, setActiveTab] = useState<'CHAIN' | 'COMMENTS' | 'REVISIONS'>('CHAIN');

  // Form states for approval/rejection
  const [approvalComment, setApprovalComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  // Simulated current logged in user credentials
  const currentUser = {
    id: 'USR-HSE-99',
    name: 'Tariq Al-Kuwari',
    role: 'Lead HSE Engineer / Reviewer',
  };

  const loadData = async () => {
    if (!documentCode) return;
    try {
      const [wf, revs, cmts] = await Promise.all([
        DocumentControlService.getApprovalWorkflow(documentCode, revisionNumber),
        DocumentControlService.getRevisionsForDocument(documentCode),
        DocumentControlService.getComments(documentCode),
      ]);
      setWorkflow(wf);
      setRevisions(revs);
      setComments(cmts);

      const foundRev = revs.find((r) => r.revisionNumber === revisionNumber) || revs[0] || null;
      setCurrentRev(foundRev);
    } catch (err) {
      console.error('Failed to load approval workflow data:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, documentCode, revisionNumber]);

  // Handler: Submit for Review
  const handleSubmitForReview = async () => {
    try {
      setSubmittingAction(true);
      await DocumentControlService.submitForReview(
        documentCode,
        revisionNumber,
        currentUser.name,
        currentUser.role,
        'Submitted for technical and regulatory review cycle.'
      );
      showToast(`Document ${documentCode} (${revisionNumber}) submitted for review.`);
      await loadData();
      onStatusChanged?.();
    } catch (err) {
      console.error(err);
      showToast('Error submitting document for review.');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Handler: Approve Current Step
  const handleApproveStep = async (stepNumber: number) => {
    try {
      setSubmittingAction(true);
      const res = await DocumentControlService.approveWorkflowStep({
        documentCode,
        revisionNumber,
        stepNumber,
        actorUserId: currentUser.id,
        actorName: currentUser.name,
        actorRole: currentUser.role,
        comments: approvalComment || 'Endorsed without non-conformance.',
      });

      if (res.isFullyApproved) {
        showToast(`Document ${documentCode} is now FULLY APPROVED at all stages!`);
      } else {
        showToast(`Step ${stepNumber} approved. Advanced to next reviewer.`);
      }

      setApprovalComment('');
      await loadData();
      onStatusChanged?.();
    } catch (err) {
      console.error(err);
      showToast('Error approving step.');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Handler: Reject / Request Revision
  const handleRejectStep = async (stepNumber: number) => {
    if (!rejectionReason.trim()) {
      showToast('A specific rejection reason is mandatory under ISO 45001.');
      return;
    }

    try {
      setSubmittingAction(true);
      await DocumentControlService.rejectWorkflowStep({
        documentCode,
        revisionNumber,
        stepNumber,
        actorUserId: currentUser.id,
        actorName: currentUser.name,
        actorRole: currentUser.role,
        rejectionReason: rejectionReason.trim(),
        comments: approvalComment || rejectionReason,
      });

      showToast(`Step ${stepNumber} rejected. Document status updated to REVISION REQUIRED.`);
      setRejectionReason('');
      setApprovalComment('');
      await loadData();
      onStatusChanged?.();
    } catch (err) {
      console.error(err);
      showToast('Error rejecting approval step.');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Handler: Publish
  const handlePublish = async () => {
    try {
      setSubmittingAction(true);
      await DocumentControlService.publishDocument(
        documentCode,
        revisionNumber,
        currentUser.name,
        currentUser.role
      );
      showToast(`Document ${documentCode} (${revisionNumber}) is now PUBLISHED & active.`);
      await loadData();
      onStatusChanged?.();
    } catch (err) {
      console.error(err);
      showToast('Error publishing document.');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Handler: Add Comment
  const handleAddComment = async () => {
    if (!newCommentText.trim()) return;
    try {
      await DocumentControlService.addComment(
        documentCode,
        revisionNumber,
        currentUser.name,
        currentUser.role,
        newCommentText.trim(),
        'REVIEW'
      );
      setNewCommentText('');
      const updated = await DocumentControlService.getComments(documentCode);
      setComments(updated);
      showToast('Comment recorded in audit trail.');
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  const currentStep = workflow?.steps[workflow.currentStepIndex];
  const lifecycleMeta = currentRev ? LIFECYCLE_STATUS_LABELS[currentRev.status] : null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0f172a]/70 backdrop-blur-xs flex items-center justify-center p-4 lg:p-6 animate-in fade-in">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-gray-200 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-[#eff4ff] border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#006c4a] text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">verified_user</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#0b1c30]">
                  Approval Workflow &amp; Sign-off Chain
                </h3>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-white text-[#006c4a] font-bold border border-green-200">
                  {documentCode}
                </span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#dce9ff] text-[#0b1c30] font-bold">
                  {revisionNumber}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-mono">
                Configurable Multi-Tier Authorization • ISO 45001:2018 Clause 7.5.3
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {lifecycleMeta && (
              <span className={`px-2.5 py-1 rounded text-xs font-bold border ${lifecycleMeta.badgeBg}`}>
                {lifecycleMeta.en}
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-600 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Tab Navigator */}
        <div className="px-4 border-b flex items-center gap-4 text-xs font-semibold bg-gray-50/60">
          <button
            type="button"
            onClick={() => setActiveTab('CHAIN')}
            className={`py-3 flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'CHAIN'
                ? 'border-[#006c4a] text-[#006c4a] font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">account_tree</span>
            <span>Approval Chain Steps</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('COMMENTS')}
            className={`py-3 flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'COMMENTS'
                ? 'border-[#006c4a] text-[#006c4a] font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">chat</span>
            <span>Comments &amp; Review Remarks ({comments.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('REVISIONS')}
            className={`py-3 flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'REVISIONS'
                ? 'border-[#006c4a] text-[#006c4a] font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">history</span>
            <span>Revision History Ledger ({revisions.length})</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'CHAIN' && workflow && (
            <div className="space-y-6">
              {/* Status Banner */}
              <div className="p-3.5 rounded-xl bg-gray-50 border flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-mono text-gray-400 font-bold block">
                    Current Workflow Status
                  </span>
                  <span className="font-bold text-[#0b1c30] text-sm flex items-center gap-1.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        workflow.status === 'APPROVED'
                          ? 'bg-green-600'
                          : workflow.status === 'REJECTED'
                          ? 'bg-red-600'
                          : 'bg-amber-500 animate-pulse'
                      }`}
                    ></span>
                    {workflow.status === 'APPROVED'
                      ? 'Workflow Complete — Approved by all authorities'
                      : workflow.status === 'REJECTED'
                      ? 'Workflow Interrupted — Revision Required'
                      : `Awaiting Step ${workflow.currentStepIndex + 1} of ${workflow.steps.length}`}
                  </span>
                </div>

                {/* Quick Lifecycle Action Buttons */}
                <div className="flex items-center gap-2">
                  {currentRev &&
                    (currentRev.status === 'DRAFT' || currentRev.status === 'REVISION_REQUIRED') && (
                      <button
                        type="button"
                        disabled={submittingAction}
                        onClick={handleSubmitForReview}
                        className="px-3.5 py-1.5 rounded-lg bg-[#0284c7] text-white font-bold hover:bg-[#0369a1] transition-all flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-[16px]">send</span>
                        <span>Submit for Review</span>
                      </button>
                    )}

                  {currentRev && currentRev.status === 'APPROVED' && (
                    <button
                      type="button"
                      disabled={submittingAction}
                      onClick={handlePublish}
                      className="px-3.5 py-1.5 rounded-lg bg-[#006c4a] text-white font-bold hover:bg-[#005238] transition-all flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[16px]">publish</span>
                      <span>Publish &amp; Supersede Older</span>
                    </button>
                  )}
                </div>
              </div>

              {/* The 4-Step Visual Stepper */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Sequential Authorization Chain (Prepared By → HSE Mgr → PM → Client)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {workflow.steps.map((step, idx) => {
                    const isApproved = step.decision === 'APPROVED';
                    const isRejected = step.decision === 'REVISION_REQUIRED';
                    const isCurrent = idx === workflow.currentStepIndex && workflow.status !== 'APPROVED';
                    const isPending = step.decision === 'PENDING';

                    return (
                      <div
                        key={step.id}
                        className={`p-3.5 rounded-xl border relative transition-all ${
                          isApproved
                            ? 'bg-emerald-50/60 border-emerald-300'
                            : isRejected
                            ? 'bg-red-50/60 border-red-300'
                            : isCurrent
                            ? 'bg-[#eff4ff] border-[#006c4a] ring-2 ring-[#006c4a]/30'
                            : 'bg-gray-50/60 border-gray-200 opacity-70'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-[10px] font-bold text-gray-500">
                            Step 0{step.stepNumber}
                          </span>
                          <span
                            className={`material-symbols-outlined text-[18px] ${
                              isApproved
                                ? 'text-emerald-700'
                                : isRejected
                                ? 'text-red-600'
                                : isCurrent
                                ? 'text-[#006c4a]'
                                : 'text-gray-400'
                            }`}
                          >
                            {isApproved
                              ? 'check_circle'
                              : isRejected
                              ? 'cancel'
                              : isCurrent
                              ? 'pending'
                              : 'radio_button_unchecked'}
                          </span>
                        </div>

                        <div className="font-bold text-xs text-[#0b1c30] leading-snug">
                          {step.roleName}
                        </div>
                        {step.roleNameAr && (
                          <div className="text-[10px] text-gray-500 font-['Cairo']">{step.roleNameAr}</div>
                        )}

                        <div className="mt-2.5 pt-2 border-t border-gray-200/60 font-mono text-[10px] space-y-1">
                          {isApproved && (
                            <>
                              <div className="text-emerald-800 font-bold">Approved</div>
                              <div className="text-gray-600">{step.decidedByUserName}</div>
                              <div className="text-gray-400">
                                {step.date} {step.time}
                              </div>
                            </>
                          )}

                          {isRejected && (
                            <>
                              <div className="text-red-700 font-bold">Revision Required</div>
                              <div className="text-gray-600">{step.decidedByUserName}</div>
                              <div className="text-red-800 font-semibold">{step.rejectionReason}</div>
                            </>
                          )}

                          {isPending && isCurrent && (
                            <div className="text-amber-800 font-bold bg-amber-100/60 p-1 rounded">
                              Current Turn to Review
                            </div>
                          )}

                          {isPending && !isCurrent && (
                            <div className="text-gray-400">Awaiting prior step</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Review / Decision Execution Panel for Current Step */}
              {currentStep && currentStep.decision === 'PENDING' && (
                <div className="p-4 rounded-xl border border-gray-300 bg-white shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-[#006c4a]">
                        rate_review
                      </span>
                      <span className="font-bold text-xs text-[#0b1c30]">
                        Action Required for Step {currentStep.stepNumber}: {currentStep.roleName}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-gray-500">
                      Acting as: {currentUser.name} ({currentUser.role})
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Review Comments / Endorsement Remarks:
                    </label>
                    <textarea
                      rows={2}
                      value={approvalComment}
                      onChange={(e) => setApprovalComment(e.target.value)}
                      placeholder="Enter verification comments (e.g. Verified compliant with ISO 45001 Clause 7.5.3)..."
                      className="w-full text-xs p-2.5 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#006c4a]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-red-800 mb-1">
                      Rejection Reason (Required ONLY if requesting revision/rejecting):
                    </label>
                    <input
                      type="text"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Specify deficiency requiring amendment (mandatory for rejection)..."
                      className="w-full text-xs p-2 border rounded-lg border-red-200 focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      disabled={submittingAction}
                      onClick={() => handleRejectStep(currentStep.stepNumber)}
                      className="px-4 py-2 rounded-lg bg-red-50 text-red-700 border border-red-200 text-xs font-bold hover:bg-red-100 transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                      <span>Reject &amp; Request Revision</span>
                    </button>

                    <button
                      type="button"
                      disabled={submittingAction}
                      onClick={() => handleApproveStep(currentStep.stepNumber)}
                      className="px-5 py-2 rounded-lg bg-[#006c4a] text-white text-xs font-bold hover:bg-[#005238] transition-all flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[16px]">done_all</span>
                      <span>Digital Sign &amp; Approve Step</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Comments & Remarks Tab */}
          {activeTab === 'COMMENTS' && (
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-xl border flex items-center gap-2">
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Add an internal reviewer comment or regulatory note..."
                  className="flex-1 text-xs p-2 border bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#006c4a]"
                />
                <button
                  type="button"
                  onClick={handleAddComment}
                  className="px-4 py-2 rounded-lg bg-[#006c4a] text-white text-xs font-bold hover:bg-[#005238] transition-all"
                >
                  Post Comment
                </button>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto">
                {comments.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-xs font-mono">
                    No comments logged for this document yet.
                  </div>
                ) : (
                  comments.map((cmt) => (
                    <div key={cmt.id} className="p-3 rounded-lg border bg-white text-xs space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="font-bold text-[#0b1c30]">
                          {cmt.userName} ({cmt.userRole})
                        </span>
                        <span className="text-gray-400">
                          {new Date(cmt.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{cmt.commentText}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Revision History Ledger Tab */}
          {activeTab === 'REVISIONS' && (
            <div className="space-y-3">
              <div className="text-xs text-gray-500 font-mono">
                Immutable WORM Archive: Approved revisions are permanently locked. Editing creates a new revision.
              </div>

              <div className="divide-y border rounded-xl bg-white overflow-hidden">
                {revisions.map((rev) => (
                  <div key={rev.id} className="p-4 flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-[#0b1c30]">
                          {rev.revisionNumber}
                        </span>
                        <span
                          className={`font-mono text-[9px] uppercase px-2 py-0.5 rounded font-bold border ${
                            LIFECYCLE_STATUS_LABELS[rev.status].badgeBg
                          }`}
                        >
                          {rev.status}
                        </span>
                        {rev.isLocked && (
                          <span className="text-[10px] text-gray-500 flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[13px]">lock</span>
                            <span>Locked</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{rev.changeSummary}</p>
                      <div className="flex items-center gap-3 text-[10px] font-mono text-gray-400 mt-2">
                        <span>Author: {rev.authorName}</span>
                        <span>Effective: {rev.effectiveDate}</span>
                        <span>SHA-256: {rev.sha256Checksum.substring(0, 16)}...</span>
                      </div>
                    </div>

                    <div className="text-right text-[11px] font-mono text-gray-500">
                      <div>Created: {rev.createdAt.split('T')[0]}</div>
                      {rev.approvedBy && (
                        <div className="text-emerald-700 font-semibold mt-1">
                          Approved by {rev.approvedBy}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 border-t flex items-center justify-between text-xs">
          <div className="text-gray-500 font-mono text-[10px]">
            Electronic Records &amp; Signatures compliant with ISO 45001 &amp; FDA 21 CFR Part 11.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-gray-800 text-white font-bold hover:bg-black transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
