export type ReviewDecision = "accepted" | "modified" | "rejected" | "deferred";

export interface ProfessionalReview<TSuggestion = unknown, TFinal = unknown> {
  reviewId: string;
  assessmentId: string;
  reviewerId: string;
  reviewedAt: string;
  decision: ReviewDecision;
  suggestion?: TSuggestion;
  finalDecision?: TFinal;
  rationale?: string;
  algorithmVersion?: string;
  protocolVersion?: string;
}

export function isClinicallyFinalized(review: ProfessionalReview): boolean {
  return (
    review.decision === "accepted" ||
    review.decision === "modified" ||
    review.decision === "rejected"
  );
}

export function validateProfessionalReview(review: ProfessionalReview): string[] {
  const errors: string[] = [];
  if (!review.reviewId.trim()) errors.push("review_id_required");
  if (!review.assessmentId.trim()) errors.push("assessment_id_required");
  if (!review.reviewerId.trim()) errors.push("reviewer_id_required");
  if (!review.reviewedAt.trim()) errors.push("reviewed_at_required");
  if (review.decision === "modified" && review.finalDecision === undefined)
    errors.push("modified_review_requires_final_decision");
  return errors;
}
