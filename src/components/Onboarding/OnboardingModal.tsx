import React, { useState } from 'react';
import { ShieldCheck, Sparkles, User, DollarSign, MapPin, Camera, ArrowRight, Check } from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';
import { sanitizeText } from '../../utils/sanitize';

const PRESET_AVATARS = [
  { id: 'bruce', name: 'Bruce Wayne', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBFz6ZwYxKqDE_VcKK4pktAGb8GoX2lRz2rDkDvpzhHi3dZhL6d-N-fmFEa_fzBd4VfJ5USYJ3vEFeil_psZP0LY9MghFVGlqPXP_X9GGiOEVRLKap7BsN6-9tyM76Zi87mTXupIFFKGPtCQZCsHyQ8Xld43X_cpm_FGCO1I8xGztFq9FnUT24NSypW-mPUyW8P8Qw0tpY_sVaervsIqADLbXzKXrzNfXpnbJVH6dg4UGObeYVMUg' },
  { id: 'executive', name: 'Executive', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
  { id: 'business', name: 'Business', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
  { id: 'creative', name: 'Creative', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
  { id: 'minimal', name: 'Minimalist', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80' },
];

const CURRENCY_OPTIONS = [
  { symbol: '$', label: 'USD ($)' },
  { symbol: '₹', label: 'INR (₹)' },
  { symbol: '€', label: 'EUR (€)' },
  { symbol: '£', label: 'GBP (£)' },
  { symbol: 'AED', label: 'AED (Dirham)' },
  { symbol: 'SAR', label: 'SAR (Riyal)' },
  { symbol: 'CAD', label: 'CAD ($)' },
  { symbol: 'KSh', label: 'KSh (Shilling)' },
  { symbol: 'R$', label: 'BRL (R$)' },
];

export const OnboardingModal: React.FC = () => {
  const { settings, updateSettings, updateBudget, budget } = useExpenses();
  const [step, setStep] = useState<1 | 2>(1);

  const [userName, setUserName] = useState(settings.userName || '');
  const [profilePhoto, setProfilePhoto] = useState(settings.profilePhoto || PRESET_AVATARS[0].url);
  const [currency, setCurrency] = useState(settings.currency || '$');
  const [customCurrency, setCustomCurrency] = useState('');
  const [city, setCity] = useState(settings.city || 'New York');
  const [monthlyBudget, setMonthlyBudget] = useState<string>(budget?.monthlyBudget ? String(budget.monthlyBudget) : '3000');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Only allow data: URIs from file uploads (safe)
        if (result.startsWith('data:image/')) {
          setProfilePhoto(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleComplete = async () => {
    const activeCurrency = customCurrency.trim() ? customCurrency.trim() : currency;
    
    await updateSettings({
      userName: sanitizeText(userName.trim() || 'Valued User'),
      profilePhoto,
      currency: activeCurrency,
      city: sanitizeText(city.trim() || 'Home City'),
      hasCompletedOnboarding: true,
    });

    const parsedBudget = parseFloat(monthlyBudget);
    if (!isNaN(parsedBudget) && parsedBudget > 0) {
      await updateBudget({
        monthlyBudget: parsedBudget,
        weeklyBudget: Math.round(parsedBudget / 4),
      });
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'var(--surface)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 20px 32px 20px',
        overflowY: 'auto',
      }}
    >
      {/* Background Decorator */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(11, 15, 25, 0) 70%)',
          pointerEvents: 'none',
        }}
      />

      {step === 1 ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', position: 'relative', zIndex: 10 }}>
          {/* Logo Badge */}
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '24px',
              background: 'var(--surface-container-high)',
              border: '1px solid var(--outline-variant)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
              boxShadow: '0 12px 32px rgba(99, 102, 241, 0.25)',
            }}
          >
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLpyknJVAtY4UFKawD4WuPFJm6smo0i1eWsb-htmj4EBxKsbnICT3w1Pn2XqMSIc7sVGrdtxL4uMkaNSfsiEpdzlWsfM9Cds2-S9ucCW83g8n21OIpOFI-Qxw4bPLGjevKS6W-yYqhPT8pTfoiEskm6cK43_QJlE9QAjENRKovlgfcf7OAiYhCiNSiBfoWNVpa2Azl4lQzQzYaVXVAAXQLf01_bWPFP_PEKlH4xs1bTioEe_WYGA"
              alt="Logo"
              style={{ width: 48, height: 48, objectFit: 'contain' }}
            />
          </div>

          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
            Expense Tracker
          </span>

          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--on-surface)', lineHeight: 1.25, marginBottom: 12 }}>
            You Ain't Bruce Wayne
          </h1>

          <p style={{ fontSize: 14, color: 'var(--on-surface-variant)', maxWidth: 340, lineHeight: 1.6, marginBottom: 32 }}>
            Unless you have Wayne Enterprises funding your account, tracking daily expenses is essential. Log purchases in under 10 seconds.
          </p>

          {/* Core Feature Pillars */}
          <div style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'left', marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'var(--surface-container-lowest)', borderRadius: '1rem', border: '1px solid var(--outline-variant)' }}>
              <div style={{ width: 38, height: 38, borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
                <Sparkles size={20} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--on-surface)' }}>10-Second Expense Entry</div>
                <div style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>3x4 keypad, category chips & receipt photo</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'var(--surface-container-lowest)', borderRadius: '1rem', border: '1px solid var(--outline-variant)' }}>
              <div style={{ width: 38, height: 38, borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)', flexShrink: 0 }}>
                <ShieldCheck size={20} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--on-surface)' }}>100% Private & Offline</div>
                <div style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>Data stays strictly on your device</div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setStep(2)}
            className="active-press"
            style={{
              width: '100%',
              maxWidth: 360,
              padding: '16px',
              borderRadius: '1rem',
              background: 'var(--primary)',
              color: 'var(--on-primary)',
              fontSize: 16,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
            }}
          >
            Setup Your Profile <ArrowRight size={20} />
          </button>
        </div>
      ) : (
        /* STEP 2: ACCOUNT & FINANCIAL PREFERENCES SETUP */
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20, position: 'relative', zIndex: 10, maxWidth: 440, margin: '0 auto', width: '100%' }}>
          <div>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Step 2 of 2
            </span>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--on-surface)', marginTop: 2 }}>
              Set Your Preferences
            </h2>
            <p style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginTop: 4 }}>
              Customize your account profile, currency, and home location.
            </p>
          </div>

          {/* Profile Photo Selector */}
          <div style={{ background: 'var(--surface-container-lowest)', borderRadius: '1rem', padding: 16, border: '1px solid var(--outline-variant)' }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--on-surface)', marginBottom: 12 }}>
              Choose Profile Photo
            </label>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
              <div style={{ position: 'relative', width: 64, height: 64 }}>
                <img
                  src={profilePhoto}
                  alt="Profile"
                  style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
                />
                <label
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <Camera size={12} />
                  <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                </label>
              </div>

              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--on-surface)' }}>Upload or Select Avatar</div>
                <div style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Choose from presets below or pick a photo</div>
              </div>
            </div>

            {/* Presets */}
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
              {PRESET_AVATARS.map(avatar => (
                <button
                  key={avatar.id}
                  onClick={() => setProfilePhoto(avatar.url)}
                  style={{
                    background: 'none',
                    border: profilePhoto === avatar.url ? '2px solid var(--primary)' : '1px solid var(--outline-variant)',
                    borderRadius: '50%',
                    padding: 2,
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  <img src={avatar.url} alt={avatar.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          </div>

          {/* Account Name */}
          <div style={{ background: 'var(--surface-container-lowest)', borderRadius: '1rem', padding: 16, border: '1px solid var(--outline-variant)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--on-surface)', marginBottom: 6 }}>
              <User size={16} color="var(--primary)" /> Your Name
            </label>
            <input
              type="text"
              value={userName}
              onChange={e => setUserName(e.target.value)}
              placeholder="e.g. Bruce Wayne or Kshitij"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '0.5rem',
                background: 'var(--surface-container-high)',
                border: '1px solid var(--outline-variant)',
                color: 'var(--on-surface)',
                fontSize: 14,
                fontWeight: 600,
                outline: 'none',
              }}
            />
          </div>

          {/* Currency Selection */}
          <div style={{ background: 'var(--surface-container-lowest)', borderRadius: '1rem', padding: 16, border: '1px solid var(--outline-variant)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--on-surface)', marginBottom: 8 }}>
              <DollarSign size={16} color="var(--secondary)" /> Select Currency
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
              {CURRENCY_OPTIONS.map(c => (
                <button
                  key={c.symbol}
                  onClick={() => { setCurrency(c.symbol); setCustomCurrency(''); }}
                  className="active-press"
                  style={{
                    padding: '6px 12px',
                    borderRadius: '9999px',
                    background: currency === c.symbol && !customCurrency ? 'var(--secondary)' : 'var(--surface-container-high)',
                    color: currency === c.symbol && !customCurrency ? '#000000' : 'var(--on-surface)',
                    border: '1px solid var(--outline-variant)',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={customCurrency}
              onChange={e => setCustomCurrency(e.target.value)}
              placeholder="Or enter custom currency symbol / code..."
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '0.5rem',
                background: 'var(--surface-container-high)',
                border: '1px solid var(--outline-variant)',
                color: 'var(--on-surface)',
                fontSize: 12,
                outline: 'none',
              }}
            />
          </div>

          {/* City & Monthly Budget */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: 'var(--surface-container-lowest)', borderRadius: '1rem', padding: 14, border: '1px solid var(--outline-variant)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: 'var(--on-surface)', marginBottom: 6 }}>
                <MapPin size={14} color="var(--primary)" /> Home City
              </label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="e.g. Mumbai"
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '0.5rem',
                  background: 'var(--surface-container-high)',
                  border: '1px solid var(--outline-variant)',
                  color: 'var(--on-surface)',
                  fontSize: 13,
                  fontWeight: 600,
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ background: 'var(--surface-container-lowest)', borderRadius: '1rem', padding: 14, border: '1px solid var(--outline-variant)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: 'var(--on-surface)', marginBottom: 6 }}>
                Monthly Budget
              </label>
              <input
                type="number"
                value={monthlyBudget}
                onChange={e => setMonthlyBudget(e.target.value)}
                placeholder="e.g. 3000"
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '0.5rem',
                  background: 'var(--surface-container-high)',
                  border: '1px solid var(--outline-variant)',
                  color: 'var(--on-surface)',
                  fontSize: 13,
                  fontWeight: 600,
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <button
            onClick={handleComplete}
            className="active-press"
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '1rem',
              background: 'var(--primary)',
              color: 'var(--on-primary)',
              fontSize: 16,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginTop: 10,
              boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
            }}
          >
            Save & Start Tracking <Check size={20} />
          </button>
        </div>
      )}
    </div>
  );
};
