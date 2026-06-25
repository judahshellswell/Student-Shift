'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useUploadBusinessLogo } from '@/hooks/useProfile';
import { useBlockedUsers, useUnblockUser } from '@/hooks/useBlocking';
import { useToast } from '@/components/providers/ToastProvider';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';

export default function BusinessProfilePage() {
  const { businessProfile, updateBusinessProfile, signOut } = useAuthStore();
  const uploadLogo = useUploadBusinessLogo();
  const { data: blockedUsers = [] } = useBlockedUsers();
  const unblockUser = useUnblockUser();
  const { showSuccess, showError } = useToast();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    business_name: businessProfile?.business_name || '',
    contact_name: businessProfile?.contact_name || '',
    email: businessProfile?.email || '',
    phone: businessProfile?.phone || '',
    description: businessProfile?.description || '',
    website: businessProfile?.website || '',
    address: businessProfile?.address || '',
    region: businessProfile?.region || '',
    postcode: businessProfile?.postcode || '',
  });

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadLogo.mutateAsync(file);
      showSuccess('Logo updated!');
    } catch { showError('Could not upload logo.'); }
  };

  const handleSave = async () => {
    try {
      await updateBusinessProfile(form);
      setEditing(false);
      showSuccess('Profile saved!');
    } catch { showError('Could not save profile.'); }
  };

  const tierColors: Record<string, string> = {
    unverified: 'bg-gray-100 text-gray-600',
    basic: 'bg-blue-100 text-blue-700',
    standard: 'bg-purple-100 text-purple-700',
    enhanced: 'bg-green-100 text-green-700',
  };
  const tier = businessProfile?.verification_tier || 'unverified';

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Business Profile</h1>
        <Button variant={editing ? 'ghost' : 'secondary'} onClick={() => setEditing(!editing)}>
          {editing ? 'Cancel' : 'Edit profile'}
        </Button>
      </div>

      {/* Logo + name */}
      <Card padding="lg">
        <div className="flex items-start gap-4">
          <div className="relative">
            <Avatar src={businessProfile?.logo_url} name={businessProfile?.business_name} size="xl" />
            <label className="absolute bottom-0 right-0 w-7 h-7 bg-secondary rounded-full flex items-center justify-center cursor-pointer hover:bg-secondary-dark">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <input type="file" accept="image/*" className="sr-only" onChange={handleLogoChange} />
            </label>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{businessProfile?.business_name || 'Your business'}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${tierColors[tier]}`}>
                {tier} verification
              </span>
              {!businessProfile?.is_verified && (
                <Button variant="ghost" size="sm" className="text-xs text-secondary">Apply for verification →</Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Details */}
      <Card padding="md">
        {editing ? (
          <div className="space-y-4">
            <Input label="Business name" value={form.business_name} onChange={(e) => setForm({ ...form, business_name: e.target.value })} />
            <Input label="Your name" value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} />
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input label="Phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            <Input label="Website" type="url" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://..." />
            <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            <Select
              label="Region"
              value={form.region}
              onChange={(e) => setForm({ ...form, region: e.target.value })}
              options={['Jersey','Guernsey','Isle of Man','UK'].map((r) => ({ value: r, label: r }))}
              placeholder="Select region..."
            />
            {form.region === 'UK' && (
              <Input label="Postcode" value={form.postcode} onChange={(e) => setForm({ ...form, postcode: e.target.value })} />
            )}
            <Button fullWidth onClick={handleSave}>Save changes</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {[
              { label: 'Contact', value: businessProfile?.contact_name },
              { label: 'Email', value: businessProfile?.email },
              { label: 'Phone', value: businessProfile?.phone },
              { label: 'Website', value: businessProfile?.website },
              { label: 'Region', value: businessProfile?.region },
              { label: 'Address', value: businessProfile?.address },
            ].map(({ label, value }) => value ? (
              <div key={label} className="flex gap-4">
                <span className="text-xs text-text-secondary w-16 flex-shrink-0 pt-0.5">{label}</span>
                <span className="text-sm text-gray-800">{value}</span>
              </div>
            ) : null)}
            {businessProfile?.description && (
              <div>
                <p className="text-xs text-text-secondary mb-1">About</p>
                <p className="text-sm text-gray-700">{businessProfile.description}</p>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Blocked students */}
      {blockedUsers.length > 0 && (
        <Card padding="md">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Blocked students ({blockedUsers.length})</h3>
          <div className="space-y-2">
            {blockedUsers.map((blocked) => {
              const isUnblocking = unblockUser.isPending && unblockUser.variables === blocked.blocked_id;
              return (
                <div key={blocked.id} className="flex items-center justify-between py-1.5">
                  <p className="text-sm text-gray-700">{(blocked as any).blocked_name || blocked.blocked_id}</p>
                  <button
                    onClick={async () => {
                      try {
                        await unblockUser.mutateAsync(blocked.blocked_id);
                        showSuccess('Student unblocked.');
                      } catch {
                        showError('Failed to unblock. Please try again.');
                      }
                    }}
                    disabled={isUnblocking}
                    className="text-xs text-primary hover:underline disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isUnblocking && (
                      <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                    )}
                    Unblock
                  </button>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Sign out */}
      <Card padding="md">
        <Button variant="ghost" fullWidth onClick={signOut}>Sign out</Button>
      </Card>
    </div>
  );
}
