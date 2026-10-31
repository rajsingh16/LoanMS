CREATE TABLE IF NOT EXISTS center_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_identifier TEXT NOT NULL UNIQUE,
  display_sequence BIGINT GENERATED ALWAYS AS IDENTITY UNIQUE,
  center_id UUID NOT NULL REFERENCES centers(id) ON DELETE RESTRICT,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
  field_officer_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE RESTRICT,
  meeting_type TEXT NOT NULL CHECK (meeting_type IN ('Regular','Special','CGT','GRT')),
  meeting_status TEXT NOT NULL DEFAULT 'scheduled' CHECK (meeting_status IN ('scheduled','completed','cancelled')),
  schedule_date DATE NOT NULL, schedule_time TIME NOT NULL, meeting_end_date DATE NOT NULL, meeting_end_time TIME NOT NULL,
  meeting_location TEXT, agenda TEXT, remarks TEXT,
  created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL, updated_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK ((meeting_end_date, meeting_end_time) >= (schedule_date, schedule_time))
);
CREATE INDEX IF NOT EXISTS idx_center_meetings_branch_status_date ON center_meetings(branch_id, meeting_status, schedule_date DESC);
CREATE INDEX IF NOT EXISTS idx_center_meetings_center_date ON center_meetings(center_id, schedule_date DESC);
INSERT INTO permission_catalog(module, permission, description) VALUES
 ('loan','center_meeting.view','View center meetings'), ('loan','center_meeting.create','Create center meetings'), ('loan','center_meeting.update','Update center meetings'), ('loan','center_meeting.delete','Cancel center meetings'), ('loan','center_meeting.complete','Complete center meetings')
ON CONFLICT (module, permission) DO UPDATE SET description = EXCLUDED.description;
