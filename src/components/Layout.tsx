import { type ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  rightSlot?: ReactNode;
}

export function PageHeader({ title, subtitle, rightSlot }: PageHeaderProps) {
  return (
    <div className="pt-8 pb-5 px-5 md:px-0">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-ink-800 tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1.5 text-sm md:text-base text-ink-500">{subtitle}</p>
          )}
        </div>
        {rightSlot && <div className="flex-shrink-0">{rightSlot}</div>}
      </div>
    </div>
  );
}

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export function PageContainer({ children, className = '' }: PageContainerProps) {
  return (
    <div className={`max-w-3xl mx-auto px-5 md:px-8 ${className}`}>
      {children}
    </div>
  );
}
