import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FaHome, 
  FaDesktop, 
  FaEye, 
  FaSlidersH, 
  FaSignOutAlt,
  FaMapMarkerAlt,
  FaBell
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ open, setOpen }) => {
  const { logout } = useAuth();

  const menuItems = [
    { path: '/dashboard', icon: FaHome, label: 'Dashboard' },
    { path: '/devices', icon: FaDesktop, label: 'Perangkat' },
    { path: '/monitoring', icon: FaEye, label: 'Monitoring' },
    { path: '/monitoring/location', icon: FaMapMarkerAlt, label: 'Lokasi' },
    { path: '/controls', icon: FaSlidersH, label: 'Kontrol' },
  ];

  return (
    <div className={`fixed left-0 top-0 h-full bg-gray-900 dark:bg-gray-950 text-white transition-all duration-300 z-50
      ${open ? 'w-64' : 'w-20'}`}>
      <div className="flex items-center justify-center h-16 border-b border-gray-700">
        <span className={`font-bold text-lg transition-all duration-300 ${!open && 'hidden'}`}>
          Device Monitor
        </span>
        {!open && <FaDesktop className="text-2xl" />}
      </div>

      <nav className="mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center px-4 py-3 mx-2 rounded-lg transition-colors
                ${isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }
              `}
            >
              <Icon className="text-xl" />
              <span className={`ml-3 transition-all duration-300 ${!open && 'hidden'}`}>
                {item.label}
              </span>
            </NavLink>
          );
        })}

        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-3 mx-2 mt-4 text-red-400 hover:bg-red-900 hover:text-red-200 rounded-lg transition-colors"
        >
          <FaSignOutAlt className="text-xl" />
          <span className={`ml-3 transition-all duration-300 ${!open && 'hidden'}`}>
            Logout
          </span>
        </button>
      </nav>

      <div className={`absolute bottom-4 left-0 right-0 text-center text-xs text-gray-500
        ${!open && 'hidden'}`}>
        <p>v1.0.0</p>
      </div>
    </div>
  );
};

export default Sidebar;
