import { motion } from 'framer-motion';
import { Icon } from './Icon';

type Tone = 'violet' | 'emerald' | 'cyan' | 'coral' | 'gold' | 'slate';

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
  tone?: Tone;
}) {
  return (
    <motion.article
      className={`stat-card tone-${tone}`}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
    >
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
