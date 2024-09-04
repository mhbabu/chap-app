import React from 'react';
import { PaperClipIcon } from '@heroicons/react/24/outline';
import { formateBytes, isPDF, isPreviewable } from '@/helpers';

export default function AttachmentPreview({ file }) {
  return (
    <div className="w-full flex items-center gap-2 py-2 pz-3 rounded-md bg-slate-800">
      <div>
        {isPDF(file.file) && <img src="/img/pdf.png" className='w-8' />}
        {!isPreviewable(file.file) && (
          <div className="flex justify-center items-center w-10 h-q0 bg-gray-700 rounded">
            <PaperClipIcon className='w-6' />
          </div>
        )}
      </div>
      <div className="felx-1 text-gray-400 text-nowrap text-ellipsis overflow-hidden">
        <h3>{file.file.name}</h3>
        <p className='text-xs'>{formateBytes(file.file.size)}</p>
      </div>
    </div>
  )
}
