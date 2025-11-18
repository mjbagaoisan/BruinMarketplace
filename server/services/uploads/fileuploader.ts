
import path from "path";
import { supabase } from "../db";
// Create 'avatars' bucket
const { data: avatarsData, error: avatarsError } = await supabase
    .storage
    .createBucket('avatars', {
        public: false,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif'],
        fileSizeLimit: 5 * 1024 * 1024 // 5MB    
    });
// Create 'listings' bucket
const {data: listingsData, error: listingsError} = await supabase
    .storage
    .createBucket('listings', {
        public: false,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'],
        fileSizeLimit: 10 * 1024 * 1024 // 10MB    
    });



export async function uploadAvatarImage( opts: { userId: string; file: File | Blob;}) {

    const { userId, file } = opts;

    const fileExtension = (file as File).name?.split('.').pop() || "png";
    const filePath = `${userId}/${Date.now()}-avatar.${fileExtension}`;


    const { data, error } = await supabase.storage
    
    .from ('avatars')
    .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: (file as File).type || 'image/png',
    });


    if (error) {
        console.error('Error uploading avatar image:', error);
        throw error;
    }

    const {data: publicUrlData} = await supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);


    return {
        path: data?.path ?? filePath,
        publicUrl: publicUrlData?.publicUrl
    };
}
    

export async function uploadListingMedia( opts: { listingId: string; file: File | Blob;}) {
    const { listingId, file } = opts;
    
    const fileName = (file as File).name 
    const fileExtension = fileName.split('.').pop() || 'bin';
    
    const validTypes = ["jpg", "jpeg", "png", "mp4"]; // Different usage from avatar upload bc/ of mp4 allowance.
    if (!validTypes.includes(fileExtension.toLowerCase())) {
        throw new Error('Invalid file type. Only JPG, PNG, and MP4 files are allowed.');
    }
    
    const filePath = `${listingId}/${Date.now()}.${fileExtension}`;

     const { data, error } = await supabase.storage
        .from('listings')
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: (file as File).type || 
            (fileExtension === 'mp4' ? 'video/mp4' : 'image/png'),
        });
    if (error) {
        console.error('Error uploading listing media:', error);
        throw error; }
    
    const {data: publicUrlData} = await supabase.storage
        .from('listings')
        .getPublicUrl(filePath);
    
    return {
        path: data?.path ?? filePath,
        publicUrl: publicUrlData?.publicUrl,
        type: fileExtension === 'mp4' ? 'video' : 'image'
    };

    }



    







