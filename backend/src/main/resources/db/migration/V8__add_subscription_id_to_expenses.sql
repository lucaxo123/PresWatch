ALTER TABLE expenses ADD COLUMN subscription_id BIGINT REFERENCES subscriptions(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX idx_expenses_subscription_date
    ON expenses(subscription_id, expense_date)
    WHERE subscription_id IS NOT NULL;
