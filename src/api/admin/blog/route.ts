import type {
    MedusaRequest,
    MedusaResponse,
  } from "@medusajs/framework/http"
import { createPostWorkflow } from "../../../workflows/create-post"
  
type PostRequestBody = {
    title: string
}
  
export const POST = async (
    req: MedusaRequest<PostRequestBody>,
    res: MedusaResponse
) => {
    const { result } = await createPostWorkflow(req.scope).run({
        input: req.validatedBody,
    })
    return res.json(result)
}