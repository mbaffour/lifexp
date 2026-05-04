import { motion } from 'framer-motion';
import { Icon } from './Icon';

export function StatCard({
  title,
  value,
  detail,
  icon,
  tone = 'violet',
}: {
  title: string;
  value: string | number;
  detail?: string;
  icon: string;
  tone?: 'violet' | 'emerald' | 'cyan' | 'coral' | 'gold' | 'slate';
}) {
  return (
    <motion.article className={`stat-card tone-${tone}`} whileHover={{ y: -3 }} transition={{ type: 'spring', stiffness: 260, damping: 22 }}>
      <div className="stat-icon">
        <Icon name={icon} size={20} />
      </div>
      <div>
        <p>{title}</p>
        <strong>{value}</strong>
        {detail ? <span>{detail}</span> : null}
      </div>
    </motion.article>
  );
}
