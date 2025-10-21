-- Online Voting System Database Schema
-- PostgreSQL / MySQL compatible

-- Drop existing tables if they exist
DROP TABLE IF EXISTS votes CASCADE;
DROP TABLE IF EXISTS candidates CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table (voters and admin)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',  -- 'user' or 'admin'
    status VARCHAR(50) DEFAULT 'active',  -- 'active' or 'inactive'
    profile_pic VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Candidates table
CREATE TABLE candidates (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    party VARCHAR(255),
    manifesto TEXT,
    profile_pic VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Votes table with daily voting support
CREATE TABLE votes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    candidate_id INTEGER NOT NULL,
    vote_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    UNIQUE (user_id, vote_date)  -- One vote per user per day
);

-- Results table (for finalized results)
CREATE TABLE results (
    id SERIAL PRIMARY KEY,
    is_finalized BOOLEAN DEFAULT FALSE,
    winner_id INTEGER,
    finalized_at TIMESTAMP,
    finalized_by INTEGER,
    FOREIGN KEY (winner_id) REFERENCES candidates(id) ON DELETE SET NULL,
    FOREIGN KEY (finalized_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert default results row
INSERT INTO results (is_finalized, winner_id, finalized_at, finalized_by)
VALUES (FALSE, NULL, NULL, NULL);

-- Create indexes for better performance
CREATE INDEX idx_votes_user_date ON votes(user_id, vote_date);
CREATE INDEX idx_votes_candidate ON votes(candidate_id);
CREATE INDEX idx_votes_date ON votes(vote_date);
CREATE INDEX idx_candidates_active ON candidates(is_active);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Note: Admin user will be created automatically by init_db.py
-- Or manually create using: python create_admin.py

-- Show success message
SELECT 'Database schema created successfully!' AS message;
