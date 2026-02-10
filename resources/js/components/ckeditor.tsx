// import { CKEditor as CKEditorOriginal } from 'ckeditor4-react';

// export function CKEditor({
//     config,
//     onValueChange,
//     key,
//     data,
//     id,
//     ...props
// }: Omit<React.ComponentProps<typeof CKEditorOriginal>, 'onChange' | 'data'> & {
//     onValueChange: (value: string) => void;
//     key?: string | number;
//     data: string;
//     id?: string;
// }) {
//     // CKEDITOR.env.isCompatible = true;
//     // CKEDITOR.config.extraPlugins = 'uploadimage';
//     // CKEDITOR.config.uploadUrl = "{{ route('UploadCKEditor') }}";
//     // CKEDITOR.config.format_tags = 'p;h1;h2;h3;pre';

//     return (
//         <div id={id}>
//             <CKEditorOriginal
//                 editorUrl={'/ckeditor/ckeditor.js'}
//                 data={data}
//                 config={{
//                     language: 'id',
//                     versionCheck: false,
//                     removePlugins: 'exportpdf',
//                     removeButtons: 'Anchor,Subscript,Superscript,ExportPdf,Find,Replace,SelectAll,Scayt',
//                     removeDialogTabs: 'image:advanced;link:advanced',
//                     toolbarGroups: [
//                         {
//                             name: 'clipboard',
//                             groups: ['clipboard', 'undo'],
//                         },
//                         // {
//                         //     name: 'editing',
//                         //     groups: ['find', 'selection' /*, 'spellchecker'*/],
//                         // },
//                         // {
//                         //     name: 'links',
//                         // },
//                         // {
//                         //     name: 'insert',
//                         // },
//                         // {
//                         //     name: 'forms',
//                         // },
//                         // {
//                         //     name: 'tools',
//                         // },
//                         // {
//                         //     name: 'document',
//                         //     groups: ['mode', 'document', 'doctools'],
//                         // },
//                         {
//                             name: 'others',
//                         },
//                         '/',
//                         {
//                             name: 'basicstyles',
//                             groups: ['basicstyles', 'cleanup'],
//                         },
//                         {
//                             name: 'paragraph',
//                             groups: ['list', 'indent', 'blocks', 'align' /*, 'bidi'*/],
//                         },
//                         // {
//                         //     name: 'styles',
//                         // },
//                         // {
//                         //     name: 'colors',
//                         // },
//                         // {
//                         //     name: 'about',
//                         // },
//                     ],
//                     className: 'rounded-md',
//                     ...config,
//                 }}
//                 onChange={onValueChange ? (e: any) => onValueChange(e.editor.getData()) : undefined}
//                 onBeforeLoad={(CKEDITOR: any) => {
//                     CKEDITOR.disableAutoInline = true;
//                 }}
//                 {...props}
//             />
//         </div>
//     );
// }

import { CKEditor as CKEditorOriginal } from 'ckeditor4-react';

export function CKEditor({
    config,
    onValueChange,
    ...props
}: Omit<React.ComponentProps<typeof CKEditorOriginal>, 'onChange'> & {
    onValueChange: (value: string) => void;
}) {
    // CKEDITOR.env.isCompatible = true;
    // CKEDITOR.config.extraPlugins = 'uploadimage';
    // CKEDITOR.config.uploadUrl = "{{ route('UploadCKEditor') }}";
    // CKEDITOR.config.format_tags = 'p;h1;h2;h3;pre';

    return (
        <div>
            <CKEditorOriginal
                editorUrl={'/ckeditor/ckeditor.js'}
                config={{
                    language: 'id',
                    versionCheck: false,
                    removePlugins: 'exportpdf',
                    // removeButtons: 'Anchor,Subscript,Superscript',
                    // removeDialogTabs: 'image:advanced;link:advanced',
                    // toolbarGroups: [
                    //     {
                    //         name: 'clipboard',
                    //         groups: ['clipboard', 'undo'],
                    //     },
                    //     {
                    //         name: 'editing',
                    //         groups: ['find', 'selection' /*, 'spellchecker'*/],
                    //     },
                    //     // {
                    //     //     name: 'links',
                    //     // },
                    //     // {
                    //     //     name: 'insert',
                    //     // },
                    //     // {
                    //     //     name: 'forms',
                    //     // },
                    //     // {
                    //     //     name: 'tools',
                    //     // },
                    //     // {
                    //     //     name: 'document',
                    //     //     groups: ['mode', 'document', 'doctools'],
                    //     // },
                    //     {
                    //         name: 'others',
                    //     },
                    //     '/',
                    //     {
                    //         name: 'basicstyles',
                    //         groups: ['basicstyles', 'cleanup'],
                    //     },
                    //     {
                    //         name: 'paragraph',
                    //         groups: ['list', 'indent', 'blocks', 'align' /*, 'bidi'*/],
                    //     },
                    //     // {
                    //     //     name: 'styles',
                    //     // },
                    //     // {
                    //     //     name: 'colors',
                    //     // },
                    //     // {
                    //     //     name: 'about',
                    //     // },
                    // ],
                    className: 'rounded-md',
                    ...config,
                }}
                onChange={onValueChange ? (e: any) => onValueChange(e.editor.getData()) : undefined}
                {...props}
            />
        </div>
    );
}

