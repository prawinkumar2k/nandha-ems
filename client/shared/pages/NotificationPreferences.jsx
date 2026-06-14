import { useState, useEffect } from "react";
import { Bell, Smartphone, Mail, Globe, Save } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { apiClient as api } from "@/core/api/client";
import { useAuth } from "@/contexts/AuthContext";
import { MainLayout } from "@/shared/layouts/MainLayout";
import { getAdminNav, getHODNav, getFacultyNav, getStudentNav } from "@/core/constants/navigation";
export default function NotificationPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    notifyOnNewAssignment: true,
    notifyOnGradePosted: true,
    notifyOnAnnouncement: true,
    notifyOnTicketUpdate: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const getNavItems = () => {
    switch (user?.role) {
      case "admin": return getAdminNav();
      case "hod": return getHODNav();
      case "faculty": return getFacultyNav();
      case "student": return getStudentNav();
      default: return [];
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const res = await api.get("/notifications/preferences");
      if (res && !res.error) setPreferences(res.data || res);
    } catch (err) {
      toast.error("Failed to load preferences");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/notifications/preferences", preferences);
      toast.success("Preferences saved successfully");
    } catch (err) {
      toast.error("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  const ToggleRow = ({ label, description, stateKey }) => (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-card transition-colors hover:bg-muted/5">
      <div className="space-y-0.5">
        <label className="text-sm font-medium">{label}</label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <button 
        onClick={() => setPreferences({ ...preferences, [stateKey]: !preferences[stateKey] })}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${preferences[stateKey] ? 'bg-primary' : 'bg-input'}`}
      >
        <span className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${preferences[stateKey] ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );

  const getRoleSpecificTriggers = () => {
    switch (user?.role) {
      case "faculty":
        return [
          { key: "notifyOnNewAssignment", label: "Exam Approvals", desc: "Alert me when the HOD approves or rejects my exam." },
          { key: "notifyOnGradePosted", label: "Student Submissions", desc: "Alert me when a student completes and submits an exam." },
          { key: "notifyOnAnnouncement", label: "Announcements", desc: "Alert me when the institution broadcasts a new announcement." },
          { key: "notifyOnTicketUpdate", label: "System Alerts", desc: "Alert me about system maintenance or help desk updates." },
        ];
      case "hod":
      case "admin":
        return [
          { key: "notifyOnNewAssignment", label: "Pending Approvals", desc: "Alert me when a faculty member submits an exam for approval." },
          { key: "notifyOnGradePosted", label: "Security Violations", desc: "Alert me of high-severity academic misconduct during active exams." },
          { key: "notifyOnAnnouncement", label: "Announcements", desc: "Alert me when the institution broadcasts a new announcement." },
          { key: "notifyOnTicketUpdate", label: "System Alerts", desc: "Alert me about system maintenance or help desk updates." },
        ];
      default: // student
        return [
          { key: "notifyOnNewAssignment", label: "New Assignments", desc: "Alert me when a faculty member posts a new assignment." },
          { key: "notifyOnGradePosted", label: "Grades Posted", desc: "Alert me when my submission has been graded." },
          { key: "notifyOnAnnouncement", label: "Announcements", desc: "Alert me when the institution broadcasts a new announcement." },
          { key: "notifyOnTicketUpdate", label: "Help Desk Tickets", desc: "Alert me when there is an update or resolution to my support ticket." },
        ];
    }
  };

  return (
    <MainLayout navItems={getNavItems()} title="Notification Settings">
      <div className="p-6 max-w-4xl mx-auto space-y-8">
        <div>
        <h1 className="text-3xl font-bold tracking-tight">Notification Settings</h1>
        <p className="text-muted-foreground mt-1">Manage how and when you receive alerts from the platform.</p>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-muted rounded-xl"></div>
          <div className="h-20 bg-muted rounded-xl"></div>
        </div>
      ) : (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center"><Globe className="w-5 h-5 mr-2" /> Global Delivery Methods</h3>
            <div className="space-y-3">
              <ToggleRow 
                label="Email Notifications" 
                description="Receive critical alerts directly to your registered email address."
                stateKey="emailNotifications"
              />
              <ToggleRow 
                label="Push Notifications" 
                description="Receive real-time browser push notifications when active."
                stateKey="pushNotifications"
              />
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center"><Bell className="w-5 h-5 mr-2" /> Alert Triggers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {getRoleSpecificTriggers().map((trigger) => (
                <ToggleRow 
                  key={trigger.key}
                  label={trigger.label} 
                  description={trigger.desc}
                  stateKey={trigger.key}
                />
              ))}
            </div>
          </Card>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={saving} className="w-full md:w-auto min-w-[150px]">
              {saving ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save Preferences</>}
            </Button>
          </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
