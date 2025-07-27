-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom types
CREATE TYPE user_role AS ENUM ('operator', 'senior', 'supervisor', 'admin');
CREATE TYPE knowledge_status AS ENUM ('draft', 'pending', 'published', 'archived');
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role user_role NOT NULL DEFAULT 'operator',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

-- Categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Knowledge base table
CREATE TABLE knowledge_base (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    category_id UUID NOT NULL REFERENCES categories(id),
    content JSONB NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}',
    embedding vector(1536),
    search_text tsvector,
    status knowledge_status NOT NULL DEFAULT 'draft',
    view_count INTEGER NOT NULL DEFAULT 0,
    use_count INTEGER NOT NULL DEFAULT 0,
    created_by UUID NOT NULL REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ
);

-- Tags table
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    color VARCHAR(7) NOT NULL DEFAULT '#808080',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Knowledge tags junction table
CREATE TABLE knowledge_tags (
    knowledge_id UUID NOT NULL REFERENCES knowledge_base(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (knowledge_id, tag_id)
);

-- Call logs table
CREATE TABLE call_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operator_id UUID NOT NULL REFERENCES users(id),
    customer_id VARCHAR(100),
    transcript TEXT,
    summary TEXT,
    metadata JSONB NOT NULL DEFAULT '{}',
    duration INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Knowledge usage tracking
CREATE TABLE knowledge_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    knowledge_id UUID NOT NULL REFERENCES knowledge_base(id),
    call_log_id UUID REFERENCES call_logs(id),
    operator_id UUID NOT NULL REFERENCES users(id),
    used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    helpful BOOLEAN
);

-- Knowledge feedback
CREATE TABLE knowledge_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    knowledge_id UUID NOT NULL REFERENCES knowledge_base(id),
    user_id UUID NOT NULL REFERENCES users(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Approval workflows
CREATE TABLE approval_workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    knowledge_id UUID NOT NULL REFERENCES knowledge_base(id),
    requested_by UUID NOT NULL REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    status approval_status NOT NULL DEFAULT 'pending',
    comments TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_knowledge_search ON knowledge_base USING GIN(search_text);
CREATE INDEX idx_knowledge_embedding ON knowledge_base USING ivfflat(embedding vector_cosine_ops);
CREATE INDEX idx_knowledge_status ON knowledge_base(status) WHERE status = 'published';
CREATE INDEX idx_knowledge_category ON knowledge_base(category_id);
CREATE INDEX idx_call_logs_operator ON call_logs(operator_id);
CREATE INDEX idx_call_logs_created ON call_logs(created_at DESC);
CREATE INDEX idx_knowledge_usage ON knowledge_usage(knowledge_id, used_at);

-- Create update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_knowledge_base_updated_at BEFORE UPDATE ON knowledge_base 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_approval_workflows_updated_at BEFORE UPDATE ON approval_workflows 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create full text search update function
CREATE OR REPLACE FUNCTION update_knowledge_search_text()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_text := to_tsvector('japanese', 
        NEW.title || ' ' || 
        COALESCE(NEW.content->>'body', '') || ' ' ||
        COALESCE(NEW.content->>'keywords', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply search text trigger
CREATE TRIGGER update_knowledge_search_text BEFORE INSERT OR UPDATE ON knowledge_base
    FOR EACH ROW EXECUTE FUNCTION update_knowledge_search_text();

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_workflows ENABLE ROW LEVEL SECURITY;

-- Policies will be added based on specific requirements