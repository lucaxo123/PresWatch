CREATE TABLE subscriptions (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id     BIGINT         REFERENCES categories(id) ON DELETE SET NULL,
    name            VARCHAR(255)   NOT NULL,
    amount          NUMERIC(12,2)  NOT NULL,
    billing_day     INTEGER        NOT NULL CHECK (billing_day BETWEEN 1 AND 31),
    active          BOOLEAN        NOT NULL DEFAULT TRUE,
    start_date      DATE           NOT NULL,
    end_date        DATE,
    created_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user    ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_billing ON subscriptions(user_id, billing_day, active);
