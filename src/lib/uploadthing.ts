import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

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
            console.log("File URL:", file.ufsUrl);

            return { uploadedBy: metadata.user.userId, url: file.ufsUrl };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;