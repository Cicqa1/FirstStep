import React, { useState } from "react";
import { X, Lock, Mail, User, CheckCircle, Eye, EyeOff, Sparkles, GraduationCap } from "lucide-react";
import { User as UserType } from "../types";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserType) => void;
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Google authentications states
  const [showGoogleChooser, setShowGoogleChooser] = useState(false);
  const [googleCustomEmail, setGoogleCustomEmail] = useState("");
  const [googleCustomName, setGoogleCustomName] = useState("");
  const [googleAccounts, setGoogleAccounts] = useState<{ email: string; name: string; initials: string; }[]>(() => {
    try {
      const saved = localStorage.getItem("firststep_google_accounts");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Ignored
    }
    // Seed with current session environment's user email if empty so they have their account on this device/browser
    const seed = [
      { email: "mariam.tsitskishvili.1@btu.edu.ge", name: "მარიამ ციცქიშვილი", initials: "მც" }
    ];
    try {
      localStorage.setItem("firststep_google_accounts", JSON.stringify(seed));
    } catch {}
    return seed;
  });

  React.useEffect(() => {
    if (!isOpen) {
      setEmail("");
      setPassword("");
      setFullName("");
      setGoogleCustomEmail("");
      setGoogleCustomName("");
      setError(null);
      setShowGoogleChooser(false);
    }
  }, [isOpen]);

  const handleTabChange = (tab: "login" | "register") => {
    setActiveTab(tab);
    setEmail("");
    setPassword("");
    setFullName("");
    setError(null);
  };

  if (!isOpen) return null;

  const handleValidateEmail = (emailStr: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(emailStr);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("გთხოვთ შეავსოთ ყველა ველი");
      return;
    }

    if (!handleValidateEmail(email)) {
      setError("ელ. ფოსტის ფორმატი არასწორია");
      return;
    }

    if (activeTab === "register" && !fullName) {
      setError("გთხოვთ შეიყვანოთ თქვენი სახელი და გვარი");
      return;
    }

    if (password.length < 6) {
      setError("პაროლი უნდა შედგებოდეს მინიმუმ 6 სიმბოლოსგან");
      return;
    }

    // Load users database
    let usersList: any[] = [];
    try {
      const saved = localStorage.getItem("firststep_users");
      usersList = saved ? JSON.parse(saved) : [];
    } catch {
      usersList = [];
    }

    if (activeTab === "register") {
      // Check if user exists
      const exists = usersList.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
      if (exists) {
        setError("მომხმარებელი ამ ელ. ფოსტით უკვე რეგისტრირებულია");
        return;
      }

      // Create new user
      const newUser: UserType = {
        id: "usr_" + Math.random().toString(36).substring(2, 11),
        email: email.toLowerCase(),
        fullName: fullName.trim(),
        createdAt: new Date().toISOString(),
        preferences: {
          interestedSectors: [],
          preferredType: "ყველა",
        }
      };

      // In a real database we store password hash. Here we store plain for local storage session demo.
      const dbEntry = { ...newUser, password };
      usersList.push(dbEntry);

      localStorage.setItem("firststep_users", JSON.stringify(usersList));
      localStorage.setItem("firststep_active_user", JSON.stringify(newUser));

      setSuccess(true);
      setTimeout(() => {
        onAuthSuccess(newUser);
        setSuccess(false);
        onClose();
        // Reset form
        setEmail("");
        setPassword("");
        setFullName("");
      }, 1500);

    } else {
      // Login
      // Check if email exists at all
      const userExists = usersList.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
      if (!userExists) {
        setError("მომხმარებელი ამ ელ. ფოსტით არ არის რეგისტრირებული. გთხოვთ გაიაროთ რეგისტრაცია.");
        return;
      }

      // Check password match
      const user = usersList.find(
        (u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (!user) {
        setError("პაროლი არასწორია. გთხოვთ სცადოთ ხელახლა.");
        return;
      }

      const activeUser: UserType = {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        createdAt: user.createdAt,
        preferences: user.preferences
      };

      localStorage.setItem("firststep_active_user", JSON.stringify(activeUser));

      setSuccess(true);
      setTimeout(() => {
        onAuthSuccess(activeUser);
        setSuccess(false);
        onClose();
        // Reset form
        setEmail("");
        setPassword("");
        setFullName("");
      }, 1500);
    }
  };

  const handleGoogleLoginDirect = (gEmail: string, gName: string) => {
    let usersList: any[] = [];
    try {
      const saved = localStorage.getItem("firststep_users");
      usersList = saved ? JSON.parse(saved) : [];
    } catch {
      usersList = [];
    }

    let existingUser = usersList.find((u: any) => u.email.toLowerCase() === gEmail.toLowerCase());
    
    if (!existingUser) {
      existingUser = {
        id: "usr_google_" + Math.random().toString(36).substring(2, 11),
        email: gEmail.toLowerCase(),
        fullName: gName,
        createdAt: new Date().toISOString(),
        preferences: {
          interestedSectors: [],
          preferredType: "ყველა"
        },
        provider: "google"
      };
      usersList.push(existingUser);
      localStorage.setItem("firststep_users", JSON.stringify(usersList));
    }

    const activeUser: UserType = {
      id: existingUser.id,
      email: existingUser.email,
      fullName: existingUser.fullName,
      createdAt: existingUser.createdAt,
      preferences: existingUser.preferences || { interestedSectors: [], preferredType: "ყველა" }
    };

    // Save newly authenticated Google account on this device / browser cached accounts
    try {
      const stored = localStorage.getItem("firststep_google_accounts");
      let list = stored ? JSON.parse(stored) : [];
      if (!list.some((a: any) => a.email.toLowerCase() === gEmail.toLowerCase())) {
        const initials = gName.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() || "G";
        const updatedList = [...list, { email: gEmail.toLowerCase(), name: gName, initials }];
        localStorage.setItem("firststep_google_accounts", JSON.stringify(updatedList));
        setGoogleAccounts(updatedList);
      }
    } catch (e) {
      console.error(e);
    }

    localStorage.setItem("firststep_active_user", JSON.stringify(activeUser));
    setShowGoogleChooser(false);
    setSuccess(true);
    
    setTimeout(() => {
      onAuthSuccess(activeUser);
      setSuccess(false);
      onClose();
      setEmail("");
      setPassword("");
      setFullName("");
      setGoogleCustomEmail("");
      setGoogleCustomName("");
    }, 1500);
  };

  const isEduEmail = email.toLowerCase().endsWith(".edu.ge");

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn" id="auth-modal-overlay">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all duration-300 scale-100">
        
        {/* Success Overlay state */}
        {success && (
          <div className="absolute inset-0 z-50 bg-white/95 flex flex-col items-center justify-center p-8 text-center animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-extrabold text-[#0f1f35]">
              {activeTab === "register" ? "რეგისტრაცია წარმატებულია!" : "ავტორიზაცია წარმატებულია!"}
            </h3>
            <p className="text-xs text-slate-400 mt-1">მზადდება თქვენი სამუშაო სივრცე...</p>
          </div>
        )}

        {/* Modal Header */}
        <div className="px-6 pt-6 pb-2 flex justify-between items-center bg-white border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <img
              src="/src/assets/images/firststep_new_mascot_logo_1780132225263.png"
              alt="FirstStep Logo"
              className="h-8 w-8 object-contain rounded-lg"
              referrerPolicy="no-referrer"
            />
            <span className="text-sm font-extrabold tracking-tight text-[#0f1f35]">
              First<span className="text-brand-secondary font-normal">Step</span> პორტალი
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
            id="auth-modal-close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs switcher */}
        <div className="flex border-b border-slate-100 bg-slate-50/50 p-1">
          <button
            onClick={() => handleTabChange("login")}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              activeTab === "login"
                ? "bg-white text-brand-primary shadow-xs border border-slate-100"
                : "text-slate-400 hover:text-slate-700"
            }`}
          >
            ავტორიზაცია
          </button>
          <button
            onClick={() => handleTabChange("register")}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              activeTab === "register"
                ? "bg-white text-brand-primary shadow-xs border border-slate-100"
                : "text-slate-400 hover:text-slate-700"
            }`}
          >
            რეგისტრაცია
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-[11px] text-red-600 rounded-xl leading-relaxed font-semibold">
              ⚠️ {error}
            </div>
          )}

          {activeTab === "register" && (
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-extrabold text-brand-primary uppercase tracking-wider">სახელი და გვარი</label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="მაგ: გიორგი ბერიძე"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-xs font-semibold rounded-xl border border-slate-200 focus:border-brand-secondary text-[#0f1f35] focus:outline-none bg-slate-50/50 focus:bg-white transition-all"
                  id="auth-register-name"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5 text-left">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-extrabold text-brand-primary uppercase tracking-wider">ელ. ფოსტა</label>
              {activeTab === "register" && (
                <span className="text-[9px] font-bold text-brand-secondary">სტუდენტებისთვის რეკომენდებულია .ge</span>
              )}
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="email"
                placeholder="g.beridze@btu.edu.ge"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-xs font-semibold rounded-xl border border-slate-200 focus:border-brand-secondary text-[#0f1f35] focus:outline-none bg-slate-50/50 focus:bg-white transition-all"
                id="auth-email-input"
              />
            </div>
            {isEduEmail && (
              <div className="flex items-center space-x-1.5 pt-1">
                <Sparkles className="w-3.5 h-3.5 text-brand-secondary" />
                <span className="text-[9px] font-bold text-slate-400">სტუდენტური უნივერსიტეტის ელ-ფოსტა იდენტიფიცირებულია!</span>
              </div>
            )}
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-extrabold text-brand-primary uppercase tracking-wider">პაროლი</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 text-xs font-semibold rounded-xl border border-slate-200 focus:border-brand-secondary text-[#0f1f35] focus:outline-none bg-slate-50/50 focus:bg-white transition-all"
                id="auth-password-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 px-1 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 text-xs font-extrabold tracking-wider uppercase text-white rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-95 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer mt-2"
            id="auth-submit-btn"
          >
            {activeTab === "login" ? "შესვლა" : "რეგისტრაცია და დაწყება"}
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="flex-shrink mx-3 text-[10px] text-slate-400 font-extrabold uppercase tracking-widest bg-white z-10 px-1">ან</span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          <button
            type="button"
            onClick={() => {
              setError(null);
              setShowGoogleChooser(true);
            }}
            className="w-full py-3.5 text-xs font-extrabold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer flex items-center justify-center shadow-xs"
            id="auth-google-btn"
          >
            <svg className="w-4 h-4 mr-2.5 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            <span>შესვლა Google-ით</span>
          </button>
        </form>

        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 leading-relaxed max-w-xs mx-auto">
            შესვლით თქვენ ეთანხმებით მომსახურების წესებს და უზრუნველყოფთ თქვენი უნივერსიტეტური მონაცების უსაფრთხო დამუშავებას.
          </p>
        </div>

        {/* Google Accounts Chooser Overlay */}
        {showGoogleChooser && (
          <div className="absolute inset-x-0 bottom-0 top-[60px] z-40 bg-white flex flex-col p-6 text-left overflow-y-auto animate-fadeIn" id="google-chooser-panel">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Google ანგარიშის არჩევა</span>
              </div>
              <button
                type="button"
                onClick={() => setShowGoogleChooser(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                გაუქმება
              </button>
            </div>

            <p className="text-[11px] text-slate-400 mt-3 mb-4 leading-relaxed font-semibold">
              აირჩიეთ ერთ-ერთი აქტიური Google @btu.edu.ge ანგარიში, სისტემა ავტომატურად მოახდენს თქვენს ავტორიზაციას:
            </p>

            {/* Suggested Google Accounts */}
            <div className="space-y-2.5">
              {googleAccounts.map((gUser) => (
                <button
                  key={gUser.email}
                  type="button"
                  onClick={() => handleGoogleLoginDirect(gUser.email, gUser.name)}
                  className="w-full p-3 border border-slate-100 hover:border-brand-secondary hover:bg-brand-primary-light/30 rounded-xl transition-all flex items-center justify-between text-left cursor-pointer group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center group-hover:bg-brand-secondary/10 group-hover:text-brand-secondary transition-colors">
                      {gUser.initials}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{gUser.name}</h4>
                      <p className="text-[10px] font-mono text-slate-400">{gUser.email}</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-brand-secondary opacity-0 group-hover:opacity-100 transition-opacity">არჩევა →</span>
                </button>
              ))}
              {googleAccounts.length === 0 && (
                <p className="text-[10px] text-amber-500 font-semibold text-center py-2">
                  ამ ბრაუზერში Google ანგარიში ჯერ არ არის შენახული. გამოიყენეთ ქვედა ფორმა ახლის დასამატებლად.
                </p>
              )}
            </div>

            {/* Custom Google Account input form */}
            <div className="mt-5 pt-4 border-t border-slate-100 space-y-3.5">
              <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">ან სხვა Google ანგარიში:</h4>
              <div className="space-y-2">
                <input
                  type="email"
                  placeholder="თქვენი Google ელ. ფოსტა"
                  value={googleCustomEmail}
                  onChange={(e) => setGoogleCustomEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 focus:border-brand-secondary text-[#0f1f35] focus:outline-none bg-slate-50/50 focus:bg-white transition-all"
                  id="google-custom-email"
                />
                <input
                  type="text"
                  placeholder="თქვენი სახელი და გვარი"
                  value={googleCustomName}
                  onChange={(e) => setGoogleCustomName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 focus:border-brand-secondary text-[#0f1f35] focus:outline-none bg-slate-50/50 focus:bg-white transition-all"
                  id="google-custom-name"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!googleCustomEmail || !googleCustomName) {
                      setError("გთხოვთ შეავსოთ ელ. ფოსტა და სახელი და გვარი");
                      return;
                    }
                    if (!handleValidateEmail(googleCustomEmail)) {
                      setError("გთხოვთ შეიყვანოთ სწორი ელ.ფოსტა");
                      return;
                    }
                    handleGoogleLoginDirect(googleCustomEmail, googleCustomName);
                  }}
                  className="w-full py-2.5 bg-brand-primary hover:bg-brand-primary/95 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  გაგრძელება
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
