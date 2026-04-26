ALTER TABLE expenses ADD COLUMN debt_id BIGINT REFERENCES debts(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX idx_expenses_debt_date
    ON expenses(debt_id, expense_date)
    WHERE debt_id IS NOT NULL;
