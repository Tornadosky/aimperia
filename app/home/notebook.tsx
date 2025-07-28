"use client";

import { useEffect, useState } from "react";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import katex from 'katex';
import "katex/dist/katex.min.css";
import styles from "./notebook.module.css"; // Ensure this is imported to apply styles
import MDEditor from "@uiw/react-md-editor";
import MarkdownPreview from '@uiw/react-markdown-preview';
import { EditFilled, CloseCircleOutlined, SaveOutlined } from "@ant-design/icons";
import { Button } from "antd";

import { Lesson } from "./page";

export default function Notebook({ selectedLesson, user }: { selectedLesson: Lesson|null, user: any }) {
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
        <div className={styles.notebookContainer} data-color-mode="light">
            
            
            {user?.role=== 'teacher'?
                <div className={styles.buttonsContainer}>
                    {editing ? (
                        <>
                            <Button
                                onClick={handleCancel}
                                disabled={saving}
                                className={styles.button}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={saving}
                                icon={<SaveOutlined />}
                                type="primary"
                                className={styles.button}
                            >
                                {saving ? "Saving..." : "Save"}
                            </Button>
                        </>
                    ) : (
                        <Button
                                onClick={() => setEditing(true)}
                                icon={<EditFilled />}
                                className={styles.button}
                        >
                            Edit
                        </Button>
                    )}
                </div>
                :
                null}
            {editing ? (
                <MDEditor
                    className={styles.markdownEditor}
                    value={draft}
                    onChange={(val) => setDraft(val ?? "")}
                    previewOptions={{
                        remarkPlugins: [remarkGfm, remarkMath],
                        rehypePlugins: [rehypeRaw, rehypeKatex],
                    }}
                />
            ) : (
                <MarkdownPreview
                    source={content}
                    className={styles.markdownPreview}
                    rehypePlugins={[rehypeRaw, rehypeKatex]}
                    remarkPlugins={[remarkGfm, remarkMath]}
                    wrapperElement={{
                        'data-color-mode': 'light',
                        className: 'markdown-wrapper',
                        }}
                    />
                )
            }
        </div>
    );
}
