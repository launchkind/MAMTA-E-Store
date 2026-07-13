-- Allow users to edit/delete their own review (previously only insert + admin were allowed).
-- Editing resets is_approved to false via the app layer so edited reviews get re-moderated.
create policy "reviews_own_update" on public.product_reviews
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "reviews_own_delete" on public.product_reviews
  for delete using (auth.uid() = user_id);
