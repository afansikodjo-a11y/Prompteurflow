-- Historique normalisé des paiements — distinct de `subscriptions`, qui ne
-- garde que le statut COURANT par utilisateur, pas chaque transaction. Sert
-- de base aux futurs calculs de revenus (MRR/ARR/churn) une fois le
-- checkout/webhook Moneroo réel branché. Reste vide jusque-là — jamais de
-- ligne de démonstration.
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id),
  plan_id text references public.plans (id),
  amount_xof integer not null,
  status text not null check (status in ('succeeded', 'pending', 'failed', 'refunded')),
  moneroo_payment_reference text,
  moneroo_event_id text unique,
  created_at timestamptz not null default now()
);

alter table public.transactions enable row level security;

create policy "transactions: lecture admin uniquement"
  on public.transactions for select
  using (public.is_admin());

grant select on public.transactions to authenticated;
-- Écriture réservée au service-role (futur webhook Moneroo) — aucun grant
-- client, même précaution que `subscriptions`/`payment_events`.
