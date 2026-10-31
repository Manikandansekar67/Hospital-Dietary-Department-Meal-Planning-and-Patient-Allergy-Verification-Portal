import React from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Flame,
  ShieldAlert,
  ShieldCheck,
  Truck,
  XCircle,
} from 'lucide-react';
import { AllergySeverity, OrderStatus, SafetyStatus } from '../../types';
import { Badge } from './Badge';

interface StatusBadgeProps {
  type: 'safety' | 'order' | 'approval' | 'severity' | 'status';
  value: SafetyStatus | OrderStatus | 'approved' | 'rejected' | 'pending' | AllergySeverity | 'admitted' | 'discharged' | string;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, value, size = 'md', className = '' }) => {
  if (type === 'status') {
    if (value === 'admitted') {
      return (
        <Badge variant="success" size={size} className={className}>
          Admitted
        </Badge>
      );
    }
    if (value === 'discharged') {
      return (
        <Badge variant="neutral" size={size} className={className}>
          Discharged
        </Badge>
      );
    }
    // If it's an order or other status passed as 'status'
  }
  if (type === 'safety') {
    const safety = value as SafetyStatus;
    switch (safety) {
      case 'SAFE':
        return (
          <Badge variant="success" size={size} icon={<ShieldCheck className="w-3.5 h-3.5" />} className={className}>
            SAFE TO CONSUME
          </Badge>
        );
      case 'CAUTION':
        return (
          <Badge variant="warning" size={size} icon={<AlertTriangle className="w-3.5 h-3.5" />} className={className}>
            CLINICAL CAUTION
          </Badge>
        );
      case 'CONTRAINDICATED':
        return (
          <Badge variant="danger" size={size} icon={<XCircle className="w-3.5 h-3.5" />} className={className}>
            CONTRAINDICATED
          </Badge>
        );
      case 'CRITICAL_ALLERGY':
        return (
          <Badge
            variant="danger"
            size={size}
            icon={<AlertOctagon className="w-3.5 h-3.5 animate-bounce" />}
            className={`font-semibold bg-red-100 text-red-900 border-red-400 ${className}`}
          >
            CRITICAL ALLERGY
          </Badge>
        );
    }
  }

  if (type === 'order') {
    const order = value as OrderStatus;
    switch (order) {
      case 'pending':
        return (
          <Badge variant="neutral" size={size} icon={<Clock className="w-3.5 h-3.5" />} className={className}>
            Order Placed
          </Badge>
        );
      case 'preparing':
        return (
          <Badge variant="warning" size={size} icon={<Clock className="w-3.5 h-3.5 animate-spin" />} className={className}>
            Preparing
          </Badge>
        );
      case 'ready':
        return (
          <Badge variant="info" size={size} icon={<CheckCircle2 className="w-3.5 h-3.5" />} className={className}>
            Ready for Delivery
          </Badge>
        );
      case 'delivered':
        return (
          <Badge variant="success" size={size} icon={<Truck className="w-3.5 h-3.5" />} className={className}>
            Delivered
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="danger" size={size} icon={<XCircle className="w-3.5 h-3.5" />} className={className}>
            Cancelled
          </Badge>
        );
    }
  }

  if (type === 'approval') {
    switch (value) {
      case 'approved':
        return (
          <Badge variant="success" size={size} icon={<CheckCircle2 className="w-3.5 h-3.5" />} className={className}>
            Doctor Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="danger" size={size} icon={<XCircle className="w-3.5 h-3.5" />} className={className}>
            Doctor Rejected
          </Badge>
        );
      case 'pending':
      default:
        return (
          <Badge variant="warning" size={size} icon={<Clock className="w-3.5 h-3.5" />} className={className}>
            Pending Review
          </Badge>
        );
    }
  }

  if (type === 'severity') {
    const sev = value as AllergySeverity;
    switch (sev) {
      case 'mild':
        return (
          <Badge variant="neutral" size={size} className={className}>
            Mild
          </Badge>
        );
      case 'moderate':
        return (
          <Badge variant="warning" size={size} icon={<AlertTriangle className="w-3.5 h-3.5" />} className={className}>
            Moderate
          </Badge>
        );
      case 'severe':
        return (
          <Badge variant="danger" size={size} icon={<ShieldAlert className="w-3.5 h-3.5" />} className={className}>
            Severe
          </Badge>
        );
      case 'critical':
        return (
          <Badge
            variant="danger"
            size={size}
            icon={<Flame className="w-3.5 h-3.5" />}
            className={`font-semibold bg-red-100 text-red-900 border-red-400 ${className}`}
          >
            Critical Anaphylaxis
          </Badge>
        );
    }
  }

  return <Badge size={size}>{String(value)}</Badge>;
};
