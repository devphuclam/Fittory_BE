import { z } from "zod"
export const PostAdminCreateBlog = z.object({
  title: z.string(),
})