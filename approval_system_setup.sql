-- Approval System Setup Script
-- This script adds the approval request and notification tables to the existing database

-- 1. Approval Requests Table
CREATE TABLE IF NOT EXISTS approval_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    company_name TEXT NOT NULL,
    country TEXT NOT NULL,
    region TEXT NOT NULL,
    requested_role TEXT CHECK (requested_role IN ('Admin', 'Accountant', 'Viewer', 'Auditor', 'Investor')) NOT NULL,
    business_justification TEXT NOT NULL,
    experience TEXT,
    additional_info TEXT,
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    admin_notes TEXT,
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Approval Notifications Table
CREATE TABLE IF NOT EXISTS approval_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_email TEXT NOT NULL,
    request_id UUID REFERENCES approval_requests(id) ON DELETE CASCADE NOT NULL,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    requested_role TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_approval_requests_user_id ON approval_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_approval_requests_status ON approval_requests(status);
CREATE INDEX IF NOT EXISTS idx_approval_requests_created_at ON approval_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_approval_notifications_admin_email ON approval_notifications(admin_email);
CREATE INDEX IF NOT EXISTS idx_approval_notifications_is_read ON approval_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_approval_notifications_request_id ON approval_notifications(request_id);

-- Create trigger for updated_at on approval_requests
CREATE TRIGGER update_approval_requests_updated_at
BEFORE UPDATE ON approval_requests
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for updated_at on approval_notifications
CREATE TRIGGER update_approval_notifications_updated_at
BEFORE UPDATE ON approval_notifications
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for approval_requests
-- Users can view their own requests
CREATE POLICY "Users can view own approval requests" ON approval_requests
FOR SELECT USING (user_id = auth.uid());

-- Users can insert their own requests
CREATE POLICY "Users can insert own approval requests" ON approval_requests
FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admins can view all requests
CREATE POLICY "Admins can view all approval requests" ON approval_requests
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM numerizamauth 
        WHERE id = auth.uid() 
        AND role = 'Admin' 
        AND is_approved = true
    )
);

-- Admins can update all requests
CREATE POLICY "Admins can update all approval requests" ON approval_requests
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM numerizamauth 
        WHERE id = auth.uid() 
        AND role = 'Admin' 
        AND is_approved = true
    )
);

-- RLS Policies for approval_notifications
-- Admins can view notifications sent to them
CREATE POLICY "Admins can view their notifications" ON approval_notifications
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM numerizamauth 
        WHERE id = auth.uid() 
        AND email = approval_notifications.admin_email 
        AND role = 'Admin' 
        AND is_approved = true
    )
);

-- System can insert notifications (for the service)
CREATE POLICY "System can insert notifications" ON approval_notifications
FOR INSERT WITH CHECK (true);

-- Admins can update their notifications
CREATE POLICY "Admins can update their notifications" ON approval_notifications
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM numerizamauth 
        WHERE id = auth.uid() 
        AND email = approval_notifications.admin_email 
        AND role = 'Admin' 
        AND is_approved = true
    )
);

-- Create a function to automatically create admin notification when approval request is created
CREATE OR REPLACE FUNCTION create_admin_notification()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO approval_notifications (
        admin_email,
        request_id,
        user_name,
        user_email,
        requested_role,
        message
    ) VALUES (
        'shuvo@admin.com',
        NEW.id,
        NEW.user_name,
        NEW.user_email,
        NEW.requested_role,
        'New approval request from ' || NEW.user_name || ' (' || NEW.user_email || ') requesting ' || NEW.requested_role || ' role.'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically create notification when approval request is inserted
CREATE TRIGGER create_notification_on_approval_request
AFTER INSERT ON approval_requests
FOR EACH ROW
EXECUTE FUNCTION create_admin_notification();

-- Create a function to update user role when request is approved
CREATE OR REPLACE FUNCTION update_user_role_on_approval()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update if status changed to approved
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        UPDATE numerizamauth 
        SET 
            role = NEW.requested_role,
            is_approved = true,
            approved_by = NEW.reviewed_by,
            approved_at = NEW.reviewed_at
        WHERE id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update user role when approval request is approved
CREATE TRIGGER update_user_role_on_approval_trigger
AFTER UPDATE ON approval_requests
FOR EACH ROW
EXECUTE FUNCTION update_user_role_on_approval();