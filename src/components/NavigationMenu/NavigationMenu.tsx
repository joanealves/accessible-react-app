import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useA11y } from '../../contexts/A11yContext';
import './NavigationMenu.css';

interface MenuItem {
  id: string;
  label: string;
  href: string;
  children?: MenuItem[];
}

interface NavigationMenuProps {
  items: MenuItem[];
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

const NavigationMenu: React.FC<NavigationMenuProps> = ({
  items,
  orientation = 'horizontal',
  className = '',
}) => {
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const menuRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const location = useLocation();
  const { announce } = useA11y();

  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, items.length);
  }, [items.length]);

  const handleKeyDown = (event: React.KeyboardEvent, index: number, item: MenuItem) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (orientation === 'vertical') {
          focusNextItem();
        } else if (item.children && activeSubmenu === item.id) {
          focusFirstSubmenuItem(item.id);
        } else if (item.children) {
          openSubmenu(item.id);
        }
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        if (orientation === 'vertical') {
          focusPreviousItem();
        }
        break;
        
      case 'ArrowRight':
        event.preventDefault();
        if (orientation === 'horizontal') {
          focusNextItem();
        } else if (item.children) {
          openSubmenu(item.id);
        }
        break;
        
      case 'ArrowLeft':
        event.preventDefault();
        if (orientation === 'horizontal') {
          focusPreviousItem();
        } else if (activeSubmenu) {
          closeSubmenu();
        }
        break;
        
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (item.children) {
          toggleSubmenu(item.id);
        }
        break;
        
      case 'Escape':
        event.preventDefault();
        if (activeSubmenu) {
          closeSubmenu();
        }
        break;
        
      case 'Home':
        event.preventDefault();
        focusItem(0);
        break;
        
      case 'End':
        event.preventDefault();
        focusItem(items.length - 1);
        break;
    }
  };

  const focusNextItem = () => {
    const nextIndex = focusedIndex < items.length - 1 ? focusedIndex + 1 : 0;
    focusItem(nextIndex);
  };

  const focusPreviousItem = () => {
    const prevIndex = focusedIndex > 0 ? focusedIndex - 1 : items.length - 1;
    focusItem(prevIndex);
  };

  const focusItem = (index: number) => {
    setFocusedIndex(index);
    const item = itemRefs.current[index];
    const link = item?.querySelector('a, button');
    if (link instanceof HTMLElement) {
      link.focus();
    }
  };

  const focusFirstSubmenuItem = (submenuId: string) => {
    const submenu = document.querySelector(`[data-submenu="${submenuId}"]`);
    const firstLink = submenu?.querySelector('a, button');
    if (firstLink instanceof HTMLElement) {
      firstLink.focus();
    }
  };

  const openSubmenu = (itemId: string) => {
    setActiveSubmenu(itemId);
    const item = items.find(item => item.id === itemId);
    if (item) {
      announce(`Submenu ${item.label} aberto`, 'polite');
    }
  };

  const closeSubmenu = () => {
    setActiveSubmenu(null);
    announce('Submenu fechado', 'polite');
  };

  const toggleSubmenu = (itemId: string) => {
    if (activeSubmenu === itemId) {
      closeSubmenu();
    } else {
      openSubmenu(itemId);
    }
  };

  const handleMouseEnter = (itemId: string) => {
    const item = items.find(item => item.id === itemId);
    if (item?.children) {
      setActiveSubmenu(itemId);
    }
  };

  const handleMouseLeave = () => {
    setActiveSubmenu(null);
  };

  const isCurrentPage = (href: string) => {
    return location.pathname === href;
  };

  const renderMenuItem = (item: MenuItem, index: number) => {
    const hasSubmenu = item.children && item.children.length > 0;
    const isSubmenuOpen = activeSubmenu === item.id;
    const isCurrent = isCurrentPage(item.href);

    return (
      <li
        key={item.id}
        ref={el => itemRefs.current[index] = el}
        className={`nav-menu__item ${hasSubmenu ? 'nav-menu__item--has-submenu' : ''}`}
        onMouseEnter={() => handleMouseEnter(item.id)}
        onMouseLeave={handleMouseLeave}
      >
        {hasSubmenu ? (
          <button
            className={`nav-menu__link nav-menu__button ${isCurrent ? 'nav-menu__link--current' : ''}`}
            aria-expanded={isSubmenuOpen}
            aria-haspopup="true"
            aria-controls={`submenu-${item.id}`}
            onKeyDown={(e) => handleKeyDown(e, index, item)}
            onClick={() => toggleSubmenu(item.id)}
          >
            {item.label}
            <svg
              className={`nav-menu__chevron ${isSubmenuOpen ? 'nav-menu__chevron--open' : ''}`}
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M4 6L8 10L12 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ) : (
          <Link
            to={item.href}
            className={`nav-menu__link ${isCurrent ? 'nav-menu__link--current' : ''}`}
            aria-current={isCurrent ? 'page' : undefined}
            onKeyDown={(e) => handleKeyDown(e, index, item)}
          >
            {item.label}
          </Link>
        )}

        {hasSubmenu && item.children && (
          <ul
            id={`submenu-${item.id}`}
            data-submenu={item.id}
            className={`nav-menu__submenu ${isSubmenuOpen ? 'nav-menu__submenu--open' : ''}`}
            role="menu"
            aria-labelledby={`nav-menu__button-${item.id}`}
          >
            {item.children.map((subItem) => (
              <li key={subItem.id} className="nav-menu__submenu-item" role="none">
                <Link
                  to={subItem.href}
                  className={`nav-menu__submenu-link ${isCurrentPage(subItem.href) ? 'nav-menu__submenu-link--current' : ''}`}
                  role="menuitem"
                  aria-current={isCurrentPage(subItem.href) ? 'page' : undefined}
                  onClick={closeSubmenu}
                >
                  {subItem.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <nav className={`nav-menu nav-menu--${orientation} ${className}`} role="navigation">
      <ul
        ref={menuRef}
        className="nav-menu__list"
        role="menubar"
        aria-orientation={orientation}
      >
        {items.map((item, index) => renderMenuItem(item, index))}
      </ul>
    </nav>
  );
};

export default NavigationMenu;