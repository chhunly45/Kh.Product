import { Phone, MessageCircle, Copy, MessageSquare, ArrowUpRight } from 'lucide-react';
import { useState } from 'react';

interface SellerContactCardProps {
  sellerName?: string;
  sellerPhone?: string;
  sellerEmail?: string;
  telegramHandle?: string;
}

const SellerContactCard = ({ sellerName, sellerPhone, sellerEmail, telegramHandle }: SellerContactCardProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopyPhone = () => {
    if (sellerPhone) {
      navigator.clipboard.writeText(sellerPhone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const whatsappLink = sellerPhone ? `https://wa.me/${sellerPhone.replace(/^\+/, '').replace(/[^0-9]/g, '')}` : null;
  const telegramLink = telegramHandle ? `https://t.me/${telegramHandle.replace('@', '')}` : null;

  return (
    <div className="rounded-3xl bg-gradient-to-br from-primary/10 to-background p-6 border border-primary/30 shadow-sm">
      <h3 className="text-sm font-semibold text-text-primary mb-3">Contact seller</h3>
      <p className="text-sm text-text-secondary mb-4">Choose the best way to reach the seller securely.</p>
      <div className="space-y-3">
        {sellerPhone && (
          <div className="grid gap-3 sm:grid-cols-2">
            <a 
              href={`tel:${sellerPhone}`}
              className="min-w-0 w-full inline-flex items-center justify-center gap-2 rounded-3xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-hover transition"
            >
              <Phone className="w-4 h-4" />
              <span>Call</span>
            </a>
            <button
              type="button"
              onClick={handleCopyPhone}
              className={`min-w-0 w-full inline-flex items-center justify-center gap-2 rounded-3xl px-4 py-3 text-sm font-semibold transition ${
                copied
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-white border border-muted text-text-secondary hover:bg-background'
              }`}
            >
              <Copy className="w-4 h-4" />
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sellerEmail && (
            <a 
              href={`mailto:${sellerEmail}`}
              className="min-w-0 w-full inline-flex items-center justify-center gap-1 rounded-3xl bg-text-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-hover transition"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Email</span>
            </a>
          )}
          
          {whatsappLink && (
            <a 
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="min-w-0 w-full inline-flex items-center justify-center gap-1 rounded-3xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          )}
          
          {telegramLink && (
            <a 
              href={telegramLink}
              target="_blank"
              rel="noreferrer"
              className="min-w-0 w-full inline-flex items-center justify-center gap-1 rounded-3xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-hover transition"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Telegram</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerContactCard;

