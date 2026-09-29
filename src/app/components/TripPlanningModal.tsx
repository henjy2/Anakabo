import { useState } from 'react';
import { X, Clock, MapPin, Bell, Navigation, Calendar } from 'lucide-react';

interface TripPlanningModalProps {
  onClose: () => void;
  onConfirm: (msg: string) => void;
  t: (key: string) => string;
}

export function TripPlanningModal({ onClose, onConfirm, t }: TripPlanningModalProps) {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const defaultDepart = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const defaultArrive = `${pad((now.getHours() + 1) % 24)}:${pad(now.getMinutes())}`;
  const defaultDate = now.toISOString().split('T')[0];

  const [destination, setDestination] = useState('');
  const [tripDate, setTripDate] = useState(defaultDate);
  const [departTime, setDepartTime] = useState(defaultDepart);
  const [arriveTime, setArriveTime] = useState(defaultArrive);
  const [reminderMin, setReminderMin] = useState(15);
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    if (!destination.trim()) return;
    setConfirmed(true);
    setTimeout(() => {
      onConfirm(`⏰ ${t('reminderSet')} — ${departTime} → ${destination}`);
    }, 800);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }} onClick={onClose}>
      <div style={{
        background: 'white', borderRadius: '24px 24px 0 0',
        width: '100%', maxWidth: 480, padding: '0 0 32px',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.25)',
        animation: 'slideUp 0.25s ease',
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg,#3B82F6,#1E1B6B)', borderRadius: '24px 24px 0 0', padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Calendar size={22} color="white" />
            <span style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>{t('tripPlanning')}</span>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={16} color="white" />
          </button>
        </div>

        <div style={{ padding: '20px 20px 0' }}>

          {/* Date */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
              <Calendar size={12} style={{ display: 'inline', marginRight: 4 }} />{t('departure')} — date
            </label>
            <input
              type="date"
              value={tripDate}
              onChange={e => setTripDate(e.target.value)}
              min={defaultDate}
              style={{ width: '100%', border: '2px solid #E5E7EB', borderRadius: 12, padding: '11px 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box', background: 'white' }}
            />
          </div>

          {/* Destination */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
              <MapPin size={12} style={{ display: 'inline', marginRight: 4 }} />{t('arrival')}
            </label>
            <input
              value={destination}
              onChange={e => setDestination(e.target.value)}
              placeholder={t('searchPlaceholder')}
              style={{ width: '100%', border: '2px solid #E5E7EB', borderRadius: 12, padding: '11px 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
              onFocus={e => (e.target.style.borderColor = '#3B82F6')}
              onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
            />
          </div>

          {/* Time pickers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
                <Navigation size={12} style={{ display: 'inline', marginRight: 4 }} />{t('departure')}
              </label>
              <input
                type="time"
                value={departTime}
                onChange={e => setDepartTime(e.target.value)}
                style={{ width: '100%', border: '2px solid #E5E7EB', borderRadius: 12, padding: '11px 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box', background: 'white' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
                <Clock size={12} style={{ display: 'inline', marginRight: 4 }} />{t('arrival')}
              </label>
              <input
                type="time"
                value={arriveTime}
                onChange={e => setArriveTime(e.target.value)}
                style={{ width: '100%', border: '2px solid #E5E7EB', borderRadius: 12, padding: '11px 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box', background: 'white' }}
              />
            </div>
          </div>

          {/* Reminder */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
              <Bell size={12} style={{ display: 'inline', marginRight: 4 }} />{t('departureReminder')}
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[5, 10, 15, 30, 60].map(min => (
                <button
                  key={min}
                  onClick={() => setReminderMin(min)}
                  style={{
                    padding: '7px 12px', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none',
                    background: reminderMin === min ? '#2563EB' : '#F3F4F6',
                    color: reminderMin === min ? 'white' : '#374151',
                    transition: 'all 0.15s',
                  }}
                >
                  {min}&apos;
                </button>
              ))}
            </div>
          </div>

          {/* Confirm button */}
          <button
            onClick={handleConfirm}
            disabled={!destination.trim() || confirmed}
            style={{
              width: '100%', padding: '14px', borderRadius: 14, border: 'none',
              background: confirmed ? '#10B981' : destination.trim() ? '#2563EB' : '#D1D5DB',
              color: 'white', fontWeight: 700, fontSize: 15, cursor: destination.trim() ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {confirmed ? '✓ ' + t('reminderSet') : <><Bell size={16} /> {t('planTrip')} — {departTime}</>}
          </button>
        </div>
      </div>
      <style>{`@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
    </div>
  );
}
