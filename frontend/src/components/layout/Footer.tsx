import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-ink text-newsprint-100 border-t-2 border-double border-ink">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About */}
          <div>
            <h4 className="font-bold font-serif text-base mb-4 text-white">About</h4>
            <p className="text-sm leading-relaxed text-newsprint-100/80">
              Digital Heritage Archive preserving Dr. B.R. Ambedkar's institutional contributions, speeches, writings, and constitutional debates.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold font-serif text-base mb-4 text-white">Resources</h4>
            <ul className="space-y-2 text-sm text-newsprint-100/80">
              <li>
                <Link to="/about" className="hover:underline hover:text-white">
                  Documentation & Provenance
                </Link>
              </li>
              <li>
                <Link to="/research" className="hover:underline hover:text-white">
                  Research Guide & AI Assistant
                </Link>
              </li>
              <li>
                <Link to="/system-status" className="hover:underline hover:text-white">
                  Registry Status & Subsystems
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:underline hover:text-white">
                  Archivist & Curator Desk
                </Link>
              </li>
            </ul>
          </div>

          {/* Meta */}
          <div>
            <h4 className="font-bold font-serif text-base mb-4 text-white">Standards</h4>
            <p className="text-xs font-mono text-newsprint-100/70 leading-relaxed">
              Dublin Core Metadata (ISO 15836)<br />
              OAIS Reference Model (ISO 14721)<br />
              SHA-256 Checksum Verified
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t-1 border-newsprint-100/20 pt-6">
          <p className="text-xs font-mono text-newsprint-100/70 text-center">
            © 2026 Digital Heritage Archive. All records in public domain.
          </p>
        </div>
      </div>
    </footer>
  );
};
