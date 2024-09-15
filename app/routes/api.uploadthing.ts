import {
  createRouteHandler,
  createUploadthing,
  type FileRouter,
} from 'uploadthing/remix'

const f = createUploadthing()

const uploadRouter = {
  imageUploader: f({ image: { maxFileSize: '8MB' } }).onUploadComplete(
    async ({ file }) => {
      return { url: file.url }
    },
  ),
} satisfies FileRouter

export type UploadRouter = typeof uploadRouter

export const { action, loader } = createRouteHandler({
  router: uploadRouter,
})
