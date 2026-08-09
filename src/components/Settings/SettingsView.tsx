import React, { useState } from 'react';
import { Moon, Sun, Monitor, Download, Upload, RotateCcw, Bell, MapPin, DollarSign, Camera, Trash2, Link as LinkIcon, Plus, Minus, Clock, CheckCircle2 } from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';
import { useTheme, type ThemeMode } from '../../context/ThemeContext';
import type { PaymentMethod } from '../../types';
import { sanitizeText } from '../../utils/sanitize';

const DEFAULT_AVATAR = "https://lh3.googleusercontent.com/aida-public/AB6AXuBFz6ZwYxKqDE_VcKK4pktAGb8GoX2lRz2rDkDvpzhHi3dZhL6d-N-fmFEa_fzBd4VfJ5USYJ3vEFeil_psZP0LY9MghFVGlqPXP_X9GGiOEVRLKap7BsN6-9tyM76Zi87mTXupIFFKGPtCQZCsHyQ8Xld43X_cpm_FGCO1I8xGztFq9FnUT24NSypW-mPUyW8P8Qw0tpY_sVaervsIqADLbXzKXrzNfXpnbJVH6dg4UGObeYVMUg";

const PRESET_AVATARS = [
  { id: 'bruce', label: 'Bruce Wayne', url: DEFAULT_AVATAR },
  { id: 'executive', label: 'Executive', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80' },
  { id: 'business', label: 'Business', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80' },
  { id: 'designer', label: 'Creative', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80' },
  { id: 'tech', label: 'Minimal', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80' },
];

const POPULAR_CURRENCIES = [
  { symbol: '₹', label: 'INR (₹)' },
  { symbol: '$', label: 'USD ($)' },
  { symbol: '€', label: 'EUR (€)' },
  { symbol: '£', label: 'GBP (£)' },
  { symbol: '¥', label: 'JPY (¥)' },
  { symbol: 'A$', label: 'AUD (A$)' },
  { symbol: 'C$', label: 'CAD (C$)' },
  { symbol: 'AED', label: 'AED' },
  { symbol: 'SAR', label: 'SAR' },
  { symbol: 'S$', label: 'SGD (S$)' },
  { symbol: 'Fr', label: 'CHF (Fr)' },
  { symbol: 'R$', label: 'BRL (R$)' },
];

const POPULAR_CITIES = ['Mumbai', 'Delhi', 'Bengaluru', 'London', 'New York', 'Dubai', 'Singapore', 'Tokyo'];

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    categories,
    exportBackupJSON,
    importBackupJSON,
    resetAllData,
    requestNotificationPermission,
    scheduleNotifications,
  } = useExpenses();
  const { theme, setTheme } = useTheme();

  const [userName, setUserName] = useState(settings.userName || 'Bruce Wayne');
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [photoMsg, setPhotoMsg] = useState('');

  const [customCurrency, setCustomCurrency] = useState(settings.currency || '₹');
  const [cityInput, setCityInput] = useState(settings.city || 'Mumbai');

  const currentPhoto = settings.profilePhoto || DEFAULT_AVATAR;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setPhotoMsg('Image size should be under 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Str = event.target?.result as string;
      await updateSettings({ profilePhoto: base64Str });
      setPhotoMsg('Profile photo updated from device!');
    };
    reader.readAsDataURL(file);
  };

  const handleSavePhotoUrl = async () => {
    if (!photoUrlInput.trim()) return;
    const url = photoUrlInput.trim();
    // Prevent XSS via javascript: or data: URIs
    if (url.startsWith('javascript:') || url.startsWith('data:')) {
      setPhotoMsg('Invalid image URL');
      return;
    }
    try {
      new URL(url); // Validate URL format
    } catch {
      setPhotoMsg('Invalid URL format');
      return;
    }
    await updateSettings({ profilePhoto: url });
    setPhotoMsg('Profile photo updated from URL!');
    setPhotoUrlInput('');
  };

  const handleSelectPreset = async (url: string) => {
    await updateSettings({ profilePhoto: url });
    setPhotoMsg('Preset avatar selected!');
  };

  const handleResetPhoto = async () => {
    await updateSettings({ profilePhoto: DEFAULT_AVATAR });
    setPhotoMsg('Profile photo reset to default!');
  };

  const handleSaveName = async () => {
    await updateSettings({ userName: sanitizeText(userName) });
    setPhotoMsg('User name saved successfully!');
  };

  const handleSaveCurrency = async (sym: string) => {
    setCustomCurrency(sym);
    await updateSettings({ currency: sym });
  };

  const handleSaveCity = async (cName: string) => {
    setCityInput(cName);
    await updateSettings({ city: sanitizeText(cName) });
  };

  const handleExportBackup = async () => {
    const jsonStr = await exportBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expense-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setPhotoMsg('Backup downloaded successfully!');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async event => {
      const content = event.target?.result as string;
      const success = await importBackupJSON(content);
      if (success) {
        setPhotoMsg('Backup restored successfully!');
      } else {
        setPhotoMsg('Failed to restore backup file. Invalid format.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = async () => {
    if (window.confirm('Are you sure you want to reset all expense data to initial default state?')) {
      await resetAllData();
      setPhotoMsg('All data has been reset to defaults.');
    }
  };

  // Notification helpers
  const generateTimeSlots = (frequency: number, startTime: string = '21:00'): string[] => {
    const times: string[] = [];
    const [startHour, startMin] = startTime.split(':').map(Number);
    const interval = Math.floor(24 / Math.max(1, frequency));
    
    for (let i = 0; i < frequency; i++) {
      const hour = (startHour + i * interval) % 24;
      const timeStr = `${hour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`;
      times.push(timeStr);
    }
    return times;
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    await updateSettings({ notificationEnabled: enabled });
    if (enabled) {
      await requestNotificationPermission();
      await scheduleNotifications();
    }
  };

  const handleFrequencyChange = async (newFrequency: number) => {
    const clampedFreq = Math.max(1, Math.min(5, newFrequency));
    const newTimes = generateTimeSlots(clampedFreq, settings.notificationTimes[0] || '21:00');
    await updateSettings({ 
      notificationFrequency: clampedFreq,
      notificationTimes: newTimes,
    });
    if (settings.notificationEnabled) {
      await scheduleNotifications();
    }
  };

  const handleTimeChange = async (index: number, newTime: string) => {
    const newTimes = [...settings.notificationTimes];
    newTimes[index] = newTime;
    await updateSettings({ notificationTimes: newTimes });
    if (settings.notificationEnabled) {
      await scheduleNotifications();
    }
  };

  const handleAddNotificationTime = async () => {
    if (settings.notificationFrequency >= 5) return;
    const newFrequency = settings.notificationFrequency + 1;
    const newTimes = generateTimeSlots(newFrequency, settings.notificationTimes[0] || '21:00');
    await updateSettings({ 
      notificationFrequency: newFrequency,
      notificationTimes: newTimes,
    });
    if (settings.notificationEnabled) {
      await scheduleNotifications();
    }
  };

  const handleRemoveNotificationTime = async (index: number) => {
    if (settings.notificationFrequency <= 1) return;
    const newTimes = settings.notificationTimes.filter((_, i) => i !== index);
    await updateSettings({ 
      notificationFrequency: newTimes.length,
      notificationTimes: newTimes,
    });
    if (settings.notificationEnabled) {
      await scheduleNotifications();
    }
  };

  return (
    <div style={{ padding: '16px 16px calc(100px + var(--safe-bottom)) 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Preferences & Controls
        </span>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--on-surface)', marginTop: 2 }}>
          Profile & Settings
        </h1>
      </div>

      {/* Profile Photo & Account Info Editor Card */}
      <div style={{ background: 'var(--surface-container-lowest)', borderRadius: '0.75rem', padding: 20, border: '1px solid var(--outline-variant)', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Avatar Preview with Camera Badge */}
          <div style={{ position: 'relative' }}>
            <img
              src={currentPhoto}
              alt="User Avatar"
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid var(--primary)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            />
            <label
              htmlFor="avatar-file-input"
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: 'var(--primary)',
                color: 'var(--on-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
              }}
            >
              <Camera size={14} />
            </label>
            <input
              id="avatar-file-input"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>
              Account Name
            </label>
            <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
              <input
                type="text"
                value={userName}
                onChange={e => setUserName(e.target.value)}
                placeholder="Enter your name"
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  borderRadius: '0.5rem',
                  background: 'var(--surface-container)',
                  border: '1px solid var(--outline-variant)',
                  color: 'var(--on-surface)',
                  fontSize: 14,
                  fontWeight: 600,
                  outline: 'none',
                }}
              />
              <button
                onClick={handleSaveName}
                className="active-press"
                style={{
                  padding: '6px 12px',
                  borderRadius: '0.5rem',
                  background: 'var(--primary)',
                  color: 'var(--on-primary)',
                  border: 'none',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>

        {photoMsg && (
          <div style={{ padding: '6px 10px', background: 'rgba(52, 211, 153, 0.15)', color: 'var(--secondary)', borderRadius: '0.5rem', fontSize: 12, fontWeight: 600 }}>
            {photoMsg}
          </div>
        )}

        {/* Change Photo Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 8, borderTop: '1px solid var(--outline-variant)' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--on-surface)' }}>
            Choose Profile Photo
          </span>

          {/* Action 1: Upload File Button */}
          <div style={{ display: 'flex', gap: 8 }}>
            <label
              className="active-press"
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '0.5rem',
                background: 'var(--surface-container)',
                border: '1px solid var(--outline-variant)',
                color: 'var(--on-surface)',
                fontSize: 12,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                cursor: 'pointer',
              }}
            >
              <Upload size={14} /> Upload from Device
              <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
            </label>

            <button
              onClick={handleResetPhoto}
              className="active-press"
              style={{
                padding: '8px 12px',
                borderRadius: '0.5rem',
                background: 'rgba(244, 63, 94, 0.12)',
                color: 'var(--error)',
                border: 'none',
                fontSize: 12,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                cursor: 'pointer',
              }}
            >
              <Trash2 size={14} /> Reset
            </button>
          </div>

          {/* Action 2: Image URL input */}
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              type="text"
              placeholder="Paste photo image URL..."
              value={photoUrlInput}
              onChange={e => setPhotoUrlInput(e.target.value)}
              style={{
                flex: 1,
                padding: '6px 10px',
                borderRadius: '0.5rem',
                background: 'var(--surface-container)',
                border: '1px solid var(--outline-variant)',
                color: 'var(--on-surface)',
                fontSize: 12,
                outline: 'none',
              }}
            />
            <button
              onClick={handleSavePhotoUrl}
              className="active-press"
              style={{
                padding: '6px 12px',
                borderRadius: '0.5rem',
                background: 'var(--surface-container-high)',
                color: 'var(--on-surface)',
                border: '1px solid var(--outline-variant)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <LinkIcon size={12} /> Apply
            </button>
          </div>

          {/* Action 3: Preset Avatars Gallery */}
          <div>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--on-surface-variant)' }}>
              Preset Avatars
            </span>
            <div style={{ display: 'flex', gap: 10, marginTop: 6, overflowX: 'auto', paddingBottom: 4 }}>
              {PRESET_AVATARS.map(p => {
                const isSelected = currentPhoto === p.url;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPreset(p.url)}
                    style={{
                      padding: 2,
                      borderRadius: '50%',
                      background: isSelected ? 'var(--primary)' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={p.url}
                      alt={p.label}
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Theme Switcher */}
      <div style={{ background: 'var(--surface-container-lowest)', borderRadius: '0.75rem', padding: 16, border: '1px solid var(--outline-variant)' }}>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--on-surface)', marginBottom: 12 }}>
          Appearance & Theme
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {[
            { id: 'dark', label: 'Dark Mode', icon: Moon },
            { id: 'light', label: 'Light Mode', icon: Sun },
            { id: 'system', label: 'System', icon: Monitor },
          ].map(t => {
            const IconComp = t.icon;
            const isSelected = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id as ThemeMode)}
                className="active-press"
                style={{
                  padding: '10px 4px',
                  borderRadius: '0.5rem',
                  background: isSelected ? 'var(--primary)' : 'var(--surface-container)',
                  color: isSelected ? 'var(--on-primary)' : 'var(--on-surface-variant)',
                  border: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <IconComp size={16} />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Currency Selection */}
      <div style={{ background: 'var(--surface-container-lowest)', borderRadius: '0.75rem', padding: 16, border: '1px solid var(--outline-variant)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          <DollarSign size={18} color="var(--primary)" />
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--on-surface)' }}>
            Currency Settings
          </span>
        </div>

        <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--on-surface-variant)' }}>
          Popular Currencies
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 8, marginBottom: 14 }}>
          {POPULAR_CURRENCIES.map(c => {
            const isSelected = settings.currency === c.symbol;
            return (
              <button
                key={c.symbol}
                onClick={() => handleSaveCurrency(c.symbol)}
                className="active-press"
                style={{
                  padding: '8px 4px',
                  borderRadius: '0.5rem',
                  background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'var(--surface-container)',
                  border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--outline-variant)',
                  color: isSelected ? 'var(--primary)' : 'var(--on-surface)',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                {c.symbol}
              </button>
            );
          })}
        </div>

        {/* Custom Currency Entry */}
        <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--on-surface-variant)' }}>
          Custom Currency Symbol or Code
        </label>
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <input
            type="text"
            placeholder="e.g. KSh, R$, ₺, ฿, zł"
            value={customCurrency}
            onChange={e => setCustomCurrency(e.target.value)}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '0.5rem',
              background: 'var(--surface-container)',
              border: '1px solid var(--outline-variant)',
              color: 'var(--on-surface)',
              fontSize: 14,
              fontWeight: 500,
              outline: 'none',
            }}
          />
          <button
            onClick={() => handleSaveCurrency(customCurrency)}
            className="active-press"
            style={{
              padding: '8px 16px',
              borderRadius: '0.5rem',
              background: 'var(--primary)',
              color: 'var(--on-primary)',
              border: 'none',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Apply
          </button>
        </div>
      </div>

      {/* City Settings */}
      <div style={{ background: 'var(--surface-container-lowest)', borderRadius: '0.75rem', padding: 16, border: '1px solid var(--outline-variant)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          <MapPin size={18} color="var(--secondary)" />
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--on-surface)' }}>
            Default City / Location
          </span>
        </div>

        <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--on-surface-variant)' }}>
          Home City Name
        </label>
        <div style={{ display: 'flex', gap: 8, marginTop: 6, marginBottom: 12 }}>
          <input
            type="text"
            placeholder="e.g. Mumbai, New York, London..."
            value={cityInput}
            onChange={e => setCityInput(e.target.value)}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '0.5rem',
              background: 'var(--surface-container)',
              border: '1px solid var(--outline-variant)',
              color: 'var(--on-surface)',
              fontSize: 14,
              fontWeight: 500,
              outline: 'none',
            }}
          />
          <button
            onClick={() => handleSaveCity(cityInput)}
            className="active-press"
            style={{
              padding: '8px 16px',
              borderRadius: '0.5rem',
              background: 'var(--secondary)',
              color: 'var(--on-secondary)',
              border: 'none',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Save City
          </button>
        </div>

        <label style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Quick City Shortcuts</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
          {POPULAR_CITIES.map(c => (
            <button
              key={c}
              onClick={() => handleSaveCity(c)}
              className="active-press"
              style={{
                padding: '4px 10px',
                borderRadius: '9999px',
                background: settings.city === c ? 'rgba(52, 211, 153, 0.15)' : 'var(--surface-container)',
                border: settings.city === c ? '1px solid var(--secondary)' : '1px solid var(--outline-variant)',
                color: settings.city === c ? 'var(--secondary)' : 'var(--on-surface-variant)',
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Regional Preferences */}
      <div style={{ background: 'var(--surface-container-lowest)', borderRadius: '0.75rem', padding: 16, border: '1px solid var(--outline-variant)' }}>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--on-surface)', marginBottom: 12 }}>
          Regional Defaults
        </label>

        {/* First Day of Week */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--on-surface-variant)' }}>
            First Day of Week
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 6 }}>
            {(['Monday', 'Sunday'] as ('Monday' | 'Sunday')[]).map(day => (
              <button
                key={day}
                onClick={() => updateSettings({ firstDayOfWeek: day })}
                style={{
                  padding: '8px',
                  borderRadius: '0.5rem',
                  background: settings.firstDayOfWeek === day ? 'rgba(99, 102, 241, 0.15)' : 'var(--surface-container)',
                  border: settings.firstDayOfWeek === day ? '1.5px solid var(--primary)' : '1px solid var(--outline-variant)',
                  color: settings.firstDayOfWeek === day ? 'var(--primary)' : 'var(--on-surface)',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Default Payment Method */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--on-surface-variant)' }}>
            Default Payment Method
          </label>
          <select
            value={settings.defaultPaymentMethod}
            onChange={e => updateSettings({ defaultPaymentMethod: e.target.value as PaymentMethod })}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '0.5rem',
              background: 'var(--surface-container)',
              border: '1px solid var(--outline-variant)',
              color: 'var(--on-surface)',
              fontSize: 13,
              marginTop: 4,
              outline: 'none',
            }}
          >
            {['Cash', 'UPI', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Other'].map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Default Category */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--on-surface-variant)' }}>
            Default Category
          </label>
          <select
            value={settings.defaultCategory}
            onChange={e => updateSettings({ defaultCategory: e.target.value })}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '0.5rem',
              background: 'var(--surface-container)',
              border: '1px solid var(--outline-variant)',
              color: 'var(--on-surface)',
              fontSize: 13,
              marginTop: 4,
              outline: 'none',
            }}
          >
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Notifications & Reminders */}
      <div style={{ background: 'var(--surface-container-lowest)', borderRadius: '0.75rem', padding: 16, border: '1px solid var(--outline-variant)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Bell size={18} color="var(--tertiary)" />
            <div>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--on-surface)' }}>
                Expense Reminders
              </span>
              <div style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Get notified to log your expenses</div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.notificationEnabled}
            onChange={e => handleNotificationToggle(e.target.checked)}
            style={{ width: 18, height: 18, cursor: 'pointer' }}
          />
        </div>

        {settings.notificationEnabled && (
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Frequency Selector */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--on-surface-variant)' }}>
                Reminders per day
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                <button
                  onClick={() => handleFrequencyChange(settings.notificationFrequency - 1)}
                  disabled={settings.notificationFrequency <= 1}
                  className="active-press"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: settings.notificationFrequency <= 1 ? 'var(--surface-container)' : 'var(--primary)',
                    color: settings.notificationFrequency <= 1 ? 'var(--on-surface-variant)' : 'var(--on-primary)',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: settings.notificationFrequency <= 1 ? 'not-allowed' : 'pointer',
                  }}
                >
                  <Minus size={18} />
                </button>
                <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--on-surface)', minWidth: 40, textAlign: 'center' }}>
                  {settings.notificationFrequency}
                </span>
                <button
                  onClick={() => handleFrequencyChange(settings.notificationFrequency + 1)}
                  disabled={settings.notificationFrequency >= 5}
                  className="active-press"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: settings.notificationFrequency >= 5 ? 'var(--surface-container)' : 'var(--primary)',
                    color: settings.notificationFrequency >= 5 ? 'var(--on-surface-variant)' : 'var(--on-primary)',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: settings.notificationFrequency >= 5 ? 'not-allowed' : 'pointer',
                  }}
                >
                  <Plus size={18} />
                </button>
                <span style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginLeft: 8 }}>
                  (1-5 times daily)
                </span>
              </div>
            </div>

            {/* Time Slots */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--on-surface-variant)' }}>
                Notification Times
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                {settings.notificationTimes.slice(0, settings.notificationFrequency).map((time, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Clock size={18} color="var(--primary)" />
                    <input
                      type="time"
                      value={time}
                      onChange={e => handleTimeChange(index, e.target.value)}
                      style={{
                        flex: 1,
                        padding: '10px 12px',
                        borderRadius: '0.5rem',
                        background: 'var(--surface-container)',
                        border: '1px solid var(--outline-variant)',
                        color: 'var(--on-surface)',
                        fontSize: 14,
                        fontWeight: 600,
                        outline: 'none',
                      }}
                    />
                    {settings.notificationFrequency > 1 && (
                      <button
                        onClick={() => handleRemoveNotificationTime(index)}
                        className="active-press"
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          background: 'rgba(244, 63, 94, 0.12)',
                          color: 'var(--error)',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <span style={{ fontSize: 18, lineHeight: 1 }}>×</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button
                onClick={handleAddNotificationTime}
                disabled={settings.notificationFrequency >= 5}
                className="active-press"
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '0.5rem',
                  background: settings.notificationFrequency >= 5 ? 'var(--surface-container)' : 'var(--surface-container-high)',
                  border: '1px solid var(--outline-variant)',
                  color: settings.notificationFrequency >= 5 ? 'var(--on-surface-variant)' : 'var(--on-surface)',
                  fontSize: 12,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  cursor: settings.notificationFrequency >= 5 ? 'not-allowed' : 'pointer',
                }}
              >
                <Plus size={14} /> Add Reminder Time
              </button>
              <button
                onClick={() => {
                  const newTimes = generateTimeSlots(settings.notificationFrequency, '21:00');
                  updateSettings({ notificationTimes: newTimes });
                }}
                className="active-press"
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '0.5rem',
                  background: 'var(--surface-container-high)',
                  border: '1px solid var(--outline-variant)',
                  color: 'var(--on-surface)',
                  fontSize: 12,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  cursor: 'pointer',
                }}
              >
                <RotateCcw size={14} /> Reset to Evening
              </button>
            </div>

            {/* Test Notification */}
            <button
              onClick={async () => {
                if ('Notification' in window && Notification.permission === 'granted') {
                  new Notification('You Ain\'t Bruce Wayne', {
                    body: 'Test notification - your expense reminder is working! 💰',
                    icon: '/vite.svg',
                    tag: 'expense-reminder-test',
                  });
                } else if ('Notification' in window) {
                  const permission = await Notification.requestPermission();
                  if (permission === 'granted') {
                    new Notification('You Ain\'t Bruce Wayne', {
                      body: 'Test notification - your expense reminder is working! 💰',
                      icon: '/vite.svg',
                      tag: 'expense-reminder-test',
                    });
                  }
                }
              }}
              className="active-press"
              style={{
                marginTop: 8,
                padding: '10px',
                borderRadius: '0.5rem',
                background: 'var(--primary)',
                color: 'var(--on-primary)',
                border: 'none',
                fontSize: 13,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                cursor: 'pointer',
              }}
            >
              <CheckCircle2 size={16} /> Send Test Notification
            </button>
          </div>
        )}
      </div>

      {/* Backup & Data Reset */}
      <div style={{ background: 'var(--surface-container-lowest)', borderRadius: '0.75rem', padding: 16, border: '1px solid var(--outline-variant)' }}>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--on-surface)', marginBottom: 12 }}>
          Data Backup & Restore
        </label>

        {photoMsg && (
          <div style={{ padding: '8px 12px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)', borderRadius: '0.5rem', fontSize: 12, fontWeight: 600, marginBottom: 12 }}>
            {photoMsg}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          <button
            onClick={handleExportBackup}
            className="active-press"
            style={{
              padding: '10px',
              borderRadius: '0.5rem',
              background: 'var(--surface-container)',
              border: '1px solid var(--outline-variant)',
              color: 'var(--on-surface)',
              fontSize: 12,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              cursor: 'pointer',
            }}
          >
            <Download size={16} /> Backup JSON
          </button>

          <label
            className="active-press"
            style={{
              padding: '10px',
              borderRadius: '0.5rem',
              background: 'var(--surface-container)',
              border: '1px solid var(--outline-variant)',
              color: 'var(--on-surface)',
              fontSize: 12,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              cursor: 'pointer',
            }}
          >
            <Upload size={16} /> Restore JSON
            <input type="file" accept=".json" onChange={handleImportFile} style={{ display: 'none' }} />
          </label>
        </div>

        <button
          onClick={handleResetData}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '0.5rem',
            background: 'rgba(244, 63, 94, 0.12)',
            color: 'var(--error)',
            border: 'none',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <RotateCcw size={16} /> Reset All App Data
        </button>
      </div>
    </div>
  );
};
