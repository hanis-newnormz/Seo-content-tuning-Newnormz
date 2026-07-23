-- Aggregate views used by the dashboard and project detail pages.

create view project_stats
with (security_invoker = true) as
select
  p.*,
  count(distinct pg.id) as page_count,
  count(r.id) as recommendation_count,
  count(r.id) filter (where r.status = 'approved') as approved_count
from projects p
left join pages pg on pg.project_id = p.id
left join recommendations r on r.page_id = pg.id
group by p.id;

create view page_stats
with (security_invoker = true) as
select
  pg.*,
  count(r.id) as recommendation_count,
  count(r.id) filter (where r.status = 'approved') as approved_count
from pages pg
left join recommendations r on r.page_id = pg.id
group by pg.id;

grant select on project_stats to authenticated;
grant select on page_stats to authenticated;
