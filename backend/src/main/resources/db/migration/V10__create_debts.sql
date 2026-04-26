CREATE TABLE debts (
    id                      BIGSERIAL       PRIMARY KEY,
    user_id                 BIGINT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id             BIGINT          REFERENCES categories(id) ON DELETE SET NULL,
    card_id                 BIGINT          REFERENCES cards(id) ON DELETE SET NULL,
    name                    VARCHAR(255)    NOT NULL,
    direction               VARCHAR(20)     NOT NULL CHECK (direction IN ('OWED_BY_ME', 'OWED_TO_ME')),
    type                    VARCHAR(20)     NOT NULL CHECK (type IN ('INSTALLMENTS', 'SINGLE')),
    amount_per_installment  NUMERIC(12, 2)  NOT NULL CHECK (amount_per_installment > 0),
    installments_total      INTEGER,
    installments_paid       INTEGER         NOT NULL DEFAULT 0 CHECK (installments_paid >= 0),
    payment_day             INTEGER         CHECK (payment_day BETWEEN 1 AND 31),
    due_date                DATE,
    start_date              DATE            NOT NULL,
    active                  BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    CONSTRAINT debts_type_consistency CHECK (
        (type = 'INSTALLMENTS' AND installments_total IS NOT NULL AND installments_total > 0 AND payment_day IS NOT NULL)
        OR
        (type = 'SINGLE' AND due_date IS NOT NULL)
    ),
    CONSTRAINT debts_paid_le_total CHECK (
        installments_total IS NULL OR installments_paid <= installments_total
    )
);

CREATE INDEX idx_debts_user_active ON debts(user_id, active);
CREATE INDEX idx_debts_scheduler   ON debts(active, direction, type, payment_day);
