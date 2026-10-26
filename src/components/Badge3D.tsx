import React from 'react';

interface Badge3DProps {
  icon?: React.ReactNode;
  children?: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'subtle' | 'pill' | 'glow';
  className?: string;
  title?: string;
}

export default function Badge3D({
  icon,
  children,
  size = 'sm',
  variant = 'solid',
  className = '',
  title,
}: Badge3DProps) {
  // Tamanhos para icon-only ou badges com texto
  const sizeClasses = {
    xs: children ? 'px-2 py-0.5 text-[10px] gap-1 rounded-md' : 'w-5 h-5 rounded-md text-[10px]',
    sm: children ? 'px-2.5 py-1 text-xs gap-1.5 rounded-lg' : 'w-7 h-7 rounded-lg text-xs',
    md: children ? 'px-3 py-1.5 text-xs sm:text-sm gap-2 rounded-xl' : 'w-9 h-9 rounded-xl text-sm',
    lg: children ? 'px-4 py-2 text-sm sm:text-base gap-2.5 rounded-2xl' : 'w-11 h-11 rounded-2xl text-base',
  };

  // Variantes visuais 3D volumétricas
  const variantClasses = {
    // 3D Volumétrico sólido: gradiente azul-marinho -> azul elétrico com chanfro e luz superior
    solid:
      'bg-gradient-to-br from-[#004A99] via-[#0284C7] to-[#003875] text-white ' +
      'dark:from-[#00D8FF] dark:via-[#0284C7] dark:to-[#004A99] dark:text-[#040B16] ' +
      'shadow-[inset_0_1px_1px_rgba(255,255,255,0.45),0_2px_6px_rgba(0,74,153,0.3)] ' +
      'dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.6),0_0_14px_rgba(0,216,255,0.35)] ' +
      'border border-sky-300/40 dark:border-cyan-300/60 font-semibold',

    // 3D Sutil: fundo translúcido acetinado com contorno reflexivo e glow suave
    subtle:
      'bg-gradient-to-b from-sky-50 to-blue-100/80 text-[#004A99] ' +
      'dark:bg-gradient-to-b dark:from-[#071D3A]/90 dark:to-[#0A274E]/90 dark:text-[#00D8FF] ' +
      'border border-sky-200/90 dark:border-cyan-400/30 ' +
      'shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_3px_rgba(0,74,153,0.08)] ' +
      'dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_2px_8px_rgba(0,0,0,0.4)] font-medium',

    // Cápsula 3D técnica
    pill:
      'rounded-lg bg-gradient-to-r from-sky-50 via-blue-50 to-sky-100 text-[#004A99] ' +
      'dark:from-[#061C38] dark:via-[#0A2850] dark:to-[#071F3F] dark:text-cyan-200 ' +
      'border border-sky-200 dark:border-cyan-400/40 ' +
      'shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_1px_2px_rgba(0,74,153,0.1)] ' +
      'dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_0_10px_rgba(0,216,255,0.15)] font-semibold',

    // Glow de alta prioridade (para selos de destaque, feiras, premiações)
    glow:
      'bg-gradient-to-br from-[#05549D] to-[#0284C7] text-white ' +
      'dark:from-[#00D8FF] dark:to-[#004A99] dark:text-slate-950 ' +
      'border border-cyan-300/60 dark:border-cyan-200 ' +
      'shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.6),0_4px_12px_rgba(0,74,153,0.35)] ' +
      'dark:shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.8),0_0_18px_rgba(0,216,255,0.5)] font-bold',
  };

  return (
    <span
      title={title}
      className={`inline-flex items-center justify-center shrink-0 select-none transition-all duration-150 ease-out ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {icon && <span className="inline-flex shrink-0 items-center justify-center">{icon}</span>}
      {children && <span className="truncate">{children}</span>}
    </span>
  );
}
