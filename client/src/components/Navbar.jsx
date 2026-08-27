import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import logoMark from '../assets/logo-mark.png';

const Navbar = () => {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-white/40 shadow-[0_4px_30px_rgba(128,0,32,0.08)]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo + Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <img
                src={logoMark}
                alt="GuestInvitation"
                className="h-9 w-auto object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <span className="hidden sm:block font-display text-xl md:text-2xl tracking-tight text-[#800020] font-semibold">
              GuestInvitation
            </span>
          </Link>

          {/* Center tagline on desktop */}
          <div className="hidden lg:block">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500 font-medium">
              Digital Invites for Every Occasion
            </p>
          </div>

          {/* Nav Links */}
          <div className="flex items-center gap-4 md:gap-6">
           
            <a
              href="#templates"
              className="hidden sm:inline-flex items-center px-4 py-2 rounded-full text-xs md:text-sm font-medium bg-[#800020] text-white hover:bg-[#6a0018] transition-all shadow-md hover:shadow-lg"
            >
              Create Invite
            </a>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
