import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://rbelmynhqpfmkmwcegrn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiZWxteW5ocXBmbWttd2NlZ3JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNzcyMjMsImV4cCI6MjA2ODg1MzIyM30.28nVyFMV09BxdY27F7W_8LTpDwPKzEIPKgpKrTnQKbI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
    try {
        console.log('Testing login with existing user...');
        
        const { data, error } = await supabase.auth.signInWithPassword({
            email: 'shuvo@admin.com',
            password: '123456'
        });
        
        if (error) {
            console.error('Login error:', error);
        } else {
            console.log('Login successful!');
            console.log('User ID:', data.user.id);
            console.log('Email:', data.user.email);
        }
        
    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

testLogin();