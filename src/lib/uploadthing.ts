import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";

const f = createUploadthing();

const handleAuth = async () => {
    try {
        const session = await getServerSession(authOptions);
        // For development purposes, allow uploads even without authentication
        return { userId: session?.user?.id || "anonymous", role: session?.user?.role || "anonymous" };
    } catch (error) {
        console.error("Auth error in UploadThing:", error);
        // For development purposes, return a fallback user
        return { userId: "anonymous", role: "anonymous" };
    }
};

export const ourFileRouter = {
    // Public image uploader for menu items, etc.
    imageUploader: f({ image: { maxFileSize: "4MB" } }, { awaitServerData: true })
        .middleware(async () => {
            const user = await handleAuth();
            return { user };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            console.log("Upload complete for userId:", metadata.user.userId);
            console.log("File URL:", file.url);

            // Store upload information in database for recent images
            try {
                await db.sql`
                    INSERT INTO uploaded_files (
                        filename, 
                        original_filename, 
                        file_path, 
                        file_size, 
                        file_type, 
                        uploaded_at
                    ) VALUES (
                        ${file.key}, 
                        ${file.name}, 
                        ${file.url}, 
                        ${file.size}, 
                        ${file.type || 'image/unknown'}, 
                        NOW()
                    )
                `;
                console.log("Upload info stored in database");
            } catch (error) {
                console.error("Error storing upload info:", error);
            }

            return { uploadedBy: metadata.user.userId, url: file.url };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;