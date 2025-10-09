import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { CalculatorIcon, ChartBarIcon, CurrencyDollarIcon, DocumentTextIcon, ChartLineIcon, LogoIcon } from './Icons';

const NAV_ITEMS = [
  { to: '/', label: 'Estimator', icon: CalculatorIcon },
  { to: '/simulator', label: 'Simulator', icon: ChartLineIcon },
  { to: '/dashboard', label: 'Dashboard', icon: ChartBarIcon },
  { to: '/pricing', label: 'Pricing', icon: CurrencyDollarIcon },
  { to: '/docs', label: 'Docs', icon: DocumentTextIcon },
];

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-blue-200 bg-white/95 backdrop-blur shadow-sm">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-blue-500 bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg">
              <LogoIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-base font-bold text-blue-900">Tokenizer Studio</p>
              <p className="text-xs text-blue-600 hidden sm:block">Token Analytics</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all',
                      isActive
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-blue-700 hover:bg-blue-100 hover:text-blue-900'
                    ].join(' ')
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-blue-700 hover:bg-blue-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

      </div>

      {/* Mobile Navigation Menu - Floating Overlay */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
            onClick={closeMobileMenu}
          />

          {/* Menu Dropdown */}
          <nav className="absolute top-16 left-0 right-0 bg-white border-b border-blue-200 shadow-lg z-50 md:hidden">
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-2 py-4">
                {NAV_ITEMS.map(item => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={closeMobileMenu}
                      className={({ isActive }) =>
                        [
                          'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all',
                          isActive
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'text-blue-700 hover:bg-blue-100 hover:text-blue-900'
                        ].join(' ')
                      }
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          </nav>
        </>
      )}
    </header>
  );
};

export default Header;
