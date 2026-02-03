import React, { useState } from 'react';
import { X, User, Mail, Phone, CheckCircle } from 'lucide-react';
import { pionierService } from '../lib/supabase';

interface QuickSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QuickSignupModal: React.FC<QuickSignupModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone) {
      setError('Bitte füllen Sie alle Felder aus.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await pionierService.create({
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      });
      
      setIsSubmitted(true);
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('Fehler beim Senden. Bitte versuchen Sie es erneut.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', email: '', phone: '' });
    setIsSubmitted(false);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl max-w-md w-full border border-gray-700 relative">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8">
          {!isSubmitted ? (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Bewirb dich jetzt für die
                </h2>
                <h3 className="text-xl font-bold" style={{ color: '#C6A667' }}>
                  Inner Circle Pioniergruppe von Isi
                </h3>
                <p className="text-gray-400 mt-4">
                  Sichere dir deinen Platz in der exklusiven Pioniergruppe
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Vollständiger Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-colors"
                      placeholder="Dein vollständiger Name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    E-Mail Adresse *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-colors"
                      placeholder="deineemail@beispiel.de"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Telefonnummer *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-colors"
                      placeholder="+49 123 456 789"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 font-bold rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  style={{ backgroundColor: '#C6A667', color: 'black' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#B8A76B'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#C6A667'}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                      Wird gesendet...
                    </div>
                  ) : (
                    'Jetzt bewerben'
                  )}
                </button>
              </form>

              <p className="text-xs text-gray-400 text-center mt-4">
                Deine Daten werden vertraulich behandelt und nur für die Bewerbung verwendet.
              </p>
            </>
          ) : (
            /* Success state */
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-green-400 mb-4">
                Bewerbung erfolgreich!
              </h2>
              <p className="text-gray-300 mb-6">
                Vielen Dank für deine Bewerbung zur Inner Circle Pioniergruppe. 
                Wir werden uns in Kürze bei dir melden.
              </p>
              <button
                onClick={handleClose}
                className="px-6 py-3 font-bold rounded-lg transition-all"
                style={{ backgroundColor: '#C6A667', color: 'black' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#B8A76B'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#C6A667'}
              >
                Schließen
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickSignupModal;