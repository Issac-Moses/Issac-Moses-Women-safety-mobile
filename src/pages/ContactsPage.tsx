import React, { useState } from 'react';
import { Plus, Phone, Trash2, UserPlus, Shield, Users, X, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

interface FakeContact {
  id: string;
  name: string;
  phone: string;
  category: string;
}

const ContactsPage: React.FC = () => {
  const { user, addEmergencyContact, removeEmergencyContact } = useAuth();
  const { isDark } = useTheme();

  const [showAddForm, setShowAddForm] = useState(false);
  const [showFakeForm, setShowFakeForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', relationship: '' });
  const [fakeFormData, setFakeFormData] = useState({ name: '', phone: '', category: '' });
  const [notification, setNotification] = useState('');

  const [fakeContacts, setFakeContacts] = useState<FakeContact[]>([
    { id: '1', name: 'John Doe', phone: '+1 (555) 123-4567', category: 'Friend' },
    { id: '2', name: 'Jane Smith', phone: '+1 (555) 987-6543', category: 'Colleague' }
  ]);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.phone && formData.relationship) {
      addEmergencyContact(formData);
      setFormData({ name: '', phone: '', relationship: '' });
      setShowAddForm(false);
      showNotification('Emergency contact added successfully!');
    }
  };

  const handleAddFakeContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (fakeFormData.name && fakeFormData.phone && fakeFormData.category) {
      const newContact: FakeContact = {
        id: Date.now().toString(),
        ...fakeFormData
      };
      setFakeContacts(prev => [...prev, newContact]);
      setFakeFormData({ name: '', phone: '', category: '' });
      setShowFakeForm(false);
      showNotification('Fake contact added successfully!');
    }
  };

  const removeFakeContact = (id: string) => {
    setFakeContacts(prev => prev.filter(contact => contact.id !== id));
    showNotification('Fake contact removed');
  };

  const handleRemoveEmergency = (id: string) => {
    removeEmergencyContact(id);
    showNotification('Emergency contact removed');
  };

  const relationshipColors = {
    'Mother': 'from-pink-500 to-rose-500',
    'Father': 'from-blue-500 to-cyan-500',
    'Spouse': 'from-purple-500 to-pink-500',
    'Sibling': 'from-green-500 to-teal-500',
    'Friend': 'from-yellow-500 to-orange-500',
    'Emergency Services': 'from-red-500 to-pink-500'
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-rose-50 via-purple-50 to-blue-50'} pb-24 transition-all duration-500`}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-rose-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

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
        {/* Header Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`backdrop-blur-xl ${
            isDark ? 'bg-gray-800/80' : 'bg-white/80'
          } border border-white/20 rounded-2xl p-4 shadow-xl`}>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {user?.emergencyContacts?.length || 0}
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Emergency</p>
              </div>
            </div>
          </div>

          <div className={`backdrop-blur-xl ${
            isDark ? 'bg-gray-800/80' : 'bg-white/80'
          } border border-white/20 rounded-2xl p-4 shadow-xl`}>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {fakeContacts.length}
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Fake Contacts</p>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className={`backdrop-blur-xl ${
          isDark ? 'bg-gray-800/80' : 'bg-white/80'
        } border border-white/20 rounded-3xl p-6 shadow-2xl`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} flex items-center`}>
                <Shield className="w-6 h-6 mr-2 text-red-500" />
                Emergency Contacts
              </h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                Trusted people for emergencies
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="group relative overflow-hidden flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl transition-all duration-300 shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 active:scale-95 font-semibold"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span>Add</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
            </button>
          </div>

          <div className="space-y-3">
            {user?.emergencyContacts?.length ? (
              user.emergencyContacts.map((contact) => (
                <div
                  key={contact.id}
                  className={`group relative overflow-hidden flex items-center justify-between p-4 ${
                    isDark ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
                  } rounded-2xl transition-all duration-300 hover:scale-[1.02]`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`relative w-12 h-12 bg-gradient-to-br ${
                      relationshipColors[contact.relationship as keyof typeof relationshipColors] || 'from-gray-500 to-gray-600'
                    } rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <span className="text-white font-bold text-lg">
                        {contact.name?.charAt(0) || '?'}
                      </span>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                      <h4 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'} text-lg`}>
                        {contact.name}
                      </h4>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {contact.relationship} • {contact.phone}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => window.open(`tel:${contact.phone}`)}
                      className="group/btn relative overflow-hidden p-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl transition-all duration-300 hover:scale-110 shadow-lg shadow-green-500/30"
                      title={`Call ${contact.name}`}
                    >
                      <Phone className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleRemoveEmergency(contact.id)}
                      className="group/btn relative overflow-hidden p-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl transition-all duration-300 hover:scale-110 shadow-lg shadow-red-500/30"
                      title={`Remove ${contact.name}`}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <div className="w-20 h-20 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="w-10 h-10 opacity-50" />
                </div>
                <p className="font-semibold mb-1">No emergency contacts yet</p>
                <p className="text-sm">Add trusted contacts for quick emergency access</p>
              </div>
            )}
          </div>
        </div>

        {/* Fake Contacts */}
        <div className={`backdrop-blur-xl ${
          isDark ? 'bg-gray-800/80' : 'bg-white/80'
        } border border-white/20 rounded-3xl p-6 shadow-2xl`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} flex items-center`}>
                <Users className="w-6 h-6 mr-2 text-purple-500" />
                Fake Contacts
              </h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                For privacy in uncomfortable situations
              </p>
            </div>
            <button
              onClick={() => setShowFakeForm(true)}
              className="group relative overflow-hidden flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 active:scale-95 font-semibold"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span>Add</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
            </button>
          </div>

          <div className="space-y-3">
            {fakeContacts.map((contact) => (
              <div
                key={contact.id}
                className={`group relative overflow-hidden flex items-center justify-between p-4 ${
                  isDark ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
                } rounded-2xl transition-all duration-300 hover:scale-[1.02]`}
              >
                <div className="flex items-center space-x-4">
                  <div className="relative w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white font-bold text-lg">
                      {contact.name?.charAt(0) || '?'}
                    </span>
                  </div>
                  <div>
                    <h4 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'} text-lg`}>
                      {contact.name}
                    </h4>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {contact.category} • {contact.phone}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFakeContact(contact.id)}
                  className="group/btn relative overflow-hidden p-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl transition-all duration-300 hover:scale-110 shadow-lg shadow-red-500/30"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Emergency Contact Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className={`backdrop-blur-xl ${
            isDark ? 'bg-gray-800/95' : 'bg-white/95'
          } border border-white/20 rounded-3xl p-6 w-full max-w-md shadow-2xl animate-scaleIn`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} flex items-center`}>
                <Shield className="w-6 h-6 mr-2 text-red-500" />
                Add Emergency Contact
              </h3>
              <button
                onClick={() => setShowAddForm(false)}
                className={`p-2 rounded-xl ${
                  isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                } transition-colors`}
              >
                <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
              </button>
            </div>

            <form onSubmit={handleAddContact} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full p-3 rounded-xl border ${
                    isDark ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all`}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full p-3 rounded-xl border ${
                    isDark ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all`}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Relationship
                </label>
                <select
                  value={formData.relationship}
                  onChange={e => setFormData({ ...formData, relationship: e.target.value })}
                  className={`w-full p-3 rounded-xl border ${
                    isDark ? 'bg-gray-700/50 border-gray-600 text-white' : 'bg-white border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all`}
                  required
                >
                  <option value="">Select relationship</option>
                  <option value="Mother">Mother</option>
                  <option value="Father">Father</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Friend">Friend</option>
                  <option value="Emergency Services">Emergency Services</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className={`flex-1 py-3 rounded-xl border ${
                    isDark ? 'border-gray-600 text-gray-400 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  } transition-all font-semibold`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl transition-all duration-300 hover:scale-105 shadow-lg shadow-red-500/30 font-semibold"
                >
                  Add Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Fake Contact Modal */}
      {showFakeForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className={`backdrop-blur-xl ${
            isDark ? 'bg-gray-800/95' : 'bg-white/95'
          } border border-white/20 rounded-3xl p-6 w-full max-w-md shadow-2xl animate-scaleIn`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} flex items-center`}>
                <Users className="w-6 h-6 mr-2 text-purple-500" />
                Add Fake Contact
              </h3>
              <button
                onClick={() => setShowFakeForm(false)}
                className={`p-2 rounded-xl ${
                  isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                } transition-colors`}
              >
                <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
              </button>
            </div>

            <form onSubmit={handleAddFakeContact} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Enter name"
                  value={fakeFormData.name}
                  onChange={e => setFakeFormData({ ...fakeFormData, name: e.target.value })}
                  className={`w-full p-3 rounded-xl border ${
                    isDark ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all`}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={fakeFormData.phone}
                  onChange={e => setFakeFormData({ ...fakeFormData, phone: e.target.value })}
                  className={`w-full p-3 rounded-xl border ${
                    isDark ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all`}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Category
                </label>
                <select
                  value={fakeFormData.category}
                  onChange={e => setFakeFormData({ ...fakeFormData, category: e.target.value })}
                  className={`w-full p-3 rounded-xl border ${
                    isDark ? 'bg-gray-700/50 border-gray-600 text-white' : 'bg-white border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all`}
                  required
                >
                  <option value="">Select category</option>
                  <option value="Friend">Friend</option>
                  <option value="Colleague">Colleague</option>
                  <option value="Family">Family</option>
                  <option value="Business">Business</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowFakeForm(false)}
                  className={`flex-1 py-3 rounded-xl border ${
                    isDark ? 'border-gray-600 text-gray-400 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  } transition-all font-semibold`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-xl transition-all duration-300 hover:scale-105 shadow-lg shadow-purple-500/30 font-semibold"
                >
                  Add Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ContactsPage;