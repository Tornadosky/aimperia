"use client";

import { useEffect, useState, useRef } from "react";
import { useTranslations } from 'next-intl';
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import katex from 'katex';
import "katex/dist/katex.min.css";
import styles from "./notebook.module.css"; // Ensure this is imported to apply styles
import MDEditor, { commands } from "@uiw/react-md-editor";
import { executeCommand as executeCommand2 } from "@uiw/react-md-editor";
import MarkdownPreview from '@uiw/react-markdown-preview';
import { EditFilled, CloseCircleOutlined, SaveOutlined } from "@ant-design/icons";
import { Button, message } from "antd";
import { updateLessonSummary, uploadLessonSummaryImage } from "@/app/lib/lessons";

import { Lesson } from "./page";

const PublicMDEditorData = {
    command: null as commands.ICommand<string> | null,
    executeCommand: null as ( (command: commands.ICommand<string>, groupName?: string) => void ) | null,
}

export default function Notebook({ selectedLesson, lessonContent, user }: { selectedLesson: Lesson|null, lessonContent: string, user: any }) {
    const t = useTranslations('Home.notebook');
    const [content, setContent] = useState("");
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setContent(lessonContent);
        setDraft(lessonContent);
    }, [lessonContent]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const result = await updateLessonSummary(selectedLesson?.id || "", {summaryContent:draft});
            if (!result.id) {
                message.error(t('errors.saveFailed'));
            }
            else {
                setContent(draft);
                setEditing(false);
            }
            
        } catch (err) {
            console.error("Error saving markdown:", err);
            message.error(t('errors.saveFailed'));
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setDraft(content);
        setEditing(false);
    };
    
    const handleImageUpload = (
        file: File,
        command: commands.ICommand<string>,
        executeCommand: (command: commands.ICommand<string>, groupName?: string) => void
    ) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            console.log("FileReader result:", e.target?.result);
            const result = await uploadLessonSummaryImage(selectedLesson?.id || "", {
                fileName: file.name,
                dataUrl: e.target?.result as string,
            });
            if (result.url) {
                const imageMarkdown = `![${file.name}](${result.url})`;
                command.execute = (state, api) => {
                    executeCommand2({
                        api,
                        selectedText: '',
                        selection: state.selection,
                        prefix: imageMarkdown,
                        suffix: ''
                    })
                }
                
                executeCommand(command, command.groupName);
            }
        };
        reader.readAsDataURL(file);
    };
    
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    return (
        <div className={styles.notebookContainer} data-color-mode="light">
            <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    console.log(file,PublicMDEditorData.command, PublicMDEditorData.executeCommand)
                    if (file && PublicMDEditorData.command && PublicMDEditorData.executeCommand) {
                        handleImageUpload(file, PublicMDEditorData.command, PublicMDEditorData.executeCommand);
                    }
                    e.target.value = "";
                }}
            />
            
            {user?.role=== 'teacher' && lessonContent?
                <div className={styles.buttonsContainer}>
                    {editing ? (
                        <>
                            <Button
                                onClick={handleCancel}
                                disabled={saving}
                                className={styles.button}
                            >
                                {t('buttons.cancel')}
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={saving}
                                icon={<SaveOutlined />}
                                type="primary"
                                className={styles.button}
                            >
                                {saving ? t('buttons.saving') : t('buttons.save')}
                            </Button>
                        </>
                    ) : (
                        <Button
                                onClick={() => setEditing(true)}
                                icon={<EditFilled />}
                                className={styles.button}
                        >
                            {t('buttons.edit')}
                        </Button>
                    )}
                </div>
                :
                null}
            {lessonContent ?
                editing ? (
                    <MDEditor
                        className={styles.markdownEditor}
                        value={draft}
                        onChange={(val) => setDraft(val ?? "")}
                        previewOptions={{
                            remarkPlugins: [remarkGfm, remarkMath],
                            rehypePlugins: [rehypeRaw, rehypeKatex],
                        }}
                        components={{
                            toolbar: (command, disabled, executeCommand) => {
                                if (command.keyCommand === 'image') {
                                    return (
                                        <button type="button" data-name="image" aria-label="Add image (ctrl + k)" title="Add image (ctrl + k)"
                                            onClick={(evn) => {
                                                evn.stopPropagation();
                                                console.log('1')
                                                PublicMDEditorData.command = command;
                                                PublicMDEditorData.executeCommand = executeCommand;
                                                console.log(fileInputRef.current)
                                                setTimeout(() => {
                                                    fileInputRef.current?.click();
                                                }, 0);
                                            }}
                                        >
                                            <svg width="13" height="13" viewBox="0 0 20 20"><path fill="currentColor" d="M15 9c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm4-7H1c-.55 0-1 .45-1 1v14c0 .55.45 1 1 1h18c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1zm-1 13l-6-5-2 2-4-5-4 8V4h16v11z"></path></svg>
                                        </button>
                                    )
                                }
                            }
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
                
            :
                <div className={styles.emptyState}>
                    <h2>{t('emptyState.title')}</h2>
                    <p>{t('emptyState.description')}</p>
                </div>
            }
            
        </div>
    );
}