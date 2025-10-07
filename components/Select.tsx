import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

const Select: React.FC<SelectProps> = ({ label, className = '', children, ...props }) => {
  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={props.id} className="block text-sm font-medium text-blue-800">
          {label}
        </label>
      )}
      <select
        {...props}
        className={`w-full rounded-lg border-2 border-blue-300 bg-white px-4 py-2.5 text-sm text-blue-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 hover:border-blue-400 ${className}`}
      >
        {children}
      </select>
    </div>
  );
};

export default Select;
