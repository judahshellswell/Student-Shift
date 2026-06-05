'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  auth, createUserWithEmailAndPassword, deleteUser,
  uploadFile, compressImage, getVideoDuration,
  createUserProfile, functions, httpsCallable,
} from '@/lib/firebase';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/providers/ToastProvider';
import { COMMON_SKILLS, REGIONS, DAYS_OF_WEEK, DAY_LABELS, getParishOptionsForRegion, ALL_SCHOOLS } from '@/lib/constants';
import { calculateAge } from '@/lib/utils';
import type { Availability, DayHours } from '@/types';

const TOTAL_STEPS = 7;

interface WizardData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  region: string;
  schoolOrCollege: string;
  bio: string;
  avatarFile?: File;
  avatarPreview?: string;
  cvFile?: File;
  videoFile?: File;
  skills: string[];
  preferredParishes: string[];
  postcode: string;
  searchRadiusKm: number;
  availability: Availability;
  phone: string;
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 flex-1 rounded-full transition-colors ${i < current ? 'bg-primary' : 'bg-gray-200'}`}
        />
      ))}
    </div>
  );
}

export default function StudentRegisterPage() {
  const router = useRouter();
  const { fetchProfile } = useAuthStore();
  const { showError, showSuccess } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [earlyUser, setEarlyUser] = useState<any>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [data, setData] = useState<WizardData>({
    email: '', password: '', firstName: '', lastName: '',
    dateOfBirth: '', region: 'Jersey', schoolOrCollege: '',
    bio: '', skills: [], preferredParishes: [],
    postcode: '', searchRadiusKm: 10, availability: {}, phone: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (updates: Partial<WizardData>) => setData((prev) => ({ ...prev, ...updates }));
  const setErr = (key: string, msg: string) => setErrors((prev) => ({ ...prev, [key]: msg }));
  const clearErr = (key: string) => setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });

  // ── Step 1: Account ──
  const handleStep1 = async () => {
    const errs: Record<string, string> = {};
    if (!data.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errs.email = 'Enter a valid email';
    if (!data.password) errs.password = 'Password is required';
    else if (data.password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      // Check ban
      const checkBanned = httpsCallable(functions, 'checkSignupBanned');
      const result = await checkBanned({ email: data.email }) as { data: { banned: boolean; reason?: string } };
      if (result.data.banned) {
        setErr('email', 'This email address cannot be used to create an account.');
        setLoading(false);
        return;
      }

      // Create Firebase Auth user
      const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);
      setEarlyUser(cred.user);
      setStep(2);
    } catch (err: any) {
      if (err?.code === 'auth/email-already-in-use') setErr('email', 'An account with this email already exists.');
      else showError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Personal details ──
  const handleStep2 = () => {
    const errs: Record<string, string> = {};
    if (!data.firstName.trim()) errs.firstName = 'First name is required';
    if (!data.lastName.trim()) errs.lastName = 'Last name is required';
    if (!data.dateOfBirth) errs.dateOfBirth = 'Date of birth is required';
    else {
      const age = calculateAge(data.dateOfBirth);
      if (age < 13) errs.dateOfBirth = 'You must be at least 13 years old to register.';
      if (age > 30) errs.dateOfBirth = 'Please check your date of birth.';
    }
    if (!data.bio.trim()) errs.bio = 'Please write a short bio';
    else if (data.bio.trim().length < 20) errs.bio = 'Bio must be at least 20 characters';
    else if (data.bio.trim().length > 300) errs.bio = 'Bio must be 300 characters or fewer';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setStep(3);
  };

  // ── Step 3: Photo ──
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    set({ avatarFile: file, avatarPreview: preview });
  };

  // ── Step 5: Video duration check ──
  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const duration = await getVideoDuration(file);
      if (duration > 60) {
        setErr('video', 'Video must be 60 seconds or under. Please trim it and try again.');
        return;
      }
      clearErr('video');
      set({ videoFile: file });
    } catch {
      setErr('video', 'Could not read the video file. Please try a different format.');
    }
  };

  // ── Step 6: Skills/availability ──
  const toggleSkill = (skill: string) => {
    set({ skills: data.skills.includes(skill) ? data.skills.filter((s) => s !== skill) : [...data.skills, skill] });
  };

  const toggleParish = (parish: string) => {
    set({ preferredParishes: data.preferredParishes.includes(parish) ? data.preferredParishes.filter((p) => p !== parish) : [...data.preferredParishes, parish] });
  };

  const toggleDay = (day: string) => {
    const current = data.availability[day as keyof Availability];
    if (current) {
      const next = { ...data.availability };
      delete next[day as keyof Availability];
      set({ availability: next });
    } else {
      set({ availability: { ...data.availability, [day]: { startTime: '09:00', endTime: '17:00' } } });
    }
  };

  const setDayTime = (day: string, field: 'startTime' | 'endTime', value: string) => {
    const current = data.availability[day as keyof Availability] as DayHours || { startTime: '09:00', endTime: '17:00' };
    set({ availability: { ...data.availability, [day]: { ...current, [field]: value } } });
  };

  // ── Step 7: Phone OTP ──
  const handleSendOtp = async () => {
    if (!data.phone.trim()) { setErr('phone', 'Phone number is required'); return; }
    setLoading(true);
    try {
      const sendOtp = httpsCallable(functions, 'sendPhoneOtp');
      await sendOtp({ phone: data.phone });
      setOtpSent(true);
      showSuccess('Code sent! Check your messages.');
    } catch (err: any) {
      showError(err.message || 'Could not send code. Please check the number and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinishRegistration = async (skipPhone = false) => {
    setLoading(true);
    try {
      const user = earlyUser || auth.currentUser;
      if (!user) throw new Error('No authenticated user');

      if (!skipPhone && otpSent && otp.length === 6) {
        const verifyOtp = httpsCallable(functions, 'verifyPhoneOtp');
        await verifyOtp({ phone: data.phone, otp });
      }

      // Upload files
      let avatarUrl: string | undefined;
      let cvUrl: string | undefined;
      let videoUrl: string | undefined;

      if (data.avatarFile) {
        const compressed = await compressImage(data.avatarFile);
        const ext = data.avatarFile.name.split('.').pop() || 'jpg';
        avatarUrl = await uploadFile(compressed as File, `avatars/${user.uid}/avatar.${ext}`);
      }
      if (data.cvFile) {
        const ext = data.cvFile.name.split('.').pop() || 'pdf';
        cvUrl = await uploadFile(data.cvFile, `cvs/${user.uid}/cv.${ext}`);
      }
      if (data.videoFile) {
        const ext = data.videoFile.name.split('.').pop() || 'mp4';
        videoUrl = await uploadFile(data.videoFile, `intro_videos/${user.uid}/intro.${ext}`);
      }

      await createUserProfile(user.uid, {
        email: data.email,
        userType: 'student',
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
        schoolOrCollege: data.schoolOrCollege || undefined,
        bio: data.bio,
        region: data.region || undefined,
        preferredParishes: data.preferredParishes,
        postcode: data.postcode || undefined,
        searchRadiusKm: data.region === 'UK' ? data.searchRadiusKm : undefined,
        skills: data.skills,
        availability: data.availability as Record<string, unknown>,
        avatarUrl,
        cvUrl,
        introVideoUrl: videoUrl,
        phone: data.phone || undefined,
      });

      await fetchProfile();
      router.replace('/student/workready');
    } catch (err: any) {
      showError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const parishOptions = getParishOptionsForRegion(data.region);
  const schoolOptions = ALL_SCHOOLS.map((s) => ({ value: s, label: s }));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="text-2xl font-bold">
            <span className="text-primary">Student</span><span className="text-secondary">Shift</span>
          </Link>
          <p className="text-sm text-text-secondary mt-1">Create your student account</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-text-secondary">Step {step} of {TOTAL_STEPS}</span>
            {step > 1 && (
              <button onClick={() => setStep(step - 1)} className="text-sm text-primary hover:underline">
                Back
              </button>
            )}
          </div>
          <StepIndicator current={step} total={TOTAL_STEPS} />

          {/* ── STEP 1: Account ── */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Create your account</h2>
              <Input label="Email address" type="email" value={data.email} onChange={(e) => set({ email: e.target.value })} error={errors.email} placeholder="you@example.com" autoFocus />
              <Input label="Password" type="password" value={data.password} onChange={(e) => set({ password: e.target.value })} error={errors.password} placeholder="Min. 8 characters" />
              <Button fullWidth size="lg" loading={loading} onClick={handleStep1}>Continue</Button>
              <p className="text-center text-sm text-text-secondary">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-primary font-medium hover:underline">Sign in</Link>
              </p>
            </div>
          )}

          {/* ── STEP 2: Personal details ── */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Personal details</h2>
              <div className="grid grid-cols-2 gap-3">
                <Input label="First name" value={data.firstName} onChange={(e) => set({ firstName: e.target.value })} error={errors.firstName} />
                <Input label="Last name" value={data.lastName} onChange={(e) => set({ lastName: e.target.value })} error={errors.lastName} />
              </div>
              <Input label="Date of birth" type="date" value={data.dateOfBirth} onChange={(e) => set({ dateOfBirth: e.target.value })} error={errors.dateOfBirth} max={new Date().toISOString().split('T')[0]} />
              <Select label="Region" value={data.region} onChange={(e) => set({ region: e.target.value, preferredParishes: [] })} options={['Jersey','Guernsey','Isle of Man','UK'].map((r) => ({ value: r, label: r }))} />
              <Select label="School or college" value={data.schoolOrCollege} onChange={(e) => set({ schoolOrCollege: e.target.value })} options={schoolOptions} placeholder="Select your school..." />
              <Textarea label="Bio" value={data.bio} onChange={(e) => set({ bio: e.target.value })} error={errors.bio} placeholder="Tell employers a bit about yourself..." rows={3} showCount maxLength={300} />
              <Button fullWidth size="lg" onClick={handleStep2}>Continue</Button>
            </div>
          )}

          {/* ── STEP 3: Photo ── */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Profile photo</h2>
              <p className="text-sm text-text-secondary">Employers like putting a face to a name. A photo makes your profile stand out.</p>
              <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 overflow-hidden flex items-center justify-center">
                  {data.avatarPreview ? (
                    <img src={data.avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
                <label className="cursor-pointer">
                  <span className="bg-primary text-white text-sm px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
                    {data.avatarPreview ? 'Change photo' : 'Choose photo'}
                  </span>
                  <input type="file" accept="image/*" className="sr-only" onChange={handleAvatarChange} />
                </label>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <Button fullWidth size="lg" onClick={() => setStep(4)}>Continue</Button>
                <Button fullWidth size="lg" variant="ghost" onClick={() => setStep(4)}>Skip for now</Button>
              </div>
            </div>
          )}

          {/* ── STEP 4: CV ── */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Upload your CV</h2>
              <p className="text-sm text-text-secondary">PDF or image. Even a basic CV makes a big difference to employers.</p>
              <label className="block cursor-pointer">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                  {data.cvFile ? (
                    <div className="flex items-center justify-center gap-2 text-success">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium">{data.cvFile.name}</span>
                    </div>
                  ) : (
                    <>
                      <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <p className="text-sm text-gray-600">Click to upload PDF or image</p>
                    </>
                  )}
                </div>
                <input type="file" accept=".pdf,image/*" className="sr-only" onChange={(e) => e.target.files?.[0] && set({ cvFile: e.target.files[0] })} />
              </label>
              <div className="flex flex-col gap-2">
                <Button fullWidth size="lg" onClick={() => setStep(5)}>Continue</Button>
                <Button fullWidth size="lg" variant="ghost" onClick={() => setStep(5)}>Skip for now</Button>
              </div>
            </div>
          )}

          {/* ── STEP 5: Intro video ── */}
          {step === 5 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Intro video</h2>
              <p className="text-sm text-text-secondary">Record a short 60-second video introducing yourself. This is optional but makes your profile memorable.</p>
              <label className="block cursor-pointer">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                  {data.videoFile ? (
                    <div className="flex items-center justify-center gap-2 text-success">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium">{data.videoFile.name}</span>
                    </div>
                  ) : (
                    <>
                      <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm text-gray-600">Click to upload video (max 60 seconds)</p>
                    </>
                  )}
                </div>
                <input type="file" accept="video/*" className="sr-only" onChange={handleVideoChange} />
              </label>
              {errors.video && <p className="text-xs text-error">{errors.video}</p>}
              <div className="flex flex-col gap-2">
                <Button fullWidth size="lg" onClick={() => setStep(6)}>Continue</Button>
                <Button fullWidth size="lg" variant="ghost" onClick={() => setStep(6)}>Skip for now</Button>
              </div>
            </div>
          )}

          {/* ── STEP 6: Skills & Availability ── */}
          {step === 6 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-gray-900">Skills & availability</h2>

              {/* Skills */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Your skills</label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_SKILLS.map((skill) => (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        data.skills.includes(skill)
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              {data.region !== 'UK' && parishOptions.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Preferred {data.region === 'Isle of Man' ? 'sheadings' : 'parishes'}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {parishOptions.map((parish) => (
                      <button
                        key={parish}
                        onClick={() => toggleParish(parish)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                          data.preferredParishes.includes(parish)
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
                        }`}
                      >
                        {parish}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {data.region === 'UK' && (
                <div className="space-y-3">
                  <Input label="Postcode" value={data.postcode} onChange={(e) => set({ postcode: e.target.value })} placeholder="e.g. SW1A 1AA" />
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Search radius: {data.searchRadiusKm}km</label>
                    <input type="range" min={1} max={50} value={data.searchRadiusKm} onChange={(e) => set({ searchRadiusKm: Number(e.target.value) })} className="w-full" />
                  </div>
                </div>
              )}

              {/* Availability */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">When can you work?</label>
                <div className="space-y-2">
                  {DAYS_OF_WEEK.map((day) => {
                    const dayData = data.availability[day as keyof Availability] as DayHours | null | undefined;
                    const enabled = !!dayData;
                    return (
                      <div key={day} className="flex items-center gap-3">
                        <button
                          onClick={() => toggleDay(day)}
                          className={`w-12 text-xs font-medium py-1 rounded-md border transition-colors ${
                            enabled ? 'bg-primary text-white border-primary' : 'bg-white text-gray-500 border-gray-300'
                          }`}
                        >
                          {DAY_LABELS[day as keyof typeof DAY_LABELS]}
                        </button>
                        {enabled && (
                          <div className="flex items-center gap-2 flex-1">
                            <input type="time" value={dayData?.startTime || '09:00'} onChange={(e) => setDayTime(day, 'startTime', e.target.value)} className="text-xs border border-gray-300 rounded px-2 py-1 flex-1" />
                            <span className="text-xs text-gray-400">to</span>
                            <input type="time" value={dayData?.endTime || '17:00'} onChange={(e) => setDayTime(day, 'endTime', e.target.value)} className="text-xs border border-gray-300 rounded px-2 py-1 flex-1" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <Button fullWidth size="lg" onClick={() => setStep(7)}>Continue</Button>
            </div>
          )}

          {/* ── STEP 7: Phone OTP ── */}
          {step === 7 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Verify your phone</h2>
              <p className="text-sm text-text-secondary">We&apos;ll send you a 6-digit code to verify your number. This helps keep the platform safe.</p>

              <Input
                label="Phone number"
                type="tel"
                value={data.phone}
                onChange={(e) => set({ phone: e.target.value })}
                error={errors.phone}
                placeholder="+44 7700 123456"
              />

              {!otpSent ? (
                <Button fullWidth loading={loading} onClick={handleSendOtp}>Send code</Button>
              ) : (
                <>
                  <Input
                    label="6-digit code"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                  />
                  <Button fullWidth size="lg" loading={loading} onClick={() => handleFinishRegistration(false)}>
                    Verify &amp; create account
                  </Button>
                </>
              )}

              <Button fullWidth size="lg" variant="ghost" loading={loading} onClick={() => handleFinishRegistration(true)}>
                Skip phone verification
              </Button>
              <p className="text-xs text-text-secondary text-center">You can add your phone number later in your profile settings.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
