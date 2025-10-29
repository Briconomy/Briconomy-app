import { ReactNode } from 'react';

export interface ActionCardProps {
  to?: string;
  icon: string | ReactNode;
  title: string;
  description?: string;
  onClick?: () => void;
}

function ActionCard({ to = '#', icon, title, description = '', onClick }: Readonly<ActionCardProps>) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  const renderIcon = () => {
    if (typeof icon === 'string') {
      return icon;
    }
    return icon;
  };

  return (
    <a href={to} className="action-card" onClick={handleClick}>
      <div className="action-icon">{renderIcon()}</div>
      <div className="action-title">{title}</div>
      <div className="action-desc">{description}</div>
    </a>
  );
}

export default ActionCard;