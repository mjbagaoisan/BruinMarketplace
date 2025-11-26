import { createClient } from "@/utils/supabase/server";

interface GoogleUser {
    id: string;
    email: string;
    name: string;
    image?: string;
}

interface userData {
    id: string;
    name: string;
    email: string;
    profile_image_url?: string | null;
    class_year?: number | null;
    hide_class_year: boolean;
    major?: string | null;
    hide_major: boolean;
    role: string;
    is_verified: boolean;
    created_at: string;
    updated_at: string;
}

export const userService = {
    async findByEmail(email: string) {
        const supabase = await createClient()
        const { data, error } = await supabase.from("users").select("*").eq("email", email).maybeSingle();


        if (error && error.code !== 'PGRST116') {
            throw error;
        }
        return data || null;
    },

    async createUser(userData: userData) {
        const supabase = await createClient()
        const { data, error } = await supabase.from("users").insert([userData]).select().maybeSingle();

        if (error) {
            throw error
        }
        return data || null;
    },

    async updateUser(id: string, update: Partial<userData>) {
        const supabase = await createClient()
        const { data, error } = await supabase.from("users").update(update).eq("id", id).select().maybeSingle();

        if (error) {
            throw error
        }
        return data || null;
    },
    
    async createOrUpdateUser(googleProfile: GoogleUser) {
        const existingUser = await this.findByEmail(googleProfile.email);
        if (existingUser) {
            return await this.updateUser(existingUser.id, {
                name: googleProfile.name,
                profile_image_url: googleProfile.image || null
            });
        } else {
            return await this.createUser({
                id: googleProfile.id,
                name: googleProfile.name,
                email: googleProfile.email,
                profile_image_url: googleProfile.image || null,
                class_year: null,
                hide_class_year: false,
                major: null,
                hide_major: false,
                role: 'user',
                is_verified: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
        }
    }
};