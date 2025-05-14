"use client";

import { useState } from "react";

export default function SendCvButton() {
    const handleSendCV = () => {
        const subject = encodeURIComponent("Speculative Application for Snytra");
        const body = encodeURIComponent(
            "Dear Hiring Team,\n\nI am writing to express my interest in joining Snytra. Please find my CV attached.\n\nBriefly, I would be a great fit for your team because...\n\nKind regards,\n[Your Name]"
        );

        // Open email client directly with JavaScript
        window.location.href = `mailto:careers@snytra.com?subject=${subject}&body=${body}`;
    };

    return (
        <button
            onClick={handleSendCV}
            className="inline-block bg-primary text-white font-semibold px-6 py-3 rounded-md hover:bg-primary-dark transition duration-200"
        >
            Send your CV
        </button>
    );
} 