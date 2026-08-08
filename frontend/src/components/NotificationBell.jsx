import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, Trash2, X, AlertCircle } from 'lucide-react';
import { io } from 'socket.io-client';

export default function NotificationBell({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('ALL'); // 'ALL' or 'UNREAD'
  const [toastAlert, setToastAlert] = useState(null);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/notifications?user_id=${userId}`);
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (e) {
      console.error('Failed to fetch notifications:', e);
    }
  };

  useEffect(() => {
    fetchNotifications();

    if (!userId) return;

    // Connect to Socket.io for live WebSocket broadcasts
    const socket = io(window.location.origin, {
      transports: ['websocket', 'polling']
    });

    socket.emit('join_user_room', userId);

    socket.on('user_notification', (newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((count) => count + 1);

      // Show live toast notification pop-up
      setToastAlert(newNotif);
      setTimeout(() => {
        setToastAlert(null);
      }, 5000);
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      const res = await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
      const data = await res.json();
      if (data.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!userId) return;
    try {
      const res = await fetch('/api/notifications/read-all', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      });
      const data = await res.json();
      if (data.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredNotifications = notifications.filter((n) =>
    filter === 'UNREAD' ? !n.is_read : true
  );

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      {/* Toast Alert Popup */}
      {toastAlert && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: 'linear-gradient(135deg, #111827, #1f2937)',
            border: '2px solid #10b981',
            borderRadius: '16px',
            padding: '16px 20px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            maxWidth: '380px',
            animation: 'fadeIn 0.3s ease-out'
          }}
        >
          <div style={{ fontSize: '1.4rem' }}>🔔</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, color: '#fff', fontSize: '0.95rem' }}>
              {toastAlert.title}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: '1.4' }}>
              {toastAlert.message}
            </div>
          </div>
          <button
            onClick={() => setToastAlert(null)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'relative',
          padding: '8px 12px',
          borderRadius: '10px',
          border: '1px solid var(--border-color)',
          background: isOpen ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
          color: isOpen ? '#10b981' : '#fff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
        title="Notifications & Alerts"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: '#ef4444',
              color: '#fff',
              fontSize: '0.65rem',
              fontWeight: 900,
              borderRadius: '50%',
              minWidth: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2px'
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Drawer Popover */}
      {isOpen && (
        <div
          className="glass-panel"
          style={{
            position: 'absolute',
            right: 0,
            top: '48px',
            width: '360px',
            maxHeight: '480px',
            borderRadius: '16px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 10px 10px -5px rgba(0, 0, 0, 0.5)',
            border: '1px solid var(--border-color)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 16px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              justify: 'space-between',
              alignItems: 'center',
              background: 'rgba(0,0,0,0.3)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 800, color: '#fff', fontSize: '1rem' }}>Notifications</span>
              {unreadCount > 0 && (
                <span className="badge" style={{ background: '#10b981', color: '#000', fontSize: '0.7rem', fontWeight: 900 }}>
                  {unreadCount} New
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#10b981',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '6px', padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            {['ALL', 'UNREAD'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '4px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: filter === f ? '#10b981' : 'transparent',
                  color: filter === f ? '#000' : 'var(--text-muted)',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Notification Items List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
            {filteredNotifications.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No notifications to display.
              </div>
            ) : (
              filteredNotifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.is_read && handleMarkAsRead(n.id)}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    marginBottom: '6px',
                    background: n.is_read ? 'rgba(255,255,255,0.02)' : 'rgba(16, 185, 129, 0.1)',
                    border: n.is_read ? '1px solid transparent' : '1px solid rgba(16, 185, 129, 0.3)',
                    cursor: n.is_read ? 'default' : 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 800, color: '#fff', fontSize: '0.85rem' }}>{n.title}</span>
                    {!n.is_read && (
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                    )}
                  </div>

                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.4' }}>
                    {n.message}
                  </p>

                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: '6px', textAlign: 'right' }}>
                    {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
