import {
  BarChart2,
  ShieldCheck,
  Receipt,
  Shield,
  Building2,
  Users,
  Settings as SettingsIcon,
  DollarSign,
  MessageCircle,
  FlaskConical,
  ListOrdered,
} from 'lucide-react';
import type { SidebarSection } from '@/components/dashboard/Sidebar';

export const sidebarSections: SidebarSection[] = [
  {
    title: 'Main Navigation',
    items: [
      { label: 'API Testing', icon: FlaskConical, to: '/api-testing' },
      { label: 'Transaction Log', icon: ListOrdered, to: '/transactions' },
      { label: 'Insurance Plans', icon: Building2, to: '/insurance-plans' },
      { label: 'Policies', icon: BarChart2, to: '/policies' },
      { label: 'Eligibility Requests', icon: Shield, to: '/eligibility-requests' },
      { label: 'Claims', icon: Receipt, to: '/claims' },
      { label: 'Payments', icon: DollarSign, to: '/payments' },
      { label: 'Communications', icon: MessageCircle, to: '/communications' },
    ],
  },
  {
    title: 'System',
    items: [{ label: 'Settings', icon: SettingsIcon, to: '/settings' }],
  },
];

export const apiTestingSidebarSections: SidebarSection[] = [
  {
    title: 'API Tools',
    items: [
      { label: 'API Testing', icon: FlaskConical, to: '/api-testing' },
      { label: 'Transaction Log', icon: ListOrdered, to: '/transactions' },
    ],
  },
];

export const payerSidebarSections: SidebarSection[] = [
  {
    title: 'Main Navigation',
    items: [
      { label: 'Insurance Plans', icon: Building2, to: '/insurance-plans' },
      { label: 'Policies', icon: BarChart2, to: '/policies' },
      { label: 'Eligibility Requests', icon: Shield, to: '/eligibility-requests' },
      { label: 'Claims', icon: Receipt, to: '/claims' },
      { label: 'Payments', icon: DollarSign, to: '/payments' },
      { label: 'Communications', icon: MessageCircle, to: '/communications' },
    ],
  },
  {
    title: 'System',
    items: [{ label: 'Settings', icon: SettingsIcon, to: '/settings' }],
  },
];
