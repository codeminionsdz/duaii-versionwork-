
-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Trigger can create profiles" ON public.profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON public.profiles;

DROP POLICY IF EXISTS "Anyone can view pharmacy profiles" ON public.pharmacy_profiles;
DROP POLICY IF EXISTS "Pharmacies can update their own profile" ON public.pharmacy_profiles;
DROP POLICY IF EXISTS "Pharmacies can insert their own profile" ON public.pharmacy_profiles;
DROP POLICY IF EXISTS "Service role can insert pharmacy profiles" ON public.pharmacy_profiles;

DROP POLICY IF EXISTS "Users can view their own prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Users can insert their own prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Users can update their own prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Pharmacies can view pending prescriptions" ON public.prescriptions;

DROP POLICY IF EXISTS "Users can view responses to their prescriptions" ON public.prescription_responses;
DROP POLICY IF EXISTS "Pharmacies can view their own responses" ON public.prescription_responses;
DROP POLICY IF EXISTS "Pharmacies can insert their own responses" ON public.prescription_responses;
DROP POLICY IF EXISTS "Pharmacies can update their own responses" ON public.prescription_responses;

DROP POLICY IF EXISTS "Users can view their own medicines" ON public.user_medicines;
DROP POLICY IF EXISTS "Users can insert their own medicines" ON public.user_medicines;
DROP POLICY IF EXISTS "Users can update their own medicines" ON public.user_medicines;
DROP POLICY IF EXISTS "Users can delete their own medicines" ON public.user_medicines;

DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;

-- Profiles RLS Policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Service role can insert profiles"
  on public.profiles for insert
  with check (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Trigger can create profiles"
  on public.profiles for insert
  with check (true);

-- Pharmacy Profiles RLS Policies
create policy "Anyone can view pharmacy profiles"
  on public.pharmacy_profiles for select
  using (true);

create policy "Service role can insert pharmacy profiles"
  on public.pharmacy_profiles for insert
  with check (true);

create policy "Pharmacies can update their own profile"
  on public.pharmacy_profiles for update
  using (auth.uid() = id);

create policy "Pharmacies can insert their own profile"
  on public.pharmacy_profiles for insert
  with check (auth.uid() = id);

-- Prescriptions RLS Policies
create policy "Users can view their own prescriptions"
  on public.prescriptions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own prescriptions"
  on public.prescriptions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own prescriptions"
  on public.prescriptions for update
  using (auth.uid() = user_id);

create policy "Pharmacies can view pending prescriptions"
  on public.prescriptions for select
  using (
    status = 'pending' 
    and exists (
      select 1 from public.pharmacy_profiles 
      where id = auth.uid()
    )
  );

-- Prescription Responses RLS Policies
create policy "Users can view responses to their prescriptions"
  on public.prescription_responses for select
  using (
    exists (
      select 1 from public.prescriptions 
      where id = prescription_id 
      and user_id = auth.uid()
    )
  );

create policy "Pharmacies can view their own responses"
  on public.prescription_responses for select
  using (auth.uid() = pharmacy_id);

create policy "Pharmacies can insert their own responses"
  on public.prescription_responses for insert
  with check (auth.uid() = pharmacy_id);

create policy "Pharmacies can update their own responses"
  on public.prescription_responses for update
  using (auth.uid() = pharmacy_id);

-- User Medicines RLS Policies
create policy "Users can view their own medicines"
  on public.user_medicines for select
  using (auth.uid() = user_id);

create policy "Users can insert their own medicines"
  on public.user_medicines for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own medicines"
  on public.user_medicines for update
  using (auth.uid() = user_id);

create policy "Users can delete their own medicines"
  on public.user_medicines for delete
  using (auth.uid() = user_id);

-- Notifications RLS Policies
create policy "Users can view their own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users can update their own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);
