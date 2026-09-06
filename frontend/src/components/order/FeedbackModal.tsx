import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { feedbackService } from '../../services/feedbackService';
import { Order } from '../../types';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';

export interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onFeedbackSubmitted: (updatedOrder: Order) => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  order,
  onFeedbackSubmitted,
}) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!order) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const updated = await feedbackService.submitFeedback(order.id, rating, comment);
      onFeedbackSubmitted(updated);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Meal Quality & Satisfaction Feedback"
      subtitle={`Order #${order.orderNumber} · ${order.foodName}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {order.feedback ? (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Previously Submitted Feedback:
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-4 h-4 ${
                    s <= order.feedback!.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                  }`}
                />
              ))}
              <span className="ml-2 font-bold text-slate-700">{order.feedback.rating} / 5</span>
            </div>
            <p className="text-slate-700 italic bg-white p-2.5 rounded border border-slate-100">
              "{order.feedback.comment}"
            </p>
            <span className="text-slate-400 text-[10px] block">
              Submitted: {new Date(order.feedback.submittedAt).toLocaleString()}
            </span>
          </div>
        ) : null}

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
            Rate Your Meal Experience
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none"
              >
                <Star
                  className={`w-7 h-7 transition-colors ${
                    star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                  }`}
                />
              </button>
            ))}
            <span className="text-xs font-bold text-slate-700 ml-2">
              {rating === 5
                ? 'Excellent / Satisfied'
                : rating === 4
                ? 'Good'
                : rating === 3
                ? 'Average'
                : rating === 2
                ? 'Poor'
                : 'Unsatisfactory'}
            </span>
          </div>
        </div>

        <div>
          <label htmlFor="feedback-comment" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Comments &amp; Dietary Notes
          </label>
          <textarea
            id="feedback-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Tell the dietary team about temperature, taste, allergen compliance, or portion size..."
            className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-600 text-slate-800"
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={isSubmitting}>
            {order.feedback ? 'Update Feedback' : 'Submit Feedback'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
