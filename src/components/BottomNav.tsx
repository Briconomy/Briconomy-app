import React from 'react';
import { Link } from 'react-router-dom';

interface NavItem {
  path: string;
  label: string;
  active?: boolean;
}

interface BottomNavProps {
  items: NavItem[];
  responsive?: boolean;
}

function BottomNav({ items, responsive = false }: BottomNavProps) {
  return (
    <div className={`bottom-nav ${responsive ? 'responsive' : 'mobile-only'}`}>
      {items.map((item, index) => (
        <Link 
          key={index}
          to={item.path} 
          className={`nav-item ${item.active ? 'active' : ''}`}
        >
          <div className="nav-icon"></div>
          <div className="nav-label">{item.label}</div>
        </Link>
      ))}
    </div>
  );
}

export default BottomNav;