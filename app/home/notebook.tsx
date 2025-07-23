"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import "./notebook.css";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "antd";

export default function Notebook() {
    const [content, setContent] = useState("");
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch("/notebook.md")
            .then((res) => res.text())
            .then((text) => {
                setContent(text);
                setDraft(text);
            })
            .catch((err) => console.error("Error loading markdown:", err));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await fetch("/api/save-notebook", {
                method: "POST",
                headers: { "Content-Type": "text/plain" },
                body: draft,
            });
            setContent(draft);
            setEditing(false);
        } catch (err) {
            console.error("Error saving markdown:", err);
            alert("Failed to save changes.");
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setDraft(content);
        setEditing(false);
    };

    return (
        <div className="prose">
            <div className="flex justify-end mb-4 space-x-2">
                {editing ? (
                    <>
                        <Button
                            onClick={handleCancel}
                            disabled={saving}
                            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                            {saving ? "Saving..." : "Save"}
                        </Button>
                    </>
                ) : (
                    <Button
                        onClick={() => setEditing(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Edit
                    </Button>
                )}
            </div>

            {editing ? (
                <MDEditor
                    value={draft}
                    onChange={(val) => setDraft(val ?? "")}
                    height={window.innerHeight * 0.7}
                    textareaProps={{
                        className: "prose prose-lg leading-relaxed",
                    }}
                />
            ) : (
                <div className="prose prose-lg leading-relaxed">
                    <ReactMarkdown
                            remarkPlugins={[remarkGfm, remarkMath]}
                            rehypePlugins={[rehypeRaw, rehypeKatex]}
                    >
                        {content}
                    </ReactMarkdown>
                </div>
            )}
        </div>
    );
}
