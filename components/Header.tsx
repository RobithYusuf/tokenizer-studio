import React from 'react';
import { NavLink } from 'react-router-dom';
import { CalculatorIcon, ChartBarIcon, CurrencyDollarIcon, DocumentTextIcon, LogoIcon } from './Icons';

const NAV_ITEMS = [
  { to: '/', label: 'Estimator', icon: CalculatorIcon },
  { to: '/dashboard', label: 'Dashboard', icon: ChartBarIcon },
  { to: '/pricing', label: 'Pricing', icon: CurrencyDollarIcon },
  { to: '/docs', label: 'Docs', icon: DocumentTextIcon },
];

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-40 border-b border-blue-200 bg-white/95 backdrop-blur shadow-sm">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-blue-500 bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg">
              <LogoIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-base font-bold text-blue-900">Tokenizer Studio</p>
              <p className="text-xs text-blue-600">Token Analytics</p>
            </div>
          </div>

          <nav className="flex items-center gap-1">
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
                  <span className="hidden md:inline">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

      </div>
    </header>
  );
};

export default Header;
