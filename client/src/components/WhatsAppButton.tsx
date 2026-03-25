import { MessageCircle, X } from "lucide-react";
import { useState } from "react";
import { CONTACT_LINKS } from "@shared/contact";

export default function WhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false);

  const handleWhatsAppClick = () => {
    window.open(CONTACT_LINKS.whatsapp, "_blank");
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
        {/* Menu Items - Show when open */}
        {isOpen && (
          <div className="animate-in fade-in slide-in-from-bottom-2 space-y-2">
            <div className="bg-white dark:bg-card rounded-full shadow-lg p-4 hover:shadow-xl transition-shadow cursor-pointer group"
              onClick={handleWhatsAppClick}
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-foreground whitespace-nowrap group-hover:text-primary transition-colors">
                  Chat on WhatsApp
                </span>
                <MessageCircle className="w-5 h-5 text-[#25D366]" />
              </div>
            </div>
          </div>
        )}

        {/* Main Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group ${
            isOpen
              ? "bg-red-500 hover:bg-red-600"
              : "bg-[#25D366] hover:bg-[#20ba58]"
          }`}
          title={isOpen ? "Close menu" : "Chat with us on WhatsApp"}
          aria-label="WhatsApp chat button"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white animate-rotate-in" />
          ) : (
            <MessageCircle className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
          )}
        </button>
      </div>

      {/* Mobile-optimized version */}
      <div className="fixed bottom-6 right-6 z-40 md:hidden">
        <button
          onClick={handleWhatsAppClick}
          className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20ba58] shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
          title="Chat with us on WhatsApp"
          aria-label="WhatsApp chat button"
        >
          <MessageCircle className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </>
  );
}
