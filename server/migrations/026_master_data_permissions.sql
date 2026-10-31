-- Phase 10.3: action-level permissions for the existing protected master APIs.
-- No role or user grants are seeded.
INSERT INTO permission_catalog (module, permission, description) VALUES
  ('loan', 'master.areas.view', 'View areas'), ('loan', 'master.areas.create', 'Create areas'), ('loan', 'master.areas.update', 'Update areas'), ('loan', 'master.areas.delete', 'Delete areas'),
  ('loan', 'master.centers.view', 'View centers'), ('loan', 'master.centers.create', 'Create centers'), ('loan', 'master.centers.update', 'Update centers'), ('loan', 'master.centers.delete', 'Delete centers'),
  ('loan', 'master.clients.view', 'View clients'), ('loan', 'master.clients.create', 'Create clients'), ('loan', 'master.clients.update', 'Update clients'), ('loan', 'master.clients.delete', 'Delete clients'),
  ('loan', 'master.districts.view', 'View districts'), ('loan', 'master.districts.create', 'Create districts'), ('loan', 'master.districts.update', 'Update districts'), ('loan', 'master.districts.delete', 'Delete districts'),
  ('loan', 'master.ifsc.view', 'View IFSC records'), ('loan', 'master.ifsc.create', 'Create IFSC records'), ('loan', 'master.ifsc.update', 'Update IFSC records'), ('loan', 'master.ifsc.delete', 'Delete IFSC records'),
  ('loan', 'master.insurance.view', 'View insurance records'), ('loan', 'master.insurance.create', 'Create insurance records'), ('loan', 'master.insurance.update', 'Update insurance records'), ('loan', 'master.insurance.delete', 'Delete insurance records'),
  ('loan', 'master.pincodes.view', 'View pincodes'), ('loan', 'master.pincodes.create', 'Create pincodes'), ('loan', 'master.pincodes.update', 'Update pincodes'), ('loan', 'master.pincodes.delete', 'Delete pincodes'),
  ('loan', 'master.product_groups.view', 'View product groups'), ('loan', 'master.product_groups.create', 'Create product groups'), ('loan', 'master.product_groups.update', 'Update product groups'), ('loan', 'master.product_groups.delete', 'Delete product groups'),
  ('loan', 'master.products.view', 'View products'), ('loan', 'master.products.create', 'Create products'), ('loan', 'master.products.update', 'Update products'), ('loan', 'master.products.delete', 'Delete products'),
  ('loan', 'master.purposes.view', 'View loan purposes'), ('loan', 'master.purposes.create', 'Create loan purposes'), ('loan', 'master.purposes.update', 'Update loan purposes'), ('loan', 'master.purposes.delete', 'Delete loan purposes'),
  ('loan', 'master.villages.view', 'View villages'), ('loan', 'master.villages.create', 'Create villages'), ('loan', 'master.villages.update', 'Update villages'), ('loan', 'master.villages.delete', 'Delete villages')
ON CONFLICT (module, permission) DO UPDATE SET description = EXCLUDED.description;
