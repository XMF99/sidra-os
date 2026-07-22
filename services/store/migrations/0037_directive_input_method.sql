-- M19 Voice Directive: 0037_directive_input_method.sql
-- Additive input_method column on directives table defaulting to 'typed'
-- Ref: VOICE_DIRECTIVE_ARCHITECTURE.md §11.1, ADR-0052, ADR-0053

ALTER TABLE directives ADD COLUMN input_method TEXT NOT NULL DEFAULT 'typed' CHECK (input_method IN ('typed', 'voice'));
