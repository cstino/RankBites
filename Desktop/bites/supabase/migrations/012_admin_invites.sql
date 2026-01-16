-- Create admin_invites table for managing admin invitations
CREATE TABLE IF NOT EXISTS admin_invites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    used_at TIMESTAMPTZ,
    
    CONSTRAINT valid_role CHECK (role IN ('admin', 'super_admin'))
);

CREATE INDEX IF NOT EXISTS idx_admin_invites_email ON admin_invites(email);
CREATE INDEX IF NOT EXISTS idx_admin_invites_used ON admin_invites(used_at) WHERE used_at IS NULL;

COMMENT ON TABLE admin_invites IS 'Stores pending admin invitations';
COMMENT ON COLUMN admin_invites.email IS 'Email address of invited user';
COMMENT ON COLUMN admin_invites.invited_by IS 'User ID who sent the invitation';
COMMENT ON COLUMN admin_invites.role IS 'Role to assign upon signup (admin or super_admin)';
COMMENT ON COLUMN admin_invites.used_at IS 'Timestamp when invite was used (NULL if pending)';
