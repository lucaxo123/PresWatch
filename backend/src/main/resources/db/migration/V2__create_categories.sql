CREATE TABLE categories (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT REFERENCES users(id) ON DELETE CASCADE,
    name       VARCHAR(100) NOT NULL,
    color      VARCHAR(7)   NOT NULL DEFAULT '#94a3b8',
    icon       VARCHAR(50),
    is_default BOOLEAN      NOT NULL DEFAULT FALSE,
    UNIQUE (user_id, name)
);
