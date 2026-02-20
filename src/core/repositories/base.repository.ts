// ── Base Repository ────────────────────────────────────────
// Generic Supabase CRUD abstraction.
// All entity repositories extend this.

import { supabase } from '@/lib/supabase';
import { AppError } from '@/core/errors/errors';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export class BaseRepository<T extends {}> {
    constructor(protected readonly table: string) { }

    protected get db() {
        if (!supabase) {
            throw AppError.serviceUnavailable('Database not configured');
        }
        return supabase;
    }

    async findAll(orderBy?: string, ascending = false): Promise<T[]> {
        let query = this.db.from(this.table).select('*');
        if (orderBy) {
            query = query.order(orderBy, { ascending });
        }
        const { data, error } = await query;
        if (error) throw AppError.db(`Failed to fetch ${this.table}`, error);
        return (data ?? []) as T[];
    }

    async findById(id: string): Promise<T | null> {
        const { data, error } = await this.db
            .from(this.table)
            .select('*')
            .eq('id', id)
            .single();
        if (error && error.code !== 'PGRST116') {
            throw AppError.db(`Failed to fetch ${this.table} by id`, error);
        }
        return (data ?? null) as T | null;
    }

    async findSingleton(): Promise<T | null> {
        const { data, error } = await this.db
            .from(this.table)
            .select('*')
            .limit(1)
            .single();
        if (error && error.code !== 'PGRST116') {
            throw AppError.db(`Failed to fetch ${this.table}`, error);
        }
        return (data ?? null) as T | null;
    }

    async create(input: Partial<T>): Promise<T> {
        const { data, error } = await this.db
            .from(this.table)
            .insert([input as Record<string, unknown>])
            .select()
            .single();
        if (error) throw AppError.db(`Failed to create ${this.table}`, error);
        return data as T;
    }

    async update(id: string, input: Partial<T>): Promise<T> {
        const { data, error } = await this.db
            .from(this.table)
            .update(input as Record<string, unknown>)
            .eq('id', id)
            .select()
            .single();
        if (error) throw AppError.db(`Failed to update ${this.table}`, error);
        return data as T;
    }

    async upsertSingleton(input: Partial<T>): Promise<T> {
        // For singleton tables: fetch existing, update if exists, insert if not
        const existing = await this.findSingleton();
        if (existing && 'id' in existing) {
            return this.update(existing.id as string, {
                ...input,
                updated_at: new Date().toISOString(),
            } as Partial<T>);
        }
        return this.create(input);
    }

    async delete(id: string): Promise<void> {
        const { error } = await this.db
            .from(this.table)
            .delete()
            .eq('id', id);
        if (error) throw AppError.db(`Failed to delete ${this.table}`, error);
    }

    async upsert(rows: Partial<T>[], conflictColumn: string): Promise<void> {
        const { error } = await this.db
            .from(this.table)
            .upsert(rows as Record<string, unknown>[], { onConflict: conflictColumn });
        if (error) throw AppError.db(`Failed to upsert ${this.table}`, error);
    }

    get isConfigured(): boolean {
        return !!supabase;
    }
}
