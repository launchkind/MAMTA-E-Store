"use client";

import React, { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { useUserStore } from "@/lib/store";
import { useAuthSidebarStore } from "@/lib/useAuthSidebarStore";

interface ReviewFormProps {
  productId: string;
  onReviewSubmitted?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  productId,
  onReviewSubmitted,
}) => {
  const { isAuthenticated, authUser } = useUserStore();
  const { openLogin } = useAuthSidebarStore();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isAuthenticated || !authUser) {
    return (
      <div className="flex flex-col items-center text-center p-6 bg-muted/40 border border-border/50 rounded-2xl">
        <Star className="w-8 h-8 text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground mb-4">
          Please sign in to write a review.
        </p>
        <Button onClick={openLogin}>Sign In</Button>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (rating < 1 || rating > 5) {
      toast.error("Please select a star rating.");
      return;
    }
    if (comment.trim().length < 5) {
      toast.error("Please write a few words about your experience.");
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("product_reviews").insert({
        product_id: productId,
        user_id: authUser._id,
        user_name: authUser.name || "Anonymous",
        rating,
        comment: comment.trim(),
      });

      if (error) {
        if (error.code === "23505") {
          toast.error("You've already reviewed this product.");
        } else {
          toast.error("Failed to submit review. Please try again.");
        }
        return;
      }

      toast.success("Review submitted! It will appear after approval.");
      setRating(0);
      setComment("");
      onReviewSubmitted?.();
    } catch {
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-1">
      <div>
        <p className="text-sm font-medium text-foreground mb-2">
          Your Rating
        </p>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-0.5"
              aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
            >
              <Star
                size={28}
                className={
                  star <= (hoverRating || rating)
                    ? "fill-primary text-primary"
                    : "text-muted-foreground/30"
                }
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-foreground mb-2">
          Your Review
        </p>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this product..."
          rows={5}
          maxLength={1000}
        />
        <p className="text-xs text-muted-foreground mt-1 text-right">
          {comment.length}/1000
        </p>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full font-semibold"
        size="lg"
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit Review"
        )}
      </Button>
    </div>
  );
};

export default ReviewForm;
