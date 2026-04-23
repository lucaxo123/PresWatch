CREATE TABLE cards (
    id          BIGSERIAL      PRIMARY KEY,
    user_id     BIGINT         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bank        VARCHAR(100)   NOT NULL,
    last4       VARCHAR(4)     NOT NULL CHECK (last4 ~ '^[0-9]{4}$'),
    color       VARCHAR(7)     NOT NULL,
    created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, bank, last4)
);

CREATE INDEX idx_cards_user ON cards(user_id);
