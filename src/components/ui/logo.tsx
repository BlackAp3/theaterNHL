import { cn } from "../../lib/utils";

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: 'h-8',
  md: 'h-10',
  lg: 'h-12'
};

export function Logo({ className, size = 'md' }: LogoProps) {
  return (
    <div className={cn('flex items-center space-x-3', className)}>
      <div className="relative">
        <div className={cn(
          'aspect-square rounded-full bg-gradient-to-br from-brand-800 to-brand-900 flex items-center justify-center relative overflow-hidden shadow-lg',
          'transition-all duration-300 hover:shadow-brand-500/20 hover:scale-105 group',
          sizeStyles[size]
        )}>
          {/* Animated ring effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent rounded-full animate-pulse-slow" />
          
          {/* Outer Ring with rotating text */}
          <div className="absolute inset-0 rounded-full">
            <svg className="w-full h-full animate-spin-slow" viewBox="0 0 100 100">
              <defs>
                <path
                  id="circle"
                  d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                />
              </defs>
              <text className="text-[8px] font-bold uppercase tracking-widest" fill="white" fillOpacity="0.9">
                <textPath xlinkHref="#circle" startOffset="0%">
                  Excellence • Quality • Care • Service •
                </textPath>
              </text>
            </svg>
          </div>

          {/* Inner Circle with NH */}
          <div className="absolute inset-[15%] rounded-full bg-white shadow-inner flex items-center justify-center transform transition-transform duration-300 group-hover:scale-105">
            <span className="text-brand-900 font-black text-2xl tracking-tighter bg-gradient-to-br from-brand-700 to-brand-900 bg-clip-text text-transparent">
              NH
            </span>
          </div>

          {/* Decorative Elements */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-bl from-black/10 to-transparent pointer-events-none" />
          
          {/* Shine effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full duration-1000 transition-transform" />
        </div>
      </div>

      {/* Text beside logo */}
      <div className="flex flex-col">
        <span className={cn(
          "font-bold bg-gradient-to-r from-brand-600 to-brand-800 bg-clip-text text-transparent whitespace-nowrap",
          size === 'sm' ? 'text-base' : size === 'lg' ? 'text-xl' : 'text-lg'
        )}>
          Theater Management
        </span>
        <span className={cn(
          "font-medium text-brand-600/60",
          size === 'sm' ? 'text-[10px]' : size === 'lg' ? 'text-sm' : 'text-xs'
        )}>
          System
        </span>
      </div>
    </div>
  );
}
