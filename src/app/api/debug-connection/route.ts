
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
    const results: any = {
        checks: {},
        env: {},
        error: null,
    };

    try {
        // 1. Check Env Vars availability (masked)
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        results.env = {
            NEXT_PUBLIC_SUPABASE_URL: url ? (url.length > 10 ? `${url.substring(0, 8)}...` : 'SHORT_VALUE') : 'MISSING',
            NEXT_PUBLIC_SUPABASE_ANON_KEY: key ? (key.length > 10 ? `${key.substring(0, 5)}...` : 'SHORT_VALUE') : 'MISSING',
        };

        // 2. Format Validation
        if (!url || !url.startsWith('https://')) {
            throw new Error(`Invalid URL format: ${url}`);
        }

        // 3. Client Initialization
        const supabase = createClient(url || '', key || '');
        results.checks.clientInitialized = true;

        // 4. Connection Test
        // Try to fetch a non-existent table or just a lightweight query
        // We'll try to get session or just a simple query
        const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
        // If 'users' doesn't exist, it might error, but it proves connection. 
        // Better to check something generic. 
        // Supabase usually has auth.users but we can't select validly from client without rights.
        // Let's try a health check or a known public table, but we don't know the schema.
        // We'll just catch the error. If it's "Table not found", connection worked!
        // If it's "FetchError" or "Invalid URL", connection failed.

        results.checks.connectionAttempt = {
            data,
            error: error ? { message: error.message, code: error.code, details: error.details } : null
        };

        return NextResponse.json(results);
    } catch (err: any) {
        return NextResponse.json({
            ...results,
            error: {
                message: err.message,
                stack: err.stack,
            }
        }, { status: 500 }); // Return 500 but with JSON body
    }
}
