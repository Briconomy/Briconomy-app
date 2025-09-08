import React from 'react';

export interface ActionCardProps {
  to?: string;
  icon: string;
  title: string;
  description: string;
  onClick?: () => void;
}

function ActionCard({ to = '#', icon, title, description, onClick }: ActionCardProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };
  return (
    <a href={to} className="action-card" onClick={handleClick}>
      <div className="action-icon">{icon}</div>
      <div className="action-title">{title}</div>
      <div className="action-desc">{description}</div>
    </a>
  );
}

export default ActionCard;