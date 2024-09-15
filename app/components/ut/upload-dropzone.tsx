import { generateUploadDropzone } from '@uploadthing/react'

import type { UploadRouter } from '~/routes/api.uploadthing'

export const UploadDropzone = generateUploadDropzone<UploadRouter>()
