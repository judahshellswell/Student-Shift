'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  auth, createUserWithEmailAndPassword,
  uploadFile, compressImage,
  createUserProfile, functions, httpsCallable,
} from '@/lib/firebase';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/providers/ToastProvider';
import { REGIONS } from '@/lib/constants';

interface WizardData {
  email: string;
  password: string;
  businessName: string;
  contactName: string;
  contactEmail: string;
  phone: string;
  description: string;
  website: string;
  region: string;
  address: string;
  postcode: string;
  logoFile?: File;
  logoPreview?: string;
}

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-1 mb-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= current ? 'bg-secondary' : 'bg-gray-200'}`} />
      ))}
    </div>
  );
}

export default function BusinessRegisterPage() {
  const router = useRouter();
  const { fetchProfile } = useAuthStore();
  const { showError, showSuccess } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [data, setData] = useState<WizardData>({
    email: '', password: '', businessName: '', contactName: '',
    contactEmail: '', phone: '', description: '', website: '',
    region: 'Jersey', address: '', postcode: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (updates: Partial<WizardData>) => setData((prev) => ({ ...prev, ...updates }));

  const handleStep1 = async () => {
    const errs: Record<string, string> = {};
    if (!data.email.trim()) errs.email = 'Email is required';
    if (!data.password || data.password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const checkBanned = httpsCallable(functions, 'checkSignupBanned');
      const result = await checkBanned({ email: data.email }) as { data: { banned: boolean } };
      if (result.data.banned) {
        setErrors({ email: 'This email address cannot be used to create an account.' });
        setLoading(false);
        return;
      }
      await createUserWithEmailAndPassword(auth, data.email, data.password);
      setStep(2);
    } catch (err: any) {
      if (err?.code === 'auth/email-already-in-use') setErrors({ email: 'An account with this email already exists.' });
      else showError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2 = () => {
    const errs: Record<string, string> = {};
    if (!data.businessName.trim()) errs.businessName = 'Business name is required';
    if (!data.contactName.trim()) errs.contactName = 'Contact name is required';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setStep(3);
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    set({ logoFile: file, logoPreview: URL.createObjectURL(file) });
  };

  const handleSendOtp = async () => {
    if (!data.phone.trim()) { setErrors({ phone: 'Phone number is required' }); return; }
    setLoading(true);
    try {
      const sendOtp = httpsCallable(functions, 'sendPhoneOtp');
      await sendOtp({ phone: data.phone });
      setOtpSent(true);
      showSuccess('Code sent!');
    } catch (err: any) {
      showError(err.message || 'Could not send code.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinishRegistration = async (skipPhone = false) => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');

      if (!skipPhone && otpSent && otp.length === 6) {
        const verifyOtp = httpsCallable(functions, 'verifyPhoneOtp');
        await verifyOtp({ phone: data.phone, otp });
      }

      let logoUrl: string | undefined;
      if (data.logoFile) {
        const compressed = await compressImage(data.logoFile);
        const ext = data.logoFile.name.split('.').pop() || 'jpg';
        logoUrl = await uploadFile(compressed as File, `logos/${user.uid}/logo.${ext}`);
      }

      await createUserProfile(user.uid, {
        email: data.email,
        userType: 'business',
        businessName: data.businessName,
        contactName: data.contactName,
        contactEmail: data.contactEmail || data.email,
        phone: data.phone || undefined,
        description: data.description || undefined,
        website: data.website || undefined,
        region: data.region || undefined,
        address: data.address || undefined,
        postcode: data.postcode || undefined,
        logoUrl,
      });

      await fetchProfile();
      router.replace('/business');
    } catch (err: any) {
      showError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="text-2xl font-bold">
            <span className="text-primary">Student</span><span className="text-secondary">Shift</span>
          </Link>
          <p className="text-sm text-text-secondary mt-1">Create your business account</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-text-secondary">Step {step} of 3</span>
            {step > 1 && (
              <button onClick={() => setStep(step - 1)} className="text-sm text-primary hover:underline">Back</button>
            )}
          </div>
          <StepIndicator current={step} />

          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Create your account</h2>
              <Input label="Business email" type="email" value={data.email} onChange={(e) => set({ email: e.target.value })} error={errors.email} placeholder="you@yourbusiness.com" autoFocus />
              <Input label="Password" type="password" value={data.password} onChange={(e) => set({ password: e.target.value })} error={errors.password} placeholder="Min. 8 characters" />
              <Button fullWidth size="lg" loading={loading} onClick={handleStep1}>Continue</Button>
              <p className="text-center text-sm text-text-secondary">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-primary font-medium hover:underline">Sign in</Link>
              </p>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Business details</h2>
              <Input label="Business name" value={data.businessName} onChange={(e) => set({ businessName: e.target.value })} error={errors.businessName} placeholder="Your business name" autoFocus />
              <Input label="Your name" value={data.contactName} onChange={(e) => set({ contactName: e.target.value })} error={errors.contactName} placeholder="Your full name" />
              <Input label="Contact email (if different)" type="email" value={data.contactEmail} onChange={(e) => set({ contactEmail: e.target.value })} placeholder="contact@yourbusiness.com" />
              <Input label="Website (optional)" type="url" value={data.website} onChange={(e) => set({ website: e.target.value })} placeholder="https://yourbusiness.com" />

              {/* Logo upload */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Business logo (optional)</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 overflow-hidden flex items-center justify-center">
                    {data.logoPreview ? (
                      <img src={data.logoPreview} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>
                  <label className="cursor-pointer">
                    <span className="text-sm text-primary hover:underline">Upload logo</span>
                    <input type="file" accept="image/*" className="sr-only" onChange={handleLogoChange} />
                  </label>
                </div>
              </div>

              <Select
                label="Region"
                value={data.region}
                onChange={(e) => set({ region: e.target.value })}
                options={['Jersey', 'Guernsey', 'Isle of Man', 'UK'].map((r) => ({ value: r, label: r }))}
              />
              <Input label="Address" value={data.address} onChange={(e) => set({ address: e.target.value })} placeholder="Business address" />
              {data.region === 'UK' && (
                <Input label="Postcode" value={data.postcode} onChange={(e) => set({ postcode: e.target.value })} placeholder="e.g. SW1A 1AA" />
              )}
              <Textarea label="Business description" value={data.description} onChange={(e) => set({ description: e.target.value })} placeholder="Tell students about your business..." rows={3} showCount maxLength={500} />

              <Button fullWidth size="lg" onClick={handleStep2}>Continue</Button>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Verify your phone</h2>
              <p className="text-sm text-text-secondary">A verified phone number helps us keep the platform safe for students.</p>
              <Input label="Phone number" type="tel" value={data.phone} onChange={(e) => set({ phone: e.target.value })} error={errors.phone} placeholder="+44 7700 123456" />
              {!otpSent ? (
                <Button fullWidth loading={loading} onClick={handleSendOtp}>Send code</Button>
              ) : (
                <>
                  <Input label="6-digit code" type="text" inputMode="numeric" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" />
                  <Button fullWidth size="lg" loading={loading} onClick={() => handleFinishRegistration(false)}>Verify &amp; create account</Button>
                </>
              )}
              <Button fullWidth size="lg" variant="ghost" loading={loading} onClick={() => handleFinishRegistration(true)}>Skip phone verification</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
