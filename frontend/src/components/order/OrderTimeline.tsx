import React from 'react';
import { Check, CheckCircle2, Clock, Truck, Utensils } from 'lucide-react';
import { Order, OrderStatus } from '../../types';

export interface OrderTimelineProps {
  order: Order;
  className?: string;
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ order, className = '' }) => {
  const steps: { status: OrderStatus; label: string; icon: React.ReactNode }[] = [
    { status: 'pending', label: 'Order Placed', icon: <Clock className="w-4 h-4" /> },
    { status: 'preparing', label: 'Preparing in Kitchen', icon: <Utensils className="w-4 h-4" /> },
    { status: 'ready', label: 'Quality Inspected & Ready', icon: <CheckCircle2 className="w-4 h-4" /> },
    { status: 'delivered', label: 'Delivered to Bedside', icon: <Truck className="w-4 h-4" /> },
  ];

  const getStatusIndex = (st: OrderStatus): number => {
    switch (st) {
      case 'pending':
        return 0;
      case 'preparing':
        return 1;
      case 'ready':
        return 2;
      case 'delivered':
        return 3;
      case 'cancelled':
        return -1;
      default:
        return 0;
    }
  };

  const currentIndex = getStatusIndex(order.status);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Horizontal Progress Bar for Tablet/Desktop */}
      <div className="hidden sm:flex items-center justify-between relative px-4 py-3 bg-slate-50 rounded-xl border border-slate-200">
        {steps.map((step, idx) => {
          const isCompleted = currentIndex >= idx;
          const isCurrent = currentIndex === idx;

          return (
            <React.Fragment key={step.status}>
              <div className="flex flex-col items-center relative z-10">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? 'bg-teal-700 text-white ring-4 ring-teal-100'
                      : 'bg-white border-2 border-slate-300 text-slate-400'
                  }`}
                >
                  {isCompleted && !isCurrent ? <Check className="w-4 h-4" /> : step.icon}
                </div>
                <span
                  className={`text-xs mt-2 font-medium ${
                    isCurrent ? 'text-teal-900 font-bold' : isCompleted ? 'text-slate-700' : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 transition-colors ${
                    currentIndex > idx ? 'bg-teal-600' : 'bg-slate-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Vertical Detailed Steps with notes & timestamps */}
      <div className="space-y-3 pt-2">
        {order.timeline.map((item, idx) => (
          <div key={idx} className="flex items-start gap-3 text-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-teal-600 mt-1 shrink-0 ring-4 ring-teal-50" />
            <div className="flex-1 bg-white p-3 rounded-lg border border-slate-100 shadow-2xs">
              <div className="flex items-center justify-between text-slate-700">
                <span className="font-bold uppercase tracking-wider text-[11px] text-teal-800">
                  {item.status.toUpperCase()}
                </span>
                <span className="text-slate-400 text-[10px]">
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {item.notes && <p className="text-slate-600 mt-1">{item.notes}</p>}
              {item.by && <span className="text-slate-400 text-[11px] mt-0.5 block">Staff: {item.by}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
