import React from 'react';
import { Link } from 'react-router-dom';

interface ActionCardProps {
  to: string;
  icon: string;
  title: string;
  description: string;
}

function ActionCard({ to, icon, title, description }: ActionCardProps) {
  return (
    <Link to={to} className="action-card">
      <div className="action-icon">{icon}</div>
      <div className="action-title">{title}</div>
      <div className="action-desc">{description}</div>
    </Link>
  );
}

export default ActionCard;