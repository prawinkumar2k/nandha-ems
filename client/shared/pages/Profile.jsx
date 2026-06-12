import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/core/api/client";
import { 
  User, Mail, Phone, Hash, Building2, 
  GraduationCap, Briefcase, MapPin, Camera,
  Lock, Save, X, Edit2, ShieldCheck,
  TrendingUp, Calendar, RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { MainLayout } from "@/shared/layouts/MainLayout";
import { getAdminNav, getHODNav, getFacultyNav, getStudentNav } from "@/core/constants/navigation";

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [passwords, setPasswords] = useState({ old: "", new: "", confirm: "" });
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await apiClient.get("/api/profile");
      setProfile(data);
    } catch (err) {
      toast({ title: "Error", description: "Failed to load profile", variant: "destructive" });
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...profile };
      if (payload.department && typeof payload.department === 'object') {
        payload.department = payload.department._id;
      }
      
      const data = await apiClient.put("/api/profile", payload);
      setProfile(data.user);
      updateUser(data.user);
      setIsEditing(false);
      toast({ title: "Success", description: "Profile updated successfully" });
    } catch (err) {
      toast({ title: "Error", description: err.message || "Update failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      return toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
    }
    setLoading(true);
    try {
      await apiClient.put("/api/profile/password", {
        oldPassword: passwords.old,
        newPassword: passwords.new
      });
      setPasswords({ old: "", new: "", confirm: "" });
      toast({ title: "Success", description: "Password changed successfully" });
    } catch (err) {
      toast({ title: "Error", description: err.message || "Failed to change password", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      return toast({ title: "Error", description: "Image must be under 5MB", variant: "destructive" });
    }

    setUploadingImage(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64Image = reader.result;
        await apiClient.post("/api/profile/upload", { image: base64Image });
        setProfile((prev) => ({ ...prev, profilePic: base64Image }));
        updateUser({ profilePic: base64Image });
        toast({ title: "Success", description: "Profile picture updated" });
      } catch (err) {
        toast({ title: "Error", description: err.message || "Failed to update profile picture", variant: "destructive" });
      } finally {
        setUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  if (!profile) return <div className="p-8 text-center font-bold">Loading Profile...</div>;

  const getNavItems = () => {
    switch (user?.role) {
      case "admin": return getAdminNav();
      case "hod": return getHODNav();
      case "faculty": return getFacultyNav();
      case "student": return getStudentNav();
      default: return [];
    }
  };

  const renderField = (icon, label, value, key, type = "text") => (
    <div className="space-y-2">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2 font-bold">
        {React.createElement(icon, { size: 14 })}
        {label}
      </Label>
      {isEditing ? (
        <Input 
          type={type}
          value={profile[key] || ""} 
          onChange={(e) => setProfile({ ...profile, [key]: e.target.value })}
          className="bg-background/50 border-primary/20 focus:border-primary"
        />
      ) : (
        <p className="text-sm font-medium border-b border-transparent pb-1">
          {value || <span className="text-muted-foreground italic">Not Added</span>}
        </p>
      )}
    </div>
  );

  return (
    <MainLayout navItems={getNavItems()} title="My Profile">
      <div className="container mx-auto p-6 max-w-6xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-background to-primary/5 p-8 border border-primary/10">
          <div className="absolute top-0 right-0 p-8 opacity-5">
              <User size={200} />
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="relative group">
              <div className="w-32 h-32 rounded-2xl overflow-hidden ring-4 ring-primary/20 group-hover:ring-primary/40 transition-all duration-500 shadow-2xl">
                {profile.profilePic ? (
                  <img src={profile.profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary flex items-center justify-center text-primary-foreground text-4xl font-bold">
                    {profile.name?.[0]}
                  </div>
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="absolute -bottom-2 -right-2 p-2 bg-primary text-primary-foreground rounded-xl shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
              >
                {uploadingImage ? <RefreshCw className="animate-spin w-4 h-4" /> : <Camera size={18} />}
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageUpload} 
              />
            </div>

            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <h1 className="text-3xl font-bold tracking-tight">{profile.name}</h1>
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest border border-primary/20">
                  {profile.role?.toUpperCase()}
                </span>
              </div>
              <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2">
                <Mail size={16} /> {profile.email}
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                <div className="flex items-center gap-2 text-sm bg-background/80 px-3 py-1.5 rounded-lg border font-medium">
                  <ShieldCheck size={14} className="text-green-500" />
                  Verified Account
                </div>
                <div className="flex items-center gap-2 text-sm bg-background/80 px-3 py-1.5 rounded-lg border font-medium">
                  <Calendar size={14} className="text-blue-500" />
                  Joined on {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Recent'}
                </div>
              </div>
            </div>

            <Button 
              variant={isEditing ? "outline" : "default"}
              onClick={() => setIsEditing(!isEditing)}
              className="rounded-xl px-6 font-bold"
            >
              {isEditing ? <><X size={18} className="mr-2" /> Cancel</> : <><Edit2 size={18} className="mr-2" /> Edit Details</>}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-primary/5 bg-background/50 backdrop-blur-xl rounded-3xl overflow-hidden shadow-xl">
              <CardHeader className="bg-primary/5 border-b border-primary/5">
                <CardTitle className="text-lg flex items-center gap-2 font-black uppercase italic">
                  <User size={20} className="text-primary" />
                  Account Details
                </CardTitle>
                <CardDescription className="text-[10px] font-black uppercase tracking-widest text-primary">Your Info</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {renderField(User, "Full Name", profile.name, "name")}
                  {renderField(Phone, "Phone Number", profile.phone, "phone")}
                  {profile.role === "student" && (
                    <>
                      {renderField(Hash, "Roll Number", profile.rollNumber, "rollNumber")}
                      {renderField(Building2, "Department", profile.department?.name || profile.department, "department")}
                      {renderField(GraduationCap, "Semester", profile.semester, "semester")}
                      {renderField(TrendingUp, "Average Marks", `${profile.cgpa} / 10`, "cgpa", "number")}
                    </>
                  )}
                  {profile.role === "faculty" && (
                    <>
                      {renderField(Hash, "User ID", profile.employeeId, "employeeId")}
                      {renderField(Briefcase, "Work Title", profile.designation, "designation")}
                      {renderField(ShieldCheck, "Skills", profile.specialization, "specialization")}
                    </>
                  )}
                  {profile.role === "hod" && (
                    <>
                      {renderField(Hash, "User ID", profile.employeeId, "employeeId")}
                      {renderField(MapPin, "Room", profile.office, "office")}
                      {renderField(ShieldCheck, "Department", profile.specialization, "specialization")}
                    </>
                  )}
                  
                  {isEditing && (
                    <div className="md:col-span-2 pt-6">
                      <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl text-xs font-black uppercase shadow-2xl shadow-primary/20">
                        {loading ? "Updating..." : <><Save size={18} className="mr-2" /> Save Changes</>}
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>

            {/* Progress for Students */}
            {profile.role === "student" && (
              <Card className="border-primary/5 bg-background/50 backdrop-blur-xl rounded-[40px] overflow-hidden shadow-xl">
                <CardHeader className="bg-primary/5 border-b border-primary/5">
                  <CardTitle className="text-lg font-black uppercase italic italic">Grades</CardTitle>
                  <CardDescription className="text-[10px] font-black uppercase tracking-widest text-primary">Average Marks</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                      <span className="text-muted-foreground">Results</span>
                      <span>{(profile.cgpa / 10 * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-4 bg-primary/10 rounded-full overflow-hidden border border-primary/5 shadow-inner">
                       <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${profile.cgpa * 10}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-primary shadow-lg shadow-primary/20"
                       />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Settings */}
          <div className="space-y-8">
            <Card className="border-primary/5 bg-background/50 backdrop-blur-xl rounded-[40px] overflow-hidden shadow-xl">
              <CardHeader className="bg-primary/5 border-b border-primary/5 text-center">
                <Lock size={32} className="mx-auto text-primary mb-3 opacity-20" />
                <CardTitle className="text-lg font-black uppercase italic italic">Password</CardTitle>
                <CardDescription className="text-[10px] font-black uppercase tracking-widest text-primary">Change account password</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Old Password</Label>
                    <Input 
                      type="password" 
                      value={passwords.old} 
                      onChange={(e) => setPasswords({...passwords, old: e.target.value})}
                      placeholder="••••••••"
                      className="rounded-xl h-11 font-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">New Password</Label>
                    <Input 
                      type="password" 
                      value={passwords.new} 
                      onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                      placeholder="••••••••"
                      className="rounded-xl h-11 font-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Confirm Password</Label>
                    <Input 
                      type="password" 
                      value={passwords.confirm} 
                      onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                      placeholder="••••••••"
                      className="rounded-xl h-11 font-black"
                    />
                  </div>
                  <Button variant="outline" type="submit" disabled={loading} className="w-full rounded-xl mt-6 font-black uppercase text-xs h-11 border-white/10 glass">
                    {loading ? "Changing..." : "Update Password"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="border-rose-500/10 bg-rose-500/5 backdrop-blur-xl rounded-[40px] overflow-hidden">
              <CardContent className="p-8 text-center space-y-6">
                <ShieldCheck className="mx-auto text-rose-500 opacity-20" size={32} />
                <div className="space-y-2">
                  <h3 className="text-sm font-black uppercase tracking-widest text-rose-500">Delete User</h3>
                  <p className="text-[10px] text-muted-foreground font-black uppercase">Permanently remove account.</p>
                </div>
                <Button variant="destructive" size="sm" className="w-full rounded-xl h-11 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border-rose-500/20 font-black uppercase text-xs">
                  Request Delete
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;
