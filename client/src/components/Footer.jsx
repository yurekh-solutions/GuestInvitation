import { Link } from 'react-router-dom';
import logoMark from '../assets/logo-mark.png';

const Footer = () => {
  return (
    <footer className="bg-[#fdf8f0] border-t border-[#e8dcc4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Logo + Brand */}
          <Link to="/" className="flex items-center gap-2 group">
            <img
              src={logoMark}
              alt="GuestInvitation"
              className="h-8 w-auto object-contain group-hover:scale-105 transition-transform"
            />
            <span className="font-display text-lg text-[#800020] font-semibold">GuestInvitation</span>
          </Link>

          {/* Copyright + studio credit */}
          <div className="flex flex-col items-center sm:items-end gap-1 text-center">
            <p className="text-xs text-gray-500">
              &copy; {new Date().getFullYear()} GuestInvitation. Digital invites for every occasion.
            </p>
            <p className="text-xs text-gray-500">
              Designed &amp; developed by{' '}
              <a
                href="https://yurekh.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#800020] hover:text-[#B8860B] underline decoration-[#B8860B]/40 underline-offset-2 transition-colors"
              >
                Yurekh Solutions
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
