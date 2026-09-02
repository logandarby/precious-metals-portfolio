CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

INSERT INTO users (
    id, email, password_hash, created_at, updated_at
) VALUES (
    'd349e6a9-6517-45a0-a46a-3c804c101473',
    'test@test.com',
    -- Thisisapassword1
    '$2a$10$dJogVMGH/d9efrCIEH.VReMz9IXY7BICH7xJaU1mr7m8EZwdkXkZq',
    NOW(),
    NOW()
);
