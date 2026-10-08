
import { Tldraw, useEditor, Editor, TLEditorSnapshot, getSnapshot, loadSnapshot, TLAssetStore } from 'tldraw'
import { useSyncDemo, useSync } from '@tldraw/sync'
import { useEffect, useState } from 'react'



const multiplayerAssetStore: TLAssetStore = {
    async upload(_asset, file) {
        return { src: '' }
    },

    resolve(asset) {
        return asset.props.src
    },
}

export default function Whiteboard({ lessonId }: { lessonId: string }) {
    const [editor, setEditor] = useState<Editor | null>(null);
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.aimperia.org";
    const store = useSync({ uri: `${API_BASE_URL}/connect/${lessonId}`, assets: multiplayerAssetStore })
    
    useEffect(() => {
        if (!store) return;
        if (editor) {
            editor.updateInstanceState({ isReadonly: true });
            console.log('Editor mounted', editor);
        }
    }, [store]);
    
    return (
        <Tldraw
            onMount={(editor) => {
                editor.updateInstanceState({ isReadonly: true })
                console.log('Editor mounted', editor);
                setEditor(editor);
            }}
            store={store}
        />
    );
    
    
}