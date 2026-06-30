-- PilatesVision indexes

create index if not exists idx_profiles_clinic_id on public.profiles(clinic_id);
create index if not exists idx_patients_clinic_id on public.patients(clinic_id);
create index if not exists idx_patients_created_by on public.patients(created_by);
create index if not exists idx_anamneses_patient_id on public.anamneses(patient_id);
create index if not exists idx_assessments_patient_id on public.assessments(patient_id);
create index if not exists idx_assessments_clinic_id on public.assessments(clinic_id);
create index if not exists idx_assessments_type_status on public.assessments(assessment_type, status);
create index if not exists idx_pain_scores_assessment_id on public.pain_scores(assessment_id);
create index if not exists idx_media_files_assessment_id on public.media_files(assessment_id);
create index if not exists idx_media_files_patient_id on public.media_files(patient_id);
create index if not exists idx_pose_landmarks_media_file_id on public.pose_landmarks(media_file_id);
create index if not exists idx_movement_metrics_assessment_id on public.movement_metrics(assessment_id);
create index if not exists idx_clinical_findings_assessment_id on public.clinical_findings(assessment_id);
create index if not exists idx_exercise_sessions_patient_id on public.exercise_sessions(patient_id);
create index if not exists idx_reports_assessment_id on public.reports(assessment_id);
create index if not exists idx_clinical_events_patient_id on public.clinical_events(patient_id);
create index if not exists idx_clinical_events_event_type on public.clinical_events(event_type);
create index if not exists idx_audit_logs_clinic_id on public.audit_logs(clinic_id);
create index if not exists idx_audit_logs_actor_id on public.audit_logs(actor_id);
