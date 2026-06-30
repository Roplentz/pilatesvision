-- PilatesVision seed data

insert into public.exercise_library (name, category, target_regions, contraindications, instructions, evidence_notes)
values
('Hundred', 'mat_pilates', array['core','respiratory_control'], 'Avoid in acute cervical pain or uncontrolled hypertension without clinical judgment.', 'Use controlled breathing and trunk stabilization. Adapt cervical position when needed.', 'Initial educational seed. Evidence mapping pending.'),
('Roll Up', 'mat_pilates', array['spine','core','hamstrings'], 'Avoid or adapt in acute lumbar pain, osteoporosis with high fracture risk, or severe mobility restriction.', 'Prioritize segmental mobility and avoid ballistic movement.', 'Initial educational seed. Evidence mapping pending.'),
('Single Leg Stretch', 'mat_pilates', array['core','hip'], 'Adapt in hip pain, acute lumbar pain or poor trunk control.', 'Monitor pelvic stability and cervical compensation.', 'Initial educational seed. Evidence mapping pending.'),
('Bridge', 'mat_pilates', array['lumbo_pelvic','gluteal'], 'Adapt in acute lumbar pain or postoperative restrictions.', 'Promote controlled hip extension and neutral alignment.', 'Initial educational seed. Evidence mapping pending.'),
('Side Kick', 'mat_pilates', array['hip','lateral_chain'], 'Adapt in acute hip pain or poor balance.', 'Monitor trunk stability and pelvic compensation.', 'Initial educational seed. Evidence mapping pending.')
on conflict do nothing;
