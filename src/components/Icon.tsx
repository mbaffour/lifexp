import * as Icons from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import type { ComponentType } from 'react';

type IconMap = Record<string, ComponentType<LucideProps>>;

export function Icon({ name, ...props }: { name?: string } & LucideProps) {
  const LucideIcon = (Icons as unknown as IconMap)[name ?? 'Circle'] ?? Icons.Circle;
  return <LucideIcon aria-hidden="true" {...props} />;
}
