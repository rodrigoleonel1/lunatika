import { Instagram, Phone } from "lucide-react";
import React from "react";

export default function Footer() {
  return (
    <footer className="bg-neutral-950 text-white text-center">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">Sobre nosotros</h3>
            <p className="text-gray-400">
              Venta minorista de aritos, pulseras, anillos y cadenas.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Contacto</h3>
            <div className="flex justify-center gap-6">
              <a
                href="https://www.instagram.com/lunatika.ac/"
                className="text-gray-400 hover:text-white flex gap-1"
                target="_blank"
              >
                <Instagram size={20}/>
                Instagram
              </a>
              <a
                href="https://api.whatsapp.com/message/IUMJKR6AO5P3K1?autoload=1&app_absent=0"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white flex gap-1"
              >
                {" "}
                <Phone size={20}/> Whatsapp
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800  text-gray-400">
          <p>&copy; 2024 Lunatika. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
