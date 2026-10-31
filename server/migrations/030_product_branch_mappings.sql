-- Product availability is scoped to a branch.  `products.id` and `branches.id`
-- are the canonical identifiers used by this table (not their display codes).
CREATE TABLE IF NOT EXISTS product_branch_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT product_branch_mappings_product_branch_key UNIQUE (product_id, branch_id)
);

CREATE INDEX IF NOT EXISTS idx_product_branch_mappings_branch_active
  ON product_branch_mappings (branch_id, product_id) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_product_branch_mappings_product
  ON product_branch_mappings (product_id);
