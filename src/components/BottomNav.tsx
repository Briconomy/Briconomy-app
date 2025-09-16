import { Link, useLocation } from 'react-router-dom';
import React from 'react';

interface NavItem {
  path: string;
  label: string;
}

interface BottomNavProps {
  items: NavItem[];
  responsive?: boolean;
}

function BottomNav({ items, responsive = false }: BottomNavProps) {
  const location = useLocation();

  return (
    <div className={`bottom-nav ${responsive ? 'responsive' : 'mobile-only'}`}>
      {items.map((item, index) => {
        const isActive = location.pathname === item.path;

        return (
          <Link 
            key={index}
            to={item.path} 
            className={`nav-item ${isActive ? 'active' : ''}`}
          >
            <div className="nav-icon"></div>
            <div className="nav-label">{item.label}</div>
          </Link>
        );
      })}
    </div>
  );
}

export default BottomNav;
