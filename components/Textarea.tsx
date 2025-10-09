import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

const Textarea: React.FC<TextareaProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={props.id} className="block text-sm font-medium text-blue-800">
          {label}
        </label>
      )}
      <textarea
        {...props}
        className={`min-h-[180px] w-full rounded-lg border-2 border-blue-300 bg-white/80 backdrop-blur-sm px-4 py-2.5 text-sm text-blue-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 hover:border-blue-400 ${className}`}
      />
    </div>
  );
};

export default Textarea;
