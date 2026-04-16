CREATE TABLE expenses (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id  BIGINT       REFERENCES categories(id) ON DELETE SET NULL,
    amount       NUMERIC(12,2) NOT NULL,
    description  VARCHAR(500),
    expense_date DATE         NOT NULL,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_expenses_user_date ON expenses(user_id, expense_date);
CREATE INDEX idx_expenses_category  ON expenses(category_id);
