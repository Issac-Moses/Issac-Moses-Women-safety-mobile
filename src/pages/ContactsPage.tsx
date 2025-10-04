import React, { useState, useEffect } from 'react';
import { Phone, UserPlus, Trash, Shield, UserX, PhoneCall, CheckCircle, Send, Users, FileText, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface Contact {
  id: number;
  name: string;
  phone: string;
  type: 'emergency' | 'fake';
  priority?: number;
  group?: string;
  lastAlerted?: number;
}

interface ContactGroup {
  id: string;
  name: string;
  color: string;
}

interface AlertLog {
  contactId: number;
  contactName: string;
  timestamp: number;
  type: string;
}

const ContactsPage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { isDark } = useTheme();

  const [contacts, setContacts] = useState<Contact[]>(user?.contacts || []);
  const [newContact, setNewContact] = useState({ 
    name: '', 
    phone: '', 
    type: 'emergency' as 'emergency' | 'fake',
    group: 'default'
  });
  const [groups, setGroups] = useState<ContactGroup[]>([
    { id: 'default', name: 'Default', color: 'purple' },
    { id: 'family', name: 'Family', color: 'blue' },
    { id: 'friends', name: 'Friends', color: 'green' },
    { id: 'colleagues', name: 'Colleagues', color: 'orange' }
  ]);
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [alertLogs, setAlertLogs] = useState<AlertLog[]>([]);
  const [notification, setNotification] = useState('');
  const [draggedContact, setDraggedContact] = useState<number | null>(null);

  useEffect(() => {
    // Load alert logs from memory
    const logs = JSON.parse(sessionStorage.getItem('alertLogs') || '[]');
    setAlertLogs(logs);
  }, []);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleAddContact = () => {
    if (newContact.name.trim() && newContact.phone.trim()) {
      const updated = [...contacts, { 
        id: Date.now(), 
        ...newContact,
        priority: contacts.length + 1
      }];
      setContacts(updated);
      updateProfile({ contacts: updated });
      setNewContact({ name: '', phone: '', type: 'emergency', group: 'default' });
      showNotification('Contact added successfully!');
    }
  };

  const handleDeleteContact = (id: number) => {
    const updated = contacts.filter(c => c.id !== id);
    setContacts(updated);
    updateProfile({ contacts: updated });
    showNotification('Contact deleted');
  };

  const handleQuickCall = (phone: string, name: string, id: number) => {
    window.location.href = `tel:${phone}`;
    logAlert(id, name, 'Quick Call');
    showNotification(`Calling ${name}...`);
  };

  const handleTestAlert = (contact: Contact) => {
    const message = `This is a TEST alert from ${user?.name || 'User'}. Please ignore this message. Testing emergency contact system.`;
    const smsUrl = `sms:${contact.phone}?body=${encodeURIComponent(message)}`;
    window.location.href = smsUrl;
    logAlert(contact.id, contact.name, 'Test Alert');
    
    const updated = contacts.map(c => 
      c.id === contact.id ? { ...c, lastAlerted: Date.now() } : c
    );
    setContacts(updated);
    updateProfile({ contacts: updated });
    showNotification(`Test alert sent to ${contact.name}`);
  };

  const handleSendToGroup = (groupId: string) => {
    const groupContacts = contacts.filter(c => c.group === groupId && c.type === 'emergency');
    if (groupContacts.length === 0) {
      showNotification('No contacts in this group');
      return;
    }

    const message = `Emergency alert from ${user?.name || 'User'}. This is a group notification.`;
    groupContacts.forEach(contact => {
      const smsUrl = `sms:${contact.phone}?body=${encodeURIComponent(message)}`;
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = smsUrl;
      document.body.appendChild(iframe);
      setTimeout(() => document.body.removeChild(iframe), 1000);
      logAlert(contact.id, contact.name, 'Group Alert');
    });

    showNotification(`Alert sent to ${groupContacts.length} contacts in group`);
  };

  const logAlert = (contactId: number, contactName: string, type: string) => {
    const log = { contactId, contactName, timestamp: Date.now(), type };
    const updated = [...alertLogs, log];
    setAlertLogs(updated);
    sessionStorage.setItem('alertLogs', JSON.stringify(updated));
  };

  const handleDragStart = (id: number) => {
    setDraggedContact(id);
  };

  const handleDragOver = (e: React.DragEvent, id: number) => {
    e.preventDefault();
    if (draggedContact === null || draggedContact === id) return;

    const draggedIdx = contacts.findIndex(c => c.id === draggedContact);
    const targetIdx = contacts.findIndex(c => c.id === id);

    const updated = [...contacts];
    const [draggedItem] = updated.splice(draggedIdx, 1);
    updated.splice(targetIdx, 0, draggedItem);

    // Update priorities
    const withPriority = updated.map((c, idx) => ({ ...c, priority: idx + 1 }));
    setContacts(withPriority);
    updateProfile({ contacts: withPriority });
  };

  const handleDragEnd = () => {
    setDraggedContact(null);
  };

  const importFromDevice = async () => {
    if ('contacts' in navigator && 'ContactsManager' in window) {
      try {
        const props = ['name', 'tel'];
        const opts = { multiple: true };
        const deviceContacts = await (navigator as any).contacts.select(props, opts);
        
        const imported = deviceContacts.map((c: any, idx: number) => ({
          id: Date.now() + idx,
          name: c.name?.[0] || 'Unknown',
          phone: c.tel?.[0] || '',
          type: 'emergency' as const,
          priority: contacts.length + idx + 1,
          group: 'default'
        }));

        const updated = [...contacts, ...imported];
        setContacts(updated);
        updateProfile({ contacts: updated });
        showNotification(`Imported ${imported.length} contacts`);
      } catch (err) {
        showNotification('Contact import not supported on this device');
      }
    } else {
      showNotification('Contact import not supported on this browser');
    }
  };

  const emergencyContacts = contacts
    .filter(c => c.type === 'emergency')
    .filter(c => selectedGroup === 'all' || c.group === selectedGroup)
    .sort((a, b) => (a.priority || 0) - (b.priority || 0));

  const fakeContacts = contacts.filter(c => c.type === 'fake');

  const getTimeSinceAlert = (timestamp?: number) => {
    if (!timestamp) return 'Never';
    const minutes = Math.floor((Date.now() - timestamp) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getGroupColor = (groupId?: string) => {
    const group = groups.find(g => g.id === groupId);
    return group?.color || 'purple';
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50'} pb-24 transition-all duration-500`}>
      {/* Animated Background */}
      {!isDark && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 backdrop-blur-xl bg-green-500/90 text-white rounded-2xl px-4 py-3 shadow-2xl animate-slideInRight">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">{notification}</span>
          </div>
        </div>
      )}

      <div className="relative z-10 p-4 space-y-6">
        {/* Stats Card */}
        <div className={`backdrop-blur-xl ${
          isDark ? 'bg-gray-800/90 border-gray-700' : 'bg-white/80 border-white/20'
        } border rounded-2xl p-4 shadow-lg`}>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">{emergencyContacts.length}</div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Emergency</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{fakeContacts.length}</div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Fake Calls</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{alertLogs.length}</div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Alerts Sent</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={importFromDevice}
            className={`flex items-center justify-center p-3 rounded-xl ${
              isDark ? 'bg-gray-800/90 hover:bg-gray-700' : 'bg-white/80 hover:bg-white'
            } border ${isDark ? 'border-gray-700' : 'border-white/20'} shadow-lg transition-all hover:scale-105`}
          >
            <Users className="w-5 h-5 mr-2 text-blue-500" />
            <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Import</span>
          </button>
          <button
            onClick={() => handleSendToGroup('default')}
            className={`flex items-center justify-center p-3 rounded-xl ${
              isDark ? 'bg-gray-800/90 hover:bg-gray-700' : 'bg-white/80 hover:bg-white'
            } border ${isDark ? 'border-gray-700' : 'border-white/20'} shadow-lg transition-all hover:scale-105`}
          >
            <Send className="w-5 h-5 mr-2 text-green-500" />
            <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Alert All</span>
          </button>
        </div>

        {/* Group Filter */}
        <div className={`backdrop-blur-xl ${
          isDark ? 'bg-gray-800/90 border-gray-700' : 'bg-white/80 border-white/20'
        } border rounded-2xl p-4 shadow-lg`}>
          <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Filter by Group</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedGroup('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedGroup === 'all'
                  ? 'bg-purple-500 text-white shadow-lg'
                  : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
              }`}
            >
              All
            </button>
            {groups.map(group => (
              <button
                key={group.id}
                onClick={() => setSelectedGroup(group.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedGroup === group.id
                    ? `bg-${group.color}-500 text-white shadow-lg`
                    : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {group.name}
              </button>
            ))}
          </div>
        </div>

        {/* Add Contact Form */}
        <div className={`backdrop-blur-xl ${
          isDark ? 'bg-gray-800/90 border-gray-700' : 'bg-white/80 border-white/20'
        } border rounded-2xl p-4 shadow-lg`}>
          <h2 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Add Contact</h2>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Name"
              value={newContact.name}
              onChange={e => setNewContact({ ...newContact, name: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
            />
            <input
              type="tel"
              placeholder="Phone"
              value={newContact.phone}
              onChange={e => setNewContact({ ...newContact, phone: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={newContact.type}
                onChange={e => setNewContact({ ...newContact, type: e.target.value as 'emergency' | 'fake' })}
                className={`px-4 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
              >
                <option value="emergency">Emergency</option>
                <option value="fake">Fake Call</option>
              </select>
              <select
                value={newContact.group}
                onChange={e => setNewContact({ ...newContact, group: e.target.value })}
                className={`px-4 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
              >
                {groups.map(group => (
                  <option key={group.id} value={group.id}>{group.name}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleAddContact}
              className="w-full flex items-center justify-center py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-md hover:scale-[1.02] active:scale-95 transition-transform"
            >
              <UserPlus className="w-5 h-5 mr-2" /> Add Contact
            </button>
          </div>
        </div>

        {/* Emergency Contacts List */}
        <div className={`backdrop-blur-xl ${
          isDark ? 'bg-gray-800/90 border-gray-700' : 'bg-white/80 border-white/20'
        } border rounded-2xl p-4 shadow-lg`}>
          <h2 className={`text-lg font-bold mb-4 flex items-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Shield className="w-5 h-5 mr-2 text-green-500" />
            Emergency Contacts
            <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded-full">{emergencyContacts.length}</span>
          </h2>
          {emergencyContacts.length > 0 ? (
            <ul className="space-y-3">
              {emergencyContacts.map(c => (
                <li
                  key={c.id}
                  draggable
                  onDragStart={() => handleDragStart(c.id)}
                  onDragOver={(e) => handleDragOver(e, c.id)}
                  onDragEnd={handleDragEnd}
                  className={`p-4 rounded-xl bg-gradient-to-r from-red-500/10 to-pink-500/10 border ${
                    isDark ? 'border-red-500/20' : 'border-red-500/30'
                  } cursor-move transition-all hover:shadow-lg`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className={`${isDark ? 'text-white' : 'text-gray-900'} font-bold`}>{c.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full bg-${getGroupColor(c.group)}-500 text-white`}>
                          {groups.find(g => g.id === c.group)?.name}
                        </span>
                        {c.lastAlerted && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} font-mono`}>{c.phone}</p>
                      {c.lastAlerted && (
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} mt-1 flex items-center`}>
                          <Clock className="w-3 h-3 mr-1" />
                          Last alerted: {getTimeSinceAlert(c.lastAlerted)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleQuickCall(c.phone, c.name, c.id)}
                      className="flex items-center justify-center py-2 px-3 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-all"
                    >
                      <PhoneCall className="w-4 h-4 mr-1" />
                      Call
                    </button>
                    <button
                      onClick={() => handleTestAlert(c)}
                      className="flex items-center justify-center py-2 px-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-all"
                    >
                      <Send className="w-4 h-4 mr-1" />
                      Test
                    </button>
                    <button
                      onClick={() => handleDeleteContact(c.id)}
                      className="flex items-center justify-center py-2 px-3 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-all"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <Shield className="w-16 h-16 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No emergency contacts</p>
              <p className="text-sm">Add contacts to get started</p>
            </div>
          )}
        </div>

        {/* Fake Contacts List */}
        <div className={`backdrop-blur-xl ${
          isDark ? 'bg-gray-800/90 border-gray-700' : 'bg-white/80 border-white/20'
        } border rounded-2xl p-4 shadow-lg`}>
          <h2 className={`text-lg font-bold mb-4 flex items-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <UserX className="w-5 h-5 mr-2 text-purple-500" />
            Fake Contacts
          </h2>
          {fakeContacts.length > 0 ? (
            <ul className="space-y-3">
              {fakeContacts.map(c => (
                <li key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10">
                  <span className={`${isDark ? 'text-white' : 'text-gray-900'} font-medium`}>
                    {c.name} - {c.phone}
                  </span>
                  <button onClick={() => handleDeleteContact(c.id)} className="text-red-500 hover:text-red-700">
                    <Trash className="w-5 h-5" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm`}>No fake contacts added.</p>
          )}
        </div>

        {/* Alert History */}
        <div className={`backdrop-blur-xl ${
          isDark ? 'bg-gray-800/90 border-gray-700' : 'bg-white/80 border-white/20'
        } border rounded-2xl p-4 shadow-lg`}>
          <h2 className={`text-lg font-bold mb-4 flex items-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <FileText className="w-5 h-5 mr-2 text-orange-500" />
            Alert History
          </h2>
          {alertLogs.length > 0 ? (
            <ul className="space-y-2 max-h-64 overflow-y-auto">
              {alertLogs.slice(-10).reverse().map((log, idx) => (
                <li key={idx} className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{log.contactName}</p>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{log.type}</p>
                    </div>
                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No alerts sent yet</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .animate-slideInRight { animation: slideInRight 0.5s ease-out; }
      `}</style>
    </div>
  );
};

export default ContactsPage;